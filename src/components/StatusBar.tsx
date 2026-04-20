import { useTranslation } from 'react-i18next'
import { OrderStatus } from '@/api/orders'
import {
  Package,
  Truck,
  PackageCheck,
  Navigation,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_STEPS: OrderStatus[] = [
  'confirmed',
  'courier_pickup',
  'courier_picked',
  'courier_delivery',
  'delivered',
]

const STEP_ICONS = [Package, Truck, PackageCheck, Navigation, CheckCircle2]

interface StatusBarProps {
  status: OrderStatus
}

export function StatusBar({ status }: StatusBarProps) {
  const { t } = useTranslation()

  const stepLabels = [
    t('steps.medicinesReady'),
    t('steps.courierPickup'),
    t('steps.courierPicked'),
    t('steps.courierDelivery'),
    t('steps.delivered'),
  ]

  const currentIndex = STATUS_STEPS.indexOf(status)

  return (
    <div className="w-full px-2 py-4">
      <div className="relative flex items-start justify-between">
        {/* Connecting line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-blue-500 transition-all duration-500"
          style={{
            width:
              currentIndex <= 0
                ? '0%'
                : `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%`,
          }}
        />

        {STATUS_STEPS.map((step, index) => {
          const Icon = STEP_ICONS[index]
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isPending = index > currentIndex

          return (
            <div
              key={step}
              className="relative z-10 flex flex-col items-center gap-2"
              style={{ width: `${100 / STATUS_STEPS.length}%` }}
            >
              <div className="relative">
                {isCurrent && status !== 'delivered' && (
                  <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-40" />
                )}
                <div
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted && 'border-blue-500 bg-blue-500 text-white',
                    isCurrent && 'border-blue-500 bg-white text-blue-500 shadow-md shadow-blue-200',
                    isPending && 'border-gray-200 bg-white text-gray-300',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <span
                className={cn(
                  'text-center text-xs font-medium leading-tight',
                  isCompleted && 'text-blue-600',
                  isCurrent && 'text-blue-700 font-semibold',
                  isPending && 'text-gray-400',
                )}
              >
                {stepLabels[index]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
