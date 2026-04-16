import { useState, useEffect } from 'react'
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
  evaluateNoor,
  evaluateMillennium,
  NoorEvalResult,
  MillenniumEvalResult,
  Order,
  CourierType,
} from '@/api/orders'
import { CustomerMap } from '@/components/CustomerMap'
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
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Details form schema
const detailsSchema = z.object({
  customerName: z.string().min(2, 'required'),
  customerPhone: z.string().min(9, 'invalidPhone'),
  customerAddress: z.string().min(3, 'required'),
  apartment: z.string().optional(),
  entrance: z.string().optional(),
  floor: z.string().optional(),
  intercom: z.string().optional(),
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
  logoUrl?: string
}

const COURIER_OPTIONS: CourierOption[] = [
  { id: 'yandex',     nameKey: 'courier.yandex',     color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-400', deliveryPrice: 3500, icon: '🚖' },
  { id: 'noor',       nameKey: 'courier.noor',       color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-400', deliveryPrice: 3000, icon: '🏍️', logoUrl: '/noor-logo.png' },
  { id: 'millennium', nameKey: 'courier.millennium', color: 'text-red-600',   bgColor: 'bg-red-50',   borderColor: 'border-red-400',   deliveryPrice: 4000, icon: '🚗', logoUrl: '/millennium-logo.png' },
]

type Step = 'map' | 'details' | 'courier'

export function CustomerOrderPage() {
  const { token } = useParams<{ token: string }>()
  const { t } = useTranslation()

  const [step, setStep] = useState<Step>('map')
  const [mapSelection, setMapSelection] = useState<{ coords: [number, number]; address: string } | null>(null)
  const [detailsData, setDetailsData] = useState<DetailsForm & { customerLat?: number; customerLng?: number } | null>(null)
  const [selectedCourier, setSelectedCourier] = useState<CourierType | null>(null)
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)
  const [noorEval, setNoorEval] = useState<{ loading: boolean; result: NoorEvalResult | null }>({
    loading: false,
    result: null,
  })
  const [millenniumEval, setMillenniumEval] = useState<{ loading: boolean; result: MillenniumEvalResult | null }>({
    loading: false,
    result: null,
  })

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
    onSuccess: (res) => { if (res.success) setStep('courier') },
  })

  const courierMutation = useMutation({
    mutationFn: (payload: { courier: CourierType; deliveryPrice: number }) =>
      selectCourierByToken(token!, payload),
    onSuccess: (res) => { if (res.success && res.data) setConfirmedOrder(res.data) },
  })

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
  })

  // Call Noor & Millennium evaluate as soon as we enter the courier step
  useEffect(() => {
    if (step !== 'courier' || !token) return

    setNoorEval({ loading: true, result: null })
    evaluateNoor(token)
      .then((res) => setNoorEval({ loading: false, result: res.data }))
      .catch(() => setNoorEval({ loading: false, result: { available: false, stage: 0, price: null, error: 'Ошибка соединения с Noor' } }))

    setMillenniumEval({ loading: true, result: null })
    evaluateMillennium(token)
      .then((res) => setMillenniumEval({ loading: false, result: res.data }))
      .catch(() => setMillenniumEval({ loading: false, result: { available: false, price: null, error: 'Ошибка соединения с Millennium' } }))
  }, [step, token])

  // Pre-fill address when map selection arrives (step transition map → details)
  useEffect(() => {
    if (mapSelection?.address) {
      setValue('customerAddress', mapSelection.address)
    }
  }, [mapSelection, setValue])

  const onDetailsSubmit = (form: DetailsForm) => {
    const payload = {
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerAddress: form.customerAddress,
      apartment: form.apartment,
      entrance: form.entrance,
      floor: form.floor,
      intercom: form.intercom,
      customerComment: form.customerComment,
      customerLat: mapSelection?.coords[0],
      customerLng: mapSelection?.coords[1],
    }
    setDetailsData({ ...form, ...payload })
    confirmMutation.mutate(payload)
  }

  const onConfirmCourier = () => {
    if (!selectedCourier) return
    const opt = COURIER_OPTIONS.find((c) => c.id === selectedCourier)!
    // Use real Noor price if available, otherwise fall back to default
    const deliveryPrice =
      selectedCourier === 'noor' && noorEval.result?.price != null
        ? noorEval.result.price
        : selectedCourier === 'millennium' && millenniumEval.result?.price != null
        ? millenniumEval.result.price
        : opt.deliveryPrice
    courierMutation.mutate({ courier: selectedCourier, deliveryPrice })
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

  // Already beyond pending (reload after confirm) → tracking
  const isConfirmedOrBeyond =
    confirmedOrder !== null ||
    (currentOrder.status !== 'pending' && currentOrder.status !== 'confirmed') ||
    (currentOrder.status === 'confirmed' && !confirmedOrder && step !== 'courier')

  if (isConfirmedOrBeyond) {
    return <TrackingPage order={confirmedOrder ?? currentOrder} t={t} />
  }

  const selectedCourierOption = COURIER_OPTIONS.find((c) => c.id === selectedCourier)

  // Pharmacy summary card — reused on details & courier steps
  const PharmacySummary = () => (
    <div className="bg-white border-b px-4 py-3">
      <div className="max-w-lg mx-auto flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-lg shrink-0">
          <Package className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          {currentOrder.pharmacyName && (
            <p className="font-semibold text-gray-900 text-sm">{currentOrder.pharmacyName}</p>
          )}
          {currentOrder.pharmacyAddress && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />{currentOrder.pharmacyAddress}
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
  )

  // ══════════════════════════════════════════
  // STEP: map — full screen
  // ══════════════════════════════════════════
  if (step === 'map') {
    return (
      <div className="h-screen flex flex-col">
        <div className="shrink-0 flex justify-end px-3 pt-2 pb-1 bg-transparent absolute top-0 right-0 z-30">
          <LanguageSwitcher />
        </div>
        <CustomerMap
          initialCenter={
            currentOrder.pharmacyLat && currentOrder.pharmacyLng
              ? [currentOrder.pharmacyLat, currentOrder.pharmacyLng]
              : undefined
          }
          onConfirm={(coords, address) => {
            setMapSelection({ coords, address })
            setStep('details')
          }}
        />
      </div>
    )
  }

  // ══════════════════════════════════════════
  // STEP: details
  // ══════════════════════════════════════════
  if (step === 'details') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PharmacySummary />

        {/* Breadcrumb */}
        <div className="bg-white border-b px-4 py-2 shrink-0">
          <div className="max-w-lg mx-auto flex items-center gap-2 text-xs">
            <button onClick={() => setStep('map')} className="text-muted-foreground hover:text-gray-700 flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              {t('customer.setLocation')}
            </button>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className="font-semibold text-blue-600">{t('customer.step1')}</span>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className="text-gray-400">{t('customer.step2')}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-5">
            <form onSubmit={handleSubmit(onDetailsSubmit)} className="space-y-4">

              {/* Address row */}
              <div className="space-y-1">
                <Label htmlFor="customerAddress">
                  <MapPin className="h-3 w-3 inline mr-1" />{t('customer.address')} *
                </Label>
                <Input
                  id="customerAddress"
                  defaultValue={mapSelection?.address ?? ''}
                  {...register('customerAddress')}
                  className={errors.customerAddress ? 'border-destructive' : ''}
                />
                {errors.customerAddress && (
                  <p className="text-xs text-destructive">{t(`validation.${errors.customerAddress.message || 'required'}`)}</p>
                )}
              </div>

              {/* Apartment / Entrance / Floor / Intercom */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="apartment">
                    <Home className="h-3 w-3 inline mr-1" />{t('customer.apartment')}
                  </Label>
                  <Input id="apartment" placeholder="10" {...register('apartment')} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="intercom">{t('customer.intercom')}</Label>
                  <Input id="intercom" placeholder="0000" {...register('intercom')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="entrance">{t('customer.entrance')}</Label>
                  <Input id="entrance" placeholder="2" type="number" {...register('entrance')} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="floor">{t('customer.floor')}</Label>
                  <Input id="floor" placeholder="4" type="number" {...register('floor')} />
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <Label htmlFor="customerName">
                  <User className="h-3 w-3 inline mr-1" />{t('customer.name')} *
                </Label>
                <Input id="customerName" placeholder={t('customer.name')} {...register('customerName')}
                  className={errors.customerName ? 'border-destructive' : ''} />
                {errors.customerName && (
                  <p className="text-xs text-destructive">{t(`validation.${errors.customerName.message || 'required'}`)}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label htmlFor="customerPhone">
                  <Phone className="h-3 w-3 inline mr-1" />{t('customer.phone')} *
                </Label>
                <Input id="customerPhone" type="tel" placeholder="+998 90 000 00 00"
                  {...register('customerPhone')} className={errors.customerPhone ? 'border-destructive' : ''} />
                {errors.customerPhone && (
                  <p className="text-xs text-destructive">{t(`validation.${errors.customerPhone.message || 'required'}`)}</p>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <Label htmlFor="customerComment">
                  <MessageSquare className="h-3 w-3 inline mr-1" />{t('customer.comment')}
                </Label>
                <Textarea id="customerComment" placeholder={t('customer.comment')} rows={2}
                  {...register('customerComment')} />
              </div>

              {confirmMutation.isError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{t('common.error')}</p>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={confirmMutation.isPending}>
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
      <PharmacySummary />

      {/* Breadcrumb */}
      <div className="bg-white border-b px-4 py-2 shrink-0">
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
          <p className="text-sm font-semibold text-gray-700">{t('customer.chooseCourier')}</p>
          <div className="space-y-3">
            {COURIER_OPTIONS.map((courier) => {
              const isNoor = courier.id === 'noor'
              const isMillennium = courier.id === 'millennium'

              // Noor
              const noorUnavailable = isNoor && !noorEval.loading && noorEval.result?.available === false
              const noorPrice = isNoor && noorEval.result?.price != null ? noorEval.result.price : courier.deliveryPrice

              // Millennium
              const millenniumUnavailable = isMillennium && !millenniumEval.loading && millenniumEval.result?.available === false
              const millenniumPrice = isMillennium && millenniumEval.result?.price != null ? millenniumEval.result.price : courier.deliveryPrice

              const evalLoading = (isNoor && noorEval.loading) || (isMillennium && millenniumEval.loading)
              const unavailable = noorUnavailable || millenniumUnavailable
              const evalError = isNoor ? noorEval.result?.error : isMillennium ? millenniumEval.result?.error : null

              const effectivePrice = isNoor ? noorPrice : isMillennium ? millenniumPrice : courier.deliveryPrice
              const isSelected = selectedCourier === courier.id

              return (
                <div
                  key={courier.id}
                  onClick={() => !unavailable && setSelectedCourier(courier.id)}
                  className={cn(
                    'relative p-4 rounded-xl border-2 transition-all bg-white',
                    unavailable
                      ? 'opacity-50 cursor-not-allowed border-gray-200'
                      : 'cursor-pointer',
                    !unavailable && isSelected ? `${courier.bgColor} ${courier.borderColor}` : '',
                    !unavailable && !isSelected ? 'border-gray-200 hover:border-gray-300' : '',
                  )}
                >
                  {isSelected && !unavailable && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className={`h-5 w-5 ${courier.color}`} />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    {courier.logoUrl ? (
                      <img src={courier.logoUrl} alt={courier.id} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <span className="text-2xl">{courier.icon}</span>
                    )}
                    <div className="flex-1">
                      <p className={`font-semibold ${courier.color}`}>{t(courier.nameKey)}</p>
                      {evalLoading ? (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="h-3 w-3 border border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
                          Рассчитываем стоимость...
                        </p>
                      ) : (
                        <>
                          <p className="text-xs text-muted-foreground">
                            {t('courier.deliveryPrice')}: {formatCurrency(effectivePrice)}
                          </p>
                          {unavailable && evalError && (
                            <p className="text-xs text-red-400 mt-0.5">{evalError}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          {selectedCourierOption && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 space-y-1 text-sm">
                <p className="font-semibold text-blue-700 mb-2">{t('order.detail')}</p>
                {(() => {
                  const summaryDelivery =
                    selectedCourier === 'noor' && noorEval.result?.price != null
                      ? noorEval.result.price
                      : selectedCourier === 'millennium' && millenniumEval.result?.price != null
                      ? millenniumEval.result.price
                      : selectedCourierOption.deliveryPrice
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('order.medicinesAmount')}</span>
                        <span>{formatCurrency(currentOrder.medicinesTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('order.deliveryPrice')}</span>
                        <span>{formatCurrency(summaryDelivery)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-blue-700 border-t pt-1 mt-1">
                        <span>{t('order.totalPrice')}</span>
                        <span>{formatCurrency(currentOrder.medicinesTotal + summaryDelivery)}</span>
                      </div>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          )}

          {/* Customer recap */}
          {detailsData && (
            <Card>
              <CardContent className="p-4 space-y-1 text-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
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
                  <span>
                    {detailsData.customerAddress}
                    {detailsData.apartment && `, кв. ${detailsData.apartment}`}
                    {detailsData.entrance && `, п. ${detailsData.entrance}`}
                    {detailsData.floor && `, эт. ${detailsData.floor}`}
                  </span>
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
            <Button variant="outline" className="flex-1" onClick={() => setStep('details')} disabled={courierMutation.isPending}>
              <ArrowLeft className="h-4 w-4 mr-1" />{t('common.back')}
            </Button>
            <Button className="flex-1" size="lg" disabled={!selectedCourier || courierMutation.isPending} onClick={onConfirmCourier}>
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
interface TrackingPageProps { order: Order; t: (key: string) => string }

function TrackingPage({ order, t }: TrackingPageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!order.trackingUrl) return
    try { await navigator.clipboard.writeText(order.trackingUrl) }
    catch {
      const el = document.createElement('textarea')
      el.value = order.trackingUrl!
      document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el)
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-10">
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-1.5 rounded-lg"><Pill className="h-4 w-4 text-white" /></div>
            <span className="font-bold text-sm">MedDelivery</span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{t('order.token')}</p>
              <p className="font-mono font-bold text-gray-700">#{order.token.substring(0, 8).toUpperCase()}</p>
            </div>
            <StatusBadge status={order.status} />
          </CardContent>
        </Card>

        {order.status !== 'pending' && (
          <Card><CardContent className="p-4"><StatusBar status={order.status} /></CardContent></Card>
        )}

        {order.trackingUrl && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-green-700">{t('customer.trackingReady')}</p>
              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-green-700 hover:underline font-medium break-all">
                <ExternalLink className="h-4 w-4 flex-shrink-0" />{order.trackingUrl}
              </a>
              <div className="flex gap-2">
                <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />{t('order.openTracking')}
                  </a>
                </Button>
                <Button variant="outline" onClick={handleCopy} className="border-green-300">
                  {copied ? t('common.copied') : t('common.copy')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('order.customerInfo')}</p>
                <div className="flex gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" /><span>{order.customerName}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" /><span>{order.customerPhone}</span>
                  </div>
                )}
                {order.customerAddress && (
                  <div className="flex gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                    <span>
                      {order.customerAddress}
                      {order.apartment && `, кв. ${order.apartment}`}
                      {order.entrance && `, п. ${order.entrance}`}
                      {order.floor && `, эт. ${order.floor}`}
                    </span>
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
