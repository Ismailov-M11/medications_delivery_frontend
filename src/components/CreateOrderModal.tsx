import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { createOrder } from '@/api/orders'
import { buildOrderUrl } from '@/lib/utils'
import { toast } from '@/hooks/useToast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Copy, CheckCircle2, ExternalLink } from 'lucide-react'

const createOrderSchema = z.object({
  pharmacyComment: z.string().min(1, 'required'),
  medicinesTotal: z.coerce.number().positive('positiveNumber'),
})

type CreateOrderForm = z.infer<typeof createOrderSchema>

interface CreateOrderModalProps {
  open: boolean
  onClose: () => void
}

export function CreateOrderModal({ open, onClose }: CreateOrderModalProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [createdUrl, setCreatedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrderForm>({
    resolver: zodResolver(createOrderSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: createOrder,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacyOrders'] })
      const serverUrl = response.data.orderUrl
      const url =
        (serverUrl && serverUrl.startsWith('http'))
          ? serverUrl
          : buildOrderUrl(response.data.order.token)
      setCreatedUrl(url)
      toast({
        title: t('order.successCreated'),
        variant: 'default',
      })
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('auth.invalidCredentials'),
        variant: 'destructive',
      })
    },
  })

  const handleClose = () => {
    reset()
    setCreatedUrl(null)
    setCopied(false)
    onClose()
  }

  const handleCopy = async () => {
    if (!createdUrl) return
    try {
      await navigator.clipboard.writeText(createdUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const el = document.createElement('textarea')
      el.value = createdUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const onSubmit = (data: CreateOrderForm) => {
    mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('pharmacy.createOrder')}</DialogTitle>
        </DialogHeader>

        {!createdUrl ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pharmacyComment">
                {t('pharmacy.comment')}
              </Label>
              <Textarea
                id="pharmacyComment"
                placeholder={t('pharmacy.comment')}
                rows={4}
                {...register('pharmacyComment')}
                className={errors.pharmacyComment ? 'border-destructive' : ''}
              />
              {errors.pharmacyComment && (
                <p className="text-xs text-destructive">
                  {t(`validation.${errors.pharmacyComment.message || 'required'}`)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicinesTotal">
                {t('pharmacy.medicinesTotal')}
              </Label>
              <Input
                id="medicinesTotal"
                type="number"
                min={0}
                step={1}
                placeholder="50000"
                {...register('medicinesTotal')}
                className={errors.medicinesTotal ? 'border-destructive' : ''}
              />
              {errors.medicinesTotal && (
                <p className="text-xs text-destructive">
                  {t(`validation.${errors.medicinesTotal.message || 'required'}`)}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t('common.loading') : t('pharmacy.createOrder')}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm font-medium text-green-700">
                {t('order.successCreated')}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t('order.shareLink')}
              </p>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                <a
                  href={createdUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-blue-600 break-all hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  {createdUrl}
                </a>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleCopy}
                variant={copied ? 'secondary' : 'default'}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? t('common.copied') : t('order.copyLink')}
              </Button>
              <Button variant="outline" onClick={handleClose}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
