import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  getPharmacies,
  createPharmacy,
  updatePharmacy,
  togglePharmacyStatus,
  Pharmacy,
  CreatePharmacyPayload,
} from '@/api/pharmacies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { YandexMap } from '@/components/YandexMap'
import { toast } from '@/hooks/useToast'
import { formatDate } from '@/lib/utils'
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

const createPharmacySchema = z.object({
  name: z.string().min(1, 'required'),
  address: z.string().min(1, 'required'),
  phone: z.string().min(7, 'invalidPhone'),
  login: z.string().min(3, 'required'),
  password: z.string().min(6, 'required'),
  subscriptionExpiry: z.string().min(1, 'required'),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
})

type CreatePharmacyForm = z.infer<typeof createPharmacySchema>

const editSubscriptionSchema = z.object({
  subscriptionExpiry: z.string().min(1, 'required'),
})

type EditSubscriptionForm = z.infer<typeof editSubscriptionSchema>

export function AdminPharmaciesPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editPharmacy, setEditPharmacy] = useState<Pharmacy | null>(null)

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['pharmacies'],
    queryFn: getPharmacies,
  })

  const pharmacies = data?.data?.pharmacies ?? []

  const createMutation = useMutation({
    mutationFn: createPharmacy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] })
      setCreateModalOpen(false)
      toast({ title: t('pharmacies.created') })
    },
    onError: () => {
      toast({ title: t('common.error'), variant: 'destructive' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { subscriptionExpiry: string } }) =>
      updatePharmacy(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] })
      setEditPharmacy(null)
      toast({ title: t('pharmacies.updated') })
    },
    onError: () => {
      toast({ title: t('common.error'), variant: 'destructive' })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      togglePharmacyStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] })
      toast({ title: t('pharmacies.updated') })
    },
    onError: () => {
      toast({ title: t('common.error'), variant: 'destructive' })
    },
  })

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    setValue: setCreateValue,
    watch: watchCreate,
    formState: { errors: createErrors },
  } = useForm<CreatePharmacyForm>({
    resolver: zodResolver(createPharmacySchema),
  })

  const watchedLat = watchCreate('lat')
  const watchedLng = watchCreate('lng')
  const controlledCoords: [number, number] | undefined =
    watchedLat && watchedLng ? [watchedLat, watchedLng] : undefined

  const handleMapSelect = (coords: [number, number], address: string) => {
    setCreateValue('lat', coords[0])
    setCreateValue('lng', coords[1])
    setCreateValue('address', address)
  }

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: editErrors },
  } = useForm<EditSubscriptionForm>({
    resolver: zodResolver(editSubscriptionSchema),
  })

  const onCreateSubmit = (data: CreatePharmacyForm) => {
    const payload: CreatePharmacyPayload = {
      name: data.name,
      address: data.address,
      phone: data.phone,
      login: data.login,
      password: data.password,
      subscriptionExpiry: data.subscriptionExpiry,
      lat: data.lat,
      lng: data.lng,
    }
    createMutation.mutate(payload)
  }

  const onEditSubmit = (data: EditSubscriptionForm) => {
    if (!editPharmacy) return
    updateMutation.mutate({
      id: editPharmacy.id,
      payload: { subscriptionExpiry: data.subscriptionExpiry },
    })
  }

  const openEditModal = (pharmacy: Pharmacy) => {
    setEditPharmacy(pharmacy)
    const dateStr = pharmacy.subscriptionExpiry
      ? pharmacy.subscriptionExpiry.split('T')[0]
      : ''
    setEditValue('subscriptionExpiry', dateStr)
  }

  const handleCloseCreate = () => {
    setCreateModalOpen(false)
    resetCreate()
  }

  const handleCloseEdit = () => {
    setEditPharmacy(null)
    resetEdit()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('pharmacies.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pharmacies.length} {t('pharmacies.title').toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`}
            />
            {t('common.refresh')}
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('pharmacies.addPharmacy')}
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">{t('common.error')}</p>
          <Button variant="outline" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && pharmacies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Building2 className="h-12 w-12 text-gray-300" />
          <p className="text-muted-foreground">{t('common.noData')}</p>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('pharmacies.addPharmacy')}
          </Button>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && pharmacies.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      {t('pharmacies.name')}
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      {t('pharmacies.address')}
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      {t('pharmacies.phone')}
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      {t('pharmacies.isActive')}
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      {t('pharmacies.subscriptionExpiry')}
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pharmacies.map((pharmacy) => (
                    <tr key={pharmacy.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {pharmacy.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pharmacy.login}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {pharmacy.address}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {pharmacy.phone}
                      </td>
                      <td className="px-4 py-3">
                        {pharmacy.isActive ? (
                          <Badge variant="confirmed" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {t('pharmacies.active')}
                          </Badge>
                        ) : (
                          <Badge variant="pending" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            {t('pharmacies.inactive')}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {pharmacy.subscriptionExpiry
                          ? formatDate(pharmacy.subscriptionExpiry).split(',')[0]
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(pharmacy)}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            {t('pharmacies.editSubscription')}
                          </Button>
                          <Button
                            variant={pharmacy.isActive ? 'destructive' : 'default'}
                            size="sm"
                            onClick={() =>
                              toggleMutation.mutate({
                                id: pharmacy.id,
                                isActive: !pharmacy.isActive,
                              })
                            }
                            disabled={toggleMutation.isPending}
                          >
                            {pharmacy.isActive
                              ? t('pharmacies.deactivate')
                              : t('pharmacies.activate')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Pharmacy Modal */}
      <Dialog open={createModalOpen} onOpenChange={(o) => !o && handleCloseCreate()}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('pharmacies.addPharmacy')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit(onCreateSubmit)}>
            <div className="flex gap-6">
              {/* Left — form fields */}
              <div className="flex-1 space-y-3 min-w-0">
                <div className="space-y-1">
                  <Label>{t('pharmacies.name')}</Label>
                  <Input
                    {...registerCreate('name')}
                    className={createErrors.name ? 'border-destructive' : ''}
                  />
                  {createErrors.name && (
                    <p className="text-xs text-destructive">
                      {t(`validation.${createErrors.name.message || 'required'}`)}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>{t('pharmacies.address')}</Label>
                  <Input
                    {...registerCreate('address')}
                    placeholder="Заполнится автоматически с карты"
                    className={createErrors.address ? 'border-destructive' : ''}
                  />
                  {createErrors.address && (
                    <p className="text-xs text-destructive">
                      {t(`validation.${createErrors.address.message || 'required'}`)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>{t('pharmacies.phone')}</Label>
                    <Input
                      {...registerCreate('phone')}
                      type="tel"
                      className={createErrors.phone ? 'border-destructive' : ''}
                    />
                    {createErrors.phone && (
                      <p className="text-xs text-destructive">
                        {t(`validation.${createErrors.phone.message || 'required'}`)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label>{t('pharmacies.subscriptionExpiry')}</Label>
                    <Input
                      {...registerCreate('subscriptionExpiry')}
                      type="date"
                      className={createErrors.subscriptionExpiry ? 'border-destructive' : ''}
                    />
                    {createErrors.subscriptionExpiry && (
                      <p className="text-xs text-destructive">
                        {t(`validation.${createErrors.subscriptionExpiry.message || 'required'}`)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>{t('pharmacies.login')}</Label>
                    <Input
                      {...registerCreate('login')}
                      autoComplete="off"
                      className={createErrors.login ? 'border-destructive' : ''}
                    />
                    {createErrors.login && (
                      <p className="text-xs text-destructive">
                        {t(`validation.${createErrors.login.message || 'required'}`)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label>{t('pharmacies.password')}</Label>
                    <Input
                      {...registerCreate('password')}
                      type="password"
                      autoComplete="new-password"
                      className={createErrors.password ? 'border-destructive' : ''}
                    />
                    {createErrors.password && (
                      <p className="text-xs text-destructive">
                        {t(`validation.${createErrors.password.message || 'required'}`)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Coordinates — filled from map, editable manually */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {t('pharmacies.coordinates')} — заполнятся с карты
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t('pharmacies.latitude')}</Label>
                      <Input
                        {...registerCreate('lat')}
                        type="number"
                        step="0.000001"
                        placeholder="41.2995"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t('pharmacies.longitude')}</Label>
                      <Input
                        {...registerCreate('lng')}
                        type="number"
                        step="0.000001"
                        placeholder="69.2401"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseCreate}
                    disabled={createMutation.isPending}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? t('common.loading') : t('common.save')}
                  </Button>
                </DialogFooter>
              </div>

              {/* Right — Yandex Map */}
              <div className="w-[420px] flex-shrink-0">
                <p className="text-xs text-muted-foreground mb-1">
                  Найдите адрес или кликните на карте
                </p>
                <YandexMap
                  onLocationSelect={handleMapSelect}
                  controlledCoords={controlledCoords}
                  showSearch
                  height="420px"
                />
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Modal */}
      <Dialog open={!!editPharmacy} onOpenChange={(o) => !o && handleCloseEdit()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {t('pharmacies.editSubscription')}
              {editPharmacy && (
                <span className="text-base font-normal text-muted-foreground ml-2">
                  — {editPharmacy.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('pharmacies.subscriptionExpiry')}</Label>
              <Input
                {...registerEdit('subscriptionExpiry')}
                type="date"
                className={editErrors.subscriptionExpiry ? 'border-destructive' : ''}
              />
              {editErrors.subscriptionExpiry && (
                <p className="text-xs text-destructive">
                  {t(`validation.${editErrors.subscriptionExpiry.message || 'required'}`)}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseEdit}
                disabled={updateMutation.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
