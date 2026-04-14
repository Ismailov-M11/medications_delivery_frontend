import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { OrderStatus } from '@/api/orders'

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

const STATUS_VARIANT_MAP: Record<
  OrderStatus,
  'pending' | 'confirmed' | 'courier_pickup' | 'courier_picked' | 'courier_delivery' | 'delivered'
> = {
  pending: 'pending',
  confirmed: 'confirmed',
  courier_pickup: 'courier_pickup',
  courier_picked: 'courier_picked',
  courier_delivery: 'courier_delivery',
  delivered: 'delivered',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation()
  const variant = STATUS_VARIANT_MAP[status]

  return (
    <Badge variant={variant} className={className}>
      {t(`order.status.${status}`)}
    </Badge>
  )
}
