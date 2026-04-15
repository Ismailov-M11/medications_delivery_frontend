import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getAnalytics } from '@/api/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  ShoppingCart,
  DollarSign,
  Truck,
  Building2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  pending: '#EAB308',
  confirmed: '#22C55E',
  courier_pickup: '#3B82F6',
  courier_picked: '#6366F1',
  courier_delivery: '#A855F7',
  delivered: '#6B7280',
}

const COURIER_COLORS: Record<string, string> = {
  yandex: '#FF6B35',
  noor: '#4ECDC4',
  millennium: '#45B7D1',
}

const COURIER_LABELS: Record<string, string> = {
  yandex: 'Yandex',
  noor: 'Noor',
  millennium: 'Millennium',
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminAnalyticsPage() {
  const { t } = useTranslation()

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAnalytics,
  })

  const analytics = data?.data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{t('common.error')}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }

  const ordersByStatusData = Array.isArray(analytics?.ordersByStatus)
    ? analytics.ordersByStatus.map((item: { status: string; count: number }) => ({
        status: item.status,
        label: t(`order.status.${item.status}`),
        count: item.count,
        color: STATUS_COLORS[item.status] || '#6B7280',
      }))
    : []

  const ordersByCourierData = Array.isArray(analytics?.ordersByCourier)
    ? analytics.ordersByCourier.map((item: { courier: string; count: number }) => ({
        courier: item.courier,
        label: COURIER_LABELS[item.courier] || item.courier,
        count: item.count,
        color: COURIER_COLORS[item.courier] || '#6B7280',
      }))
    : []

  const last30DaysData = analytics?.ordersByDay ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('analytics.title')}
          </h1>
        </div>
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

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title={t('analytics.totalOrders')}
          value={analytics?.totalOrders ?? 0}
          icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title={t('analytics.totalMedicines')}
          value={
            analytics?.totalMedicinesAmount !== undefined
              ? formatCurrency(analytics.totalMedicinesAmount)
              : '0'
          }
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          color="bg-green-100"
        />
        <StatCard
          title={t('analytics.totalDelivery')}
          value={
            analytics?.totalDeliveryAmount !== undefined
              ? formatCurrency(analytics.totalDeliveryAmount)
              : '0'
          }
          icon={<Truck className="h-5 w-5 text-purple-600" />}
          color="bg-purple-100"
        />
        <StatCard
          title={t('analytics.activePharmacies')}
          value={analytics?.activePharmacies ?? 0}
          icon={<Building2 className="h-5 w-5 text-orange-600" />}
          color="bg-orange-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('analytics.ordersByStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersByStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ordersByStatusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [value, t('analytics.orders')]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {ordersByStatusData.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                {t('common.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders by Courier */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('analytics.ordersByCourier')}</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersByCourierData.length > 0 ? (
              <div className="space-y-3">
                {ordersByCourierData.map((item) => {
                  const maxVal = Math.max(
                    ...ordersByCourierData.map((d) => d.count),
                    1,
                  )
                  const pct = (item.count / maxVal) * 100
                  return (
                    <div key={item.courier} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">
                          {item.count} {t('analytics.orders').toLowerCase()}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                {t('common.noData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Last 30 Days */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('analytics.last30Days')}</CardTitle>
        </CardHeader>
        <CardContent>
          {last30DaysData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={last30DaysData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  interval={4}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [value, t('analytics.orders')]}
                />
                <Bar
                  dataKey="count"
                  fill="#3B82F6"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              {t('common.noData')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
