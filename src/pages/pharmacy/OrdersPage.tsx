import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getPharmacyOrders, Order } from '@/api/orders'
import { StatusBadge } from '@/components/StatusBadge'
import { OrderDetailModal } from '@/components/OrderDetailModal'
import { CreateOrderModal } from '@/components/CreateOrderModal'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, truncateToken } from '@/lib/utils'
import {
  Plus,
  RefreshCw,
  AlertCircle,
  ShoppingCart,
  Clock,
  Truck,
  CheckCircle2,
  LayoutGrid,
} from 'lucide-react'

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
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: LayoutGrid, label: t('pharmacy.orders'), value: stats.total, color: 'text-foreground' },
          { icon: Clock, label: t('order.status.pending'), value: stats.pending, color: 'text-amber-500' },
          { icon: Truck, label: t('order.status.courier_delivery'), value: stats.active, color: 'text-primary' },
          { icon: CheckCircle2, label: t('order.status.delivered'), value: stats.delivered, color: 'text-green-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg shrink-0">
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{label}</p>
              <p className="text-xl font-bold leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{t('pharmacy.orders')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('pharmacy.ordersList')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          <Button size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('pharmacy.createOrder')}
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">{t('common.error')}</p>
          <Button variant="outline" onClick={() => refetch()}>{t('common.retry')}</Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">{t('pharmacy.noOrders')}</p>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('pharmacy.createOrder')}
          </Button>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && orders.length > 0 && (
        <>
          {/* Desktop */}
          <div className="hidden md:block">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                        {t('order.token')}
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                        {t('pharmacy.medicinesTotal')}
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                        {t('customer.name')}
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                        {t('order.createdAt')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-primary/5 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-bold">
                            #{truncateToken(order.token)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-sm">{formatCurrency(order.medicinesTotal)}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {order.customerName || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-sm active:scale-[0.99] transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-sm font-bold">
                    #{truncateToken(order.token)}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t('pharmacy.medicinesTotal')}</span>
                    <span className="font-medium text-foreground">{formatCurrency(order.medicinesTotal)}</span>
                  </div>
                  {order.customerName && (
                    <div className="flex justify-between">
                      <span>{t('customer.name')}</span>
                      <span className="text-foreground">{order.customerName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{t('order.createdAt')}</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>
              </div>
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
