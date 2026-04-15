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
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Step 2 form schema
const detailsSchema = z.object({
  customerName: z.string().min(2, 'required'),
  customerPhone: z.string().min(9, 'invalidPhone'),
  customerAddress: z.string().min(3, 'required'),
  customerComment: z.string().optional(),
})

type DetailsForm = z.infer<typeof detailsSchema>

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

type Step = 'map' | 'details' | 'courier'

export function CustomerOrderPage() {
  const { token } = useParams<{ token: string }>()
  const { t } = useTranslation()

  const [step, setStep] = useState<Step>('map')
  const [mapSelection, setMapSelection] = useState<{
    coords: [number, number]
    address: string
  } | null>(null)
  const [detailsData, setDetailsData] = useState<DetailsForm & {
    customerLat?: number
    customerLng?: number
  } | null>(null)
  const [selectedCourier, setSelectedCourier] = useState<CourierType | null>(null)
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['order', token],
    queryFn: () => getOrderByToken(token!),
    enabled: !!token,
    retry: 1,
  })

  const order = confirmedOrder ?? data?.data

  const confirmMutation = useMutation({
    mutationFn: (payload: Parameters<typeof confirmOrderByToken>[1]) =>
      confirmOrderByToken(token!, payload),
    onSuccess: (response) => {
      if (response.success) setStep('courier')
    },
  })

  const courierMutation = useMutation({
    mutationFn: (payload: { courier: CourierType; deliveryPrice: number }) =>
      selectCourierByToken(token!, payload),
    onSuccess: (response) => {
      if (response.success && response.data) setConfirmedOrder(response.data)
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
  })

  const handleMapSelect = useCallback(
    (coords: [number, number], address: string) => {
      setMapSelection({ coords, address })
    },
    [],
  )

  const handleMapConfirm = () => {
    if (mapSelection) {
      setValue('customerAddress', mapSelection.address)
    }
    setStep('details')
  }

  const onDetailsSubmit = (formData: DetailsForm) => {
    const payload = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerAddress: formData.customerAddress,
      customerComment: formData.customerComment,
      customerLat: mapSelection?.coords[0],
      customerLng: mapSelection?.coords[1],
    }
    setDetailsData({ ...formData, ...payload })
    confirmMutation.mutate(payload)
  }

  const onConfirmCourier = () => {
    if (!selectedCourier) return
    const option = COURIER_OPTIONS.find((c) => c.id === selectedCourier)!
    courierMutation.mutate({ courier: selectedCourier, deliveryPrice: option.deliveryPrice })
  }

  // ── Loading ──
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

  // ── Error ──
  if (isError || !data?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="font-medium text-gray-700">{t('common.error')}</p>
            <Button variant="outline" onClick={() => refetch()}>{t('common.retry')}</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentOrder = order!

  // Already confirmed → tracking
  const isConfirmedOrBeyond =
    confirmedOrder !== null ||
    (currentOrder.status !== 'pending' && currentOrder.status !== 'confirmed') ||
    (currentOrder.status === 'confirmed' && !confirmedOrder && step !== 'courier')

  if (isConfirmedOrBeyond) {
    return <TrackingPage order={confirmedOrder ?? currentOrder} t={t} />
  }

  const selectedCourierOption = COURIER_OPTIONS.find((c) => c.id === selectedCourier)

  // ── Shared pharmacy summary (shown on steps 'details' and 'courier') ──
  const PharmacySummary = () => (
    <div className="bg-white border-b px-4 py-3">
      <div className="max-w-lg mx-auto">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg shrink-0">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            {currentOrder.pharmacyName && (
              <p className="font-semibold text-gray-900 text-sm">{currentOrder.pharmacyName}</p>
            )}
            {currentOrder.pharmacyAddress && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                {currentOrder.pharmacyAddress}
              </p>
            )}
            {currentOrder.pharmacyComment && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{currentOrder.pharmacyComment}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">{t('pharmacy.medicinesTotal')}</p>
            <p className="font-bold text-blue-600 text-sm">{formatCurrency(currentOrder.medicinesTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  )

  // ══════════════════════════════════════════
  // STEP: map
  // ══════════════════════════════════════════
  if (step === 'map') {
    return (
      <div className="flex flex-col h-screen bg-white">
        {/* Address header */}
        <div className="shrink-0 bg-white border-b px-4 pt-3 pb-2 z-10">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('customer.address')}
              </p>
              <LanguageSwitcher />
            </div>
            <p className={cn(
              'text-base font-semibold truncate',
              mapSelection ? 'text-gray-900' : 'text-gray-400',
            )}>
              {mapSelection?.address ?? t('customer.locationInstruction')}
            </p>
          </div>
        </div>

        {/* Map — fills remaining height (screen minus address header ~64px + bottom bar ~80px + search ~48px) */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <YandexMap
            pharmacyCoords={
              currentOrder.pharmacyLat && currentOrder.pharmacyLng
                ? [currentOrder.pharmacyLat, currentOrder.pharmacyLng]
                : undefined
            }
            onLocationSelect={handleMapSelect}
            showSearch
            height="calc(100vh - 200px)"
          />
        </div>

        {/* Bottom button */}
        <div className="shrink-0 p-4 bg-white border-t">
          <div className="max-w-lg mx-auto">
            <Button
              className="w-full"
              size="lg"
              disabled={!mapSelection}
              onClick={handleMapConfirm}
            >
              {t('customer.confirmAddress')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════
  // STEP: details
  // ══════════════════════════════════════════
  if (step === 'details') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top: pharmacy info */}
        <PharmacySummary />

        {/* Step indicator */}
        <div className="bg-white border-b px-4 py-2">
          <div className="max-w-lg mx-auto flex items-center gap-2 text-xs">
            <button
              onClick={() => setStep('map')}
              className="text-muted-foreground hover:text-gray-700 flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              {t('customer.setLocation')}
              {mapSelection && (
                <span className="text-blue-500 truncate max-w-[120px]">{mapSelection.address}</span>
              )}
            </button>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className="font-semibold text-blue-600">{t('customer.step1')}</span>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className="text-gray-400">{t('customer.step2')}</span>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-5">
            <form onSubmit={handleSubmit(onDetailsSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerAddress">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {t('customer.address')} *
                </Label>
                <Input
                  id="customerAddress"
                  placeholder={t('customer.address')}
                  {...register('customerAddress')}
                  className={errors.customerAddress ? 'border-destructive' : ''}
                />
                {errors.customerAddress && (
                  <p className="text-xs text-destructive">
                    {t(`validation.${errors.customerAddress.message || 'required'}`)}
                  </p>
                )}
              </div>

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
                    {t(`validation.${errors.customerName.message || 'required'}`)}
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
                    {t(`validation.${errors.customerPhone.message || 'required'}`)}
                  </p>
                )}
              </div>

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
                {confirmMutation.isPending ? t('common.loading') : t('common.next')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════
  // STEP: courier
  // ══════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top: pharmacy info */}
      <PharmacySummary />

      {/* Step indicator */}
      <div className="bg-white border-b px-4 py-2">
        <div className="max-w-lg mx-auto flex items-center gap-2 text-xs">
          <span className="text-gray-400">{t('customer.step1')}</span>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <span className="font-semibold text-blue-600">{t('customer.step2')}</span>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <span className="text-gray-400">{t('customer.step3')}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

          {/* Courier cards */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">{t('customer.chooseCourier')}</p>
            <div className="space-y-3">
              {COURIER_OPTIONS.map((courier) => {
                const total = currentOrder.medicinesTotal + courier.deliveryPrice
                const isSelected = selectedCourier === courier.id
                return (
                  <div
                    key={courier.id}
                    onClick={() => setSelectedCourier(courier.id)}
                    className={cn(
                      'relative p-4 rounded-xl border-2 cursor-pointer transition-all bg-white',
                      isSelected
                        ? `${courier.bgColor} ${courier.borderColor}`
                        : 'border-gray-200 hover:border-gray-300',
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className={`h-5 w-5 ${courier.color}`} />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{courier.icon}</span>
                      <div className="flex-1">
                        <p className={`font-semibold ${courier.color}`}>{t(courier.nameKey)}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('courier.deliveryPrice')}: {formatCurrency(courier.deliveryPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{t('courier.total')}</p>
                        <p className="font-bold text-gray-900">{formatCurrency(total)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          {selectedCourierOption && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-blue-700 mb-2">{t('order.detail')}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('order.medicinesAmount')}</span>
                    <span>{formatCurrency(currentOrder.medicinesTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('order.deliveryPrice')}</span>
                    <span>{formatCurrency(selectedCourierOption.deliveryPrice)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-blue-700 border-t pt-1 mt-1">
                    <span>{t('order.totalPrice')}</span>
                    <span>{formatCurrency(currentOrder.medicinesTotal + selectedCourierOption.deliveryPrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer details recap */}
          {detailsData && (
            <Card>
              <CardContent className="p-4 space-y-2 text-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t('customer.deliveryDetails')}
                </p>
                <div className="flex gap-2 text-gray-600">
                  <User className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                  <span>{detailsData.customerName}</span>
                </div>
                <div className="flex gap-2 text-gray-600">
                  <Phone className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                  <span>{detailsData.customerPhone}</span>
                </div>
                <div className="flex gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                  <span>{detailsData.customerAddress}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {courierMutation.isError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{t('common.error')}</p>
            </div>
          )}

          <div className="flex gap-3 pb-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep('details')}
              disabled={courierMutation.isPending}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('common.back')}
            </Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!selectedCourier || courierMutation.isPending}
              onClick={onConfirmCourier}
            >
              {courierMutation.isPending ? t('common.loading') : t('customer.confirmOrder')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
// Tracking page
// ══════════════════════════════════════════
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
    } catch {
      const el = document.createElement('textarea')
      el.value = order.trackingUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-10">
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
                <p className="text-xs text-muted-foreground">{t('order.token')}</p>
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
              <p className="text-sm font-semibold text-green-700">{t('customer.trackingReady')}</p>
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
                <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t('order.openTracking')}
                  </a>
                </Button>
                <Button variant="outline" onClick={handleCopy} className="border-green-300">
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
                <span className="text-muted-foreground">{t('pharmacy.pharmacyName')}</span>
                <span className="font-medium">{order.pharmacyName}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('order.medicinesAmount')}</span>
              <span>{formatCurrency(order.medicinesTotal)}</span>
            </div>
            {order.deliveryPrice !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('order.deliveryPrice')}</span>
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
                  <User className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                  <span>{order.customerName}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
                {order.customerAddress && (
                  <div className="flex gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                    <span>{order.customerAddress}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {order.status === 'confirmed' && !order.trackingUrl && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-blue-600 mx-auto" />
              <p className="text-sm font-semibold text-blue-700">{t('customer.orderConfirmed')}</p>
              <p className="text-xs text-blue-500">{t('steps.courierPickup')}...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
