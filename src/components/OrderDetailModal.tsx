import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Order } from '@/api/orders'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatusBadge } from '@/components/StatusBadge'
import { YandexMap } from '@/components/YandexMap'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, truncateToken, buildOrderUrl } from '@/lib/utils'
import {
  User,
  Phone,
  MapPin,
  MessageSquare,
  Truck,
  DollarSign,
  Clock,
  ExternalLink,
  Copy,
  CheckCheck,
  Link,
  Hash,
} from 'lucide-react'

interface OrderDetailModalProps {
  order: Order | null
  open: boolean
  onClose: () => void
  isAdmin?: boolean
}

const COURIER_LABELS: Record<string, string> = {
  yandex: 'Yandex Delivery',
  noor: 'Noor Express',
  millennium: 'Millennium',
}

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 text-gray-400 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium mt-0.5 break-words">{value}</p>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
      {children}
    </h4>
  )
}

export function OrderDetailModal({
  order,
  open,
  onClose,
  isAdmin = false,
}: OrderDetailModalProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  if (!order) return null

  const showCustomerInfo = order.status !== 'pending'
  const orderUrl = buildOrderUrl(order.token)
  const hasRoute =
    showCustomerInfo &&
    order.pharmacyLat &&
    order.pharmacyLng &&
    order.customerLat &&
    order.customerLng

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderUrl)
    } catch {
      const el = document.createElement('textarea')
      el.value = orderUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 flex-wrap">
            {t('order.detail')}
            <span className="font-mono text-sm font-bold text-gray-500">
              #{truncateToken(order.token)}
            </span>
            <StatusBadge status={order.status} />
          </DialogTitle>
        </DialogHeader>

        {/* Share link — full width */}
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-center gap-1.5 mb-2">
            <Link className="h-3.5 w-3.5 text-blue-500" />
            <p className="text-xs font-medium text-blue-600">{t('order.shareLink')}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="flex-1 text-xs font-mono text-blue-700 break-all bg-white border border-blue-100 rounded px-2 py-1.5 select-all">
              {orderUrl}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0 border-blue-200 hover:bg-blue-100"
              onClick={handleCopy}
            >
              {copied
                ? <CheckCheck className="h-4 w-4 text-green-500" />
                : <Copy className="h-4 w-4 text-blue-500" />
              }
            </Button>
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">

          {/* ── Column 1: order amounts + pharmacy ── */}
          <div className="space-y-4">
            {isAdmin && order.pharmacyName && (
              <div>
                <SectionTitle>{t('pharmacy.pharmacyName')}</SectionTitle>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm font-semibold text-indigo-700">{order.pharmacyName}</p>
                  {order.pharmacyAddress && (
                    <p className="text-xs text-indigo-500 mt-0.5">{order.pharmacyAddress}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <SectionTitle>{t('pharmacy.comment')}</SectionTitle>
              <InfoRow
                icon={<MessageSquare className="h-4 w-4" />}
                label={t('order.comment')}
                value={order.pharmacyComment || '—'}
              />
              <InfoRow
                icon={<DollarSign className="h-4 w-4" />}
                label={t('order.medicinesAmount')}
                value={formatCurrency(order.medicinesTotal)}
              />
              {order.deliveryPrice !== undefined && (
                <InfoRow
                  icon={<Truck className="h-4 w-4" />}
                  label={t('order.deliveryPrice')}
                  value={formatCurrency(order.deliveryPrice)}
                />
              )}
              {order.totalPrice !== undefined && (
                <InfoRow
                  icon={<DollarSign className="h-4 w-4" />}
                  label={t('order.totalPrice')}
                  value={
                    <span className="text-blue-600 font-bold">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  }
                />
              )}
              <InfoRow
                icon={<Clock className="h-4 w-4" />}
                label={t('order.createdAt')}
                value={formatDate(order.createdAt)}
              />
            </div>
          </div>

          {/* ── Column 2: customer + courier ── */}
          <div className="space-y-4">
            {showCustomerInfo ? (
              <div>
                <SectionTitle>{t('order.customerInfo')}</SectionTitle>
                {order.customerName && (
                  <InfoRow
                    icon={<User className="h-4 w-4" />}
                    label={t('customer.name')}
                    value={order.customerName}
                  />
                )}
                {order.customerPhone && (
                  <InfoRow
                    icon={<Phone className="h-4 w-4" />}
                    label={t('customer.phone')}
                    value={
                      <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:underline">
                        {order.customerPhone}
                      </a>
                    }
                  />
                )}
                {order.customerAddress && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label={t('customer.address')}
                    value={order.customerAddress}
                  />
                )}
                {order.customerComment && (
                  <InfoRow
                    icon={<MessageSquare className="h-4 w-4" />}
                    label={t('customer.comment')}
                    value={order.customerComment}
                  />
                )}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-muted-foreground">
                {t('order.status.pending')} — данные клиента появятся после подтверждения
              </div>
            )}

            {order.courier && (
              <div>
                <SectionTitle>{t('order.courierInfo')}</SectionTitle>
                <InfoRow
                  icon={<Truck className="h-4 w-4" />}
                  label={t('order.courierInfo')}
                  value={COURIER_LABELS[order.courier] || order.courier}
                />
              </div>
            )}

            {order.trackingUrl && (
              <div>
                <SectionTitle>{t('order.trackingUrl')}</SectionTitle>
                <div className="p-3 bg-green-50 rounded-lg">
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-green-700 font-medium hover:underline break-all"
                  >
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    {order.trackingUrl}
                  </a>
                </div>
              </div>
            )}

            {/* Token full */}
            <div className="p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {t('order.token')} (full)
              </p>
              <p className="font-mono text-xs text-gray-400 break-all">{order.token}</p>
            </div>
          </div>
        </div>

        {/* Map — full width, only when route coords exist */}
        {hasRoute && (
          <div>
            <SectionTitle>{t('customer.setLocation')}</SectionTitle>
            <YandexMap
              pharmacyCoords={[order.pharmacyLat!, order.pharmacyLng!]}
              customerCoords={[order.customerLat!, order.customerLng!]}
              readOnly
              height="240px"
            />
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={onClose}>
          {t('common.close')}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
