import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getPharmacyOrders, Order } from '@/api/orders'
import { StatusBadge } from '@/components/StatusBadge'
import { OrderDetailModal } from '@/components/OrderDetailModal'
import { CreateOrderModal } from '@/components/CreateOrderModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate, truncateToken } from '@/lib/utils'
import { Plus, RefreshCw, AlertCircle, ShoppingCart, Clock, Truck, CheckCircle2, PackageOpen } from 'lucide-react'

export function PharmacyOrdersPage() {
  const { t } = useTranslation()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['pharmacyOrders', page],
    queryFn: () => getPharmacyOrders({ page, pageSize: PAGE_SIZE }),
    refetchInterval: 15000,
  })

  // Separate query for stats — loads all orders once, refreshes every 30s
  const { data: statsData } = useQuery({
    queryKey: ['pharmacyOrdersStats'],
    queryFn: () => getPharmacyOrders({ page: 1, pageSize: 500 }),
    refetchInterval: 30000,
    staleTime: 15000,
  })

  const stats = useMemo(() => {
    const all = statsData?.data?.orders ?? []
    return {
      pending: all.filter((o) => o.status === 'pending').length,
      active: all.filter((o) =>
        ['confirmed', 'courier_pickup', 'courier_picked', 'courier_delivery'].includes(o.status)
      ).length,
      delivered: all.filter((o) => o.status === 'delivered').length,
      total: statsData?.data?.total ?? 0,
    }
  }, [statsData])

  const orders = data?.data?.orders ?? []
  const total = data?.data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-0 bg-gray-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <PackageOpen className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('pharmacy.orders')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('order.status.pending')}</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Truck className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('order.status.courier_delivery')}</p>
              <p className="text-xl font-bold text-blue-600">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('order.status.delivered')}</p>
              <p className="text-xl font-bold text-green-600">{stats.delivered}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('pharmacy.orders')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('pharmacy.ordersList')}
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
            {t('pharmacy.createOrder')}
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">{t('common.error')}</p>
          <Button variant="outline" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <ShoppingCart className="h-12 w-12 text-gray-300" />
          <p className="text-muted-foreground">{t('pharmacy.noOrders')}</p>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('pharmacy.createOrder')}
          </Button>
        </div>
      )}

      {/* Orders table */}
      {!isLoading && !isError && orders.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                          {t('order.token')}
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                          Status
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                          {t('pharmacy.medicinesTotal')}
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                          {t('customer.name')}
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
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
                          <td className="px-4 py-3">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatCurrency(order.medicinesTotal)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {order.customerName || '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => (
              <Card
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-gray-700">
                      #{truncateToken(order.token)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('pharmacy.medicinesTotal')}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(order.medicinesTotal)}
                      </span>
                    </div>
                    {order.customerName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t('customer.name')}
                        </span>
                        <span>{order.customerName}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('order.createdAt')}
                      </span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t('common.page')} {page} {t('common.of')} {totalPages}
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

      {/* Modals */}
      <OrderDetailModal
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
      <CreateOrderModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  )
}
