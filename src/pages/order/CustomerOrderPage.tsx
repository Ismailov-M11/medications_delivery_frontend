import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import {
  getOrderByToken,
  confirmOrderByToken,
  selectCourierByToken,
  Order,
  CourierType,
} from '@/api/orders'
import { YandexMap } from '@/components/YandexMap'
import { StatusBar } from '@/components/StatusBar'
import { StatusBadge } from '@/components/StatusBadge'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import {
  Pill,
  MapPin,
  Phone,
  User,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Package,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Step 1 form schema
const step1Schema = z.object({
  customerName: z.string().min(2, 'required'),
  customerPhone: z.string().min(9, 'invalidPhone'),
  customerAddress: z.string().min(5, 'required'),
  customerComment: z.string().optional(),
  customerLat: z.coerce.number().optional(),
  customerLng: z.coerce.number().optional(),
})

type Step1Form = z.infer<typeof step1Schema>

// Courier options
interface CourierOption {
  id: CourierType
  nameKey: string
  color: string
  bgColor: string
  borderColor: string
  deliveryPrice: number
  icon: string
}

const COURIER_OPTIONS: CourierOption[] = [
  {
    id: 'yandex',
    nameKey: 'courier.yandex',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-400',
    deliveryPrice: 3500,
    icon: '🚖',
  },
  {
    id: 'noor',
    nameKey: 'courier.noor',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-400',
    deliveryPrice: 3000,
    icon: '🏍️',
  },
  {
    id: 'millennium',
    nameKey: 'courier.millennium',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
    deliveryPrice: 4000,
    icon: '🚗',
  },
]

type Step = 1 | 2

export function CustomerOrderPage() {
  const { token } = useParams<{ token: string }>()
  const { t } = useTranslation()

  const [step, setStep] = useState<Step>(1)
  const [step1Data, setStep1Data] = useState<Step1Form | null>(null)
  const [selectedCourier, setSelectedCourier] = useState<CourierType | null>(null)
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['order', token],
    queryFn: () => getOrderByToken(token!),
    enabled: !!token,
    retry: 1,
  })

  const order = confirmedOrder ?? data?.data

  // Step 1 mutation: confirm order with customer details
  const confirmMutation = useMutation({
    mutationFn: (formData: Step1Form) =>
      confirmOrderByToken(token!, {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        customerComment: formData.customerComment,
        customerLat: formData.customerLat,
        customerLng: formData.customerLng,
      }),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Move to step 2 without setting confirmed order
        setStep(2)
      }
    },
  })

  // Step 2 mutation: select courier
  const courierMutation = useMutation({
    mutationFn: ({
      courier,
      deliveryPrice,
    }: {
      courier: CourierType
      deliveryPrice: number
    }) =>
      selectCourierByToken(token!, { courier, deliveryPrice }),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setConfirmedOrder(response.data)
      }
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
  })

  const handleMapLocationSelect = useCallback(
    (coords: [number, number], address: string) => {
      setValue('customerLat', coords[0])
      setValue('customerLng', coords[1])
      setValue('customerAddress', address)
    },
    [setValue],
  )

  const onStep1Submit = (formData: Step1Form) => {
    setStep1Data(formData)
    confirmMutation.mutate(formData)
  }

  const onConfirmCourier = () => {
    if (!selectedCourier) return
    const courierOption = COURIER_OPTIONS.find((c) => c.id === selectedCourier)!
    courierMutation.mutate({
      courier: selectedCourier,
      deliveryPrice: courierOption.deliveryPrice,
    })
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  // Error
  if (isError || !data?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="font-medium text-gray-700">{t('common.error')}</p>
            <Button variant="outline" onClick={() => refetch()}>
              {t('common.retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentOrder = order!

  // If order is confirmed/beyond (confirmed order) → show tracking view
  const isConfirmedOrBeyond =
    confirmedOrder !== null ||
    (currentOrder.status !== 'pending' &&
      currentOrder.status !== 'confirmed')

  // If the customer already confirmed (status != pending), show the read-only tracking page
  if (isConfirmedOrBeyond || (currentOrder.status !== 'pending' && !confirmedOrder)) {
    return (
      <TrackingPage
        order={confirmedOrder ?? currentOrder}
        t={t}
      />
    )
  }

  const selectedCourierOption = COURIER_OPTIONS.find(
    (c) => c.id === selectedCourier,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-1.5 rounded-lg">
              <Pill className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">MedDelivery</span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold',
              step === 1
                ? 'bg-blue-500 text-white'
                : 'bg-blue-100 text-blue-700',
            )}
          >
            <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px]">
              1
            </span>
            {t('customer.step1')}
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold',
              step === 2
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-500',
            )}
          >
            <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px]">
              2
            </span>
            {t('customer.step2')}
          </div>
        </div>

        {/* Pharmacy Info Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {t('customer.pharmacyInfo')}
                </p>
                {currentOrder.pharmacyName && (
                  <p className="font-semibold text-gray-900">
                    {currentOrder.pharmacyName}
                  </p>
                )}
                {currentOrder.pharmacyAddress && (
                  <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    {currentOrder.pharmacyAddress}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-1">
                {t('customer.medicinesDescription')}
              </p>
              <p className="text-sm text-gray-700">{currentOrder.pharmacyComment}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {t('pharmacy.medicinesTotal')}
                </p>
                <p className="font-bold text-blue-600">
                  {formatCurrency(currentOrder.medicinesTotal)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* STEP 1: Customer details form */}
        {step === 1 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold text-gray-900 mb-4">
                {t('customer.enterDetails')}
              </h2>

              <div className="mb-4">
                <p className="text-xs text-blue-600 flex items-center gap-1 mb-2">
                  <MapPin className="h-3 w-3" />
                  {t('customer.locationInstruction')}
                </p>
                <YandexMap
                  pharmacyCoords={
                    currentOrder.pharmacyLat && currentOrder.pharmacyLng
                      ? [currentOrder.pharmacyLat, currentOrder.pharmacyLng]
                      : undefined
                  }
                  onLocationSelect={handleMapLocationSelect}
                  height="260px"
                />
              </div>

              <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">
                    <User className="h-3 w-3 inline mr-1" />
                    {t('customer.name')} *
                  </Label>
                  <Input
                    id="customerName"
                    placeholder={t('customer.name')}
                    {...register('customerName')}
                    className={errors.customerName ? 'border-destructive' : ''}
                  />
                  {errors.customerName && (
                    <p className="text-xs text-destructive">
                      {t(
                        `validation.${errors.customerName.message || 'required'}`,
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">
                    <Phone className="h-3 w-3 inline mr-1" />
                    {t('customer.phone')} *
                  </Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="+998 90 000 00 00"
                    {...register('customerPhone')}
                    className={errors.customerPhone ? 'border-destructive' : ''}
                  />
                  {errors.customerPhone && (
                    <p className="text-xs text-destructive">
                      {t(
                        `validation.${errors.customerPhone.message || 'required'}`,
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerAddress">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {t('customer.address')} *
                  </Label>
                  <Input
                    id="customerAddress"
                    placeholder={t('customer.address')}
                    {...register('customerAddress')}
                    className={
                      errors.customerAddress ? 'border-destructive' : ''
                    }
                  />
                  {errors.customerAddress && (
                    <p className="text-xs text-destructive">
                      {t(
                        `validation.${errors.customerAddress.message || 'required'}`,
                      )}
                    </p>
                  )}
                </div>

                {/* Hidden coords — filled by map click */}
                <input type="hidden" {...register('customerLat')} />
                <input type="hidden" {...register('customerLng')} />

                <div className="space-y-2">
                  <Label htmlFor="customerComment">
                    <MessageSquare className="h-3 w-3 inline mr-1" />
                    {t('customer.comment')}
                  </Label>
                  <Textarea
                    id="customerComment"
                    placeholder={t('customer.comment')}
                    rows={2}
                    {...register('customerComment')}
                  />
                </div>

                {confirmMutation.isError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{t('common.error')}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={confirmMutation.isPending}
                >
                  {confirmMutation.isPending
                    ? t('common.loading')
                    : t('common.next')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Choose courier */}
        {step === 2 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold text-gray-900 mb-4">
                  {t('customer.chooseCourier')}
                </h2>
                <div className="space-y-3">
                  {COURIER_OPTIONS.map((courier) => {
                    const total = currentOrder.medicinesTotal + courier.deliveryPrice
                    const isSelected = selectedCourier === courier.id
                    return (
                      <div
                        key={courier.id}
                        onClick={() => setSelectedCourier(courier.id)}
                        className={cn(
                          'relative p-4 rounded-lg border-2 cursor-pointer transition-all',
                          isSelected
                            ? `${courier.bgColor} ${courier.borderColor}`
                            : 'border-gray-200 hover:border-gray-300 bg-white',
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle2
                              className={`h-5 w-5 ${courier.color}`}
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{courier.icon}</span>
                          <div className="flex-1">
                            <p className={`font-semibold ${courier.color}`}>
                              {t(courier.nameKey)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('courier.deliveryPrice')}:{' '}
                              {formatCurrency(courier.deliveryPrice)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {t('courier.total')}
                            </p>
                            <p className="font-bold text-gray-900">
                              {formatCurrency(total)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order summary */}
            {selectedCourierOption && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-blue-700 mb-2">
                    {t('order.detail')}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('order.medicinesAmount')}
                      </span>
                      <span>{formatCurrency(currentOrder.medicinesTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('order.deliveryPrice')}
                      </span>
                      <span>
                        {formatCurrency(selectedCourierOption.deliveryPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-blue-700 border-t pt-1 mt-1">
                      <span>{t('order.totalPrice')}</span>
                      <span>
                        {formatCurrency(
                          currentOrder.medicinesTotal +
                            selectedCourierOption.deliveryPrice,
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customer details recap */}
            {step1Data && (
              <Card>
                <CardContent className="p-4 space-y-2 text-sm">
                  <p className="font-medium text-gray-700">{t('customer.deliveryDetails')}</p>
                  <div className="flex gap-2 text-gray-600">
                    <User className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{step1Data.customerName}</span>
                  </div>
                  <div className="flex gap-2 text-gray-600">
                    <Phone className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{step1Data.customerPhone}</span>
                  </div>
                  <div className="flex gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{step1Data.customerAddress}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {courierMutation.isError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{t('common.error')}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
                disabled={courierMutation.isPending}
              >
                {t('common.back')}
              </Button>
              <Button
                className="flex-1"
                size="lg"
                disabled={!selectedCourier || courierMutation.isPending}
                onClick={onConfirmCourier}
              >
                {courierMutation.isPending
                  ? t('common.loading')
                  : t('customer.confirmOrder')}
              </Button>
            </div>

            {/* Payment note */}
            <p className="text-center text-xs text-muted-foreground">
              {/* TODO: Integrate MultiCard payment gateway here when available.
                  Currently confirming without actual payment processing. */}
              💳 Оплата будет доступна в ближайшее время
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Tracking page for confirmed orders
interface TrackingPageProps {
  order: Order
  t: (key: string) => string
}

function TrackingPage({ order, t }: TrackingPageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!order.trackingUrl) return
    try {
      await navigator.clipboard.writeText(order.trackingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = order.trackingUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-1.5 rounded-lg">
              <Pill className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">MedDelivery</span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Status header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t('order.token')}
                </p>
                <p className="font-mono font-bold text-gray-700">
                  #{order.token.substring(0, 8).toUpperCase()}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>
          </CardContent>
        </Card>

        {/* Status Bar */}
        {order.status !== 'pending' && (
          <Card>
            <CardContent className="p-4">
              <StatusBar status={order.status} />
            </CardContent>
          </Card>
        )}

        {/* Tracking URL */}
        {order.trackingUrl && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-green-700">
                {t('customer.trackingReady')}
              </p>
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-green-700 hover:underline font-medium break-all"
              >
                <ExternalLink className="h-4 w-4 flex-shrink-0" />
                {order.trackingUrl}
              </a>
              <div className="flex gap-2">
                <Button
                  asChild
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t('order.openTracking')}
                  </a>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="border-green-300"
                >
                  {copied ? t('common.copied') : t('common.copy')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order summary */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-gray-700">{t('order.detail')}</h3>

            {order.pharmacyName && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('pharmacy.pharmacyName')}
                </span>
                <span className="font-medium">{order.pharmacyName}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t('order.medicinesAmount')}
              </span>
              <span>{formatCurrency(order.medicinesTotal)}</span>
            </div>

            {order.deliveryPrice !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('order.deliveryPrice')}
                </span>
                <span>{formatCurrency(order.deliveryPrice)}</span>
              </div>
            )}

            {order.totalPrice !== undefined && (
              <div className="flex justify-between text-sm font-bold border-t pt-2 text-blue-700">
                <span>{t('order.totalPrice')}</span>
                <span>{formatCurrency(order.totalPrice)}</span>
              </div>
            )}

            {order.customerName && (
              <div className="pt-3 border-t space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t('order.customerInfo')}
                </p>
                <div className="flex gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                  <span>{order.customerName}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
                {order.customerAddress && (
                  <div className="flex gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                    <span>{order.customerAddress}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmed state success */}
        {order.status === 'confirmed' && !order.trackingUrl && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-blue-600 mx-auto" />
              <p className="text-sm font-semibold text-blue-700">
                {t('customer.orderConfirmed')}
              </p>
              <p className="text-xs text-blue-500">
                {t('steps.courierPickup')}...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
