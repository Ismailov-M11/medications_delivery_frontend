import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getAdminOrders } from '@/api/admin'
import { getPharmacies } from '@/api/pharmacies'
import { Order } from '@/api/orders'
import { StatusBadge } from '@/components/StatusBadge'
import { OrderDetailModal } from '@/components/OrderDetailModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatDate, truncateToken } from '@/lib/utils'
import { RefreshCw, AlertCircle, ShoppingCart } from 'lucide-react'

const COURIER_LABELS: Record<string, string> = {
  yandex: 'Yandex',
  noor: 'Noor',
  millennium: 'Millennium',
}

export function AdminOrdersPage() {
  const { t } = useTranslation()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [page, setPage] = useState(1)
  const [pharmacyFilter, setPharmacyFilter] = useState<string>('all')
  const PAGE_SIZE = 20

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['adminOrders', page, pharmacyFilter],
    queryFn: () =>
      getAdminOrders({
        page,
        pageSize: PAGE_SIZE,
        pharmacyId: pharmacyFilter !== 'all' ? pharmacyFilter : undefined,
      }),
  })

  const { data: pharmaciesData } = useQuery({
    queryKey: ['pharmacies'],
    queryFn: getPharmacies,
  })

  const orders = data?.data?.orders ?? []
  const total = data?.data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const pharmacies = pharmaciesData?.data?.pharmacies ?? []

  const handlePharmacyChange = (value: string) => {
    setPharmacyFilter(value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('admin.orders')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} {t('pharmacy.orders').toLowerCase()}
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
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="w-56">
          <Select value={pharmacyFilter} onValueChange={handlePharmacyChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('common.filter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {pharmacies.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          </div>
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
      {!isLoading && !isError && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <ShoppingCart className="h-12 w-12 text-gray-300" />
          <p className="text-muted-foreground">{t('pharmacy.noOrders')}</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && orders.length > 0 && (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                        {t('order.token')}
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                        {t('pharmacy.pharmacyName')}
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                        {t('customer.name')}
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                        Status
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                        {t('courier.yandex').split(' ')[0]}
                      </th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                        {t('order.deliveryPrice')}
                      </th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                        {t('order.medicinesAmount')}
                      </th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                        {t('order.totalPrice')}
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                        {t('order.createdAt')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-bold text-gray-700">
                            #{truncateToken(order.token)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {order.pharmacyName || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {order.customerName || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {order.courier
                            ? COURIER_LABELS[order.courier] || order.courier
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {order.deliveryPrice !== undefined
                            ? formatCurrency(order.deliveryPrice)
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {formatCurrency(order.medicinesTotal)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">
                          {order.totalPrice !== undefined
                            ? formatCurrency(order.totalPrice)
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t('common.page')} {page} {t('common.of')} {totalPages} —{' '}
                {total} {t('pharmacy.orders').toLowerCase()}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  {t('common.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        isAdmin
      />
    </div>
  )
}
