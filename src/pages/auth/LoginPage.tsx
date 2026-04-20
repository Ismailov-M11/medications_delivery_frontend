import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { pharmacyLogin } from '@/api/auth'
import { getPharmacyOrders } from '@/api/orders'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Pill, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

const loginSchema = z.object({
  login: z.string().min(1, 'required'),
  password: z.string().min(1, 'required'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)

  const reason = searchParams.get('reason')
  const initialError = reason === 'account_blocked'
    ? t('auth.accountBlocked')
    : null
  const [apiError, setApiError] = useState<string | null>(initialError)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: pharmacyLogin,
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Clear all cached data from any previous account before setting new auth
        queryClient.clear()
        setAuth(response.data.token, response.data.user)
        queryClient.prefetchQuery({
          queryKey: ['pharmacyOrders', 1],
          queryFn: () => getPharmacyOrders({ page: 1, pageSize: 20 }),
        })
        navigate('/orders', { replace: true })
      } else {
        setApiError(response.message || t('auth.invalidCredentials'))
      }
    },
    onError: (error: any) => {
      const status = error?.response?.status
      if (status === 403) {
        setApiError(t('auth.accountBlocked'))
      } else {
        setApiError(t('auth.invalidCredentials'))
      }
    },
  })

  const onSubmit = (data: LoginForm) => {
    setApiError(null)
    mutate(data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Top bar */}
      <div className="flex justify-end p-4">
        <LanguageSwitcher />
      </div>

      {/* Centered form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex justify-center">
              <div className="bg-blue-500 p-3 rounded-2xl shadow-md">
                <Pill className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">MedDelivery</h1>
              <CardTitle className="text-base font-medium text-muted-foreground mt-1">
                {t('auth.pharmacyLogin')}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">{t('auth.login')}</Label>
                <Input
                  id="login"
                  type="text"
                  placeholder={t('auth.login')}
                  autoComplete="username"
                  {...register('login')}
                  className={errors.login ? 'border-destructive' : ''}
                />
                {errors.login && (
                  <p className="text-xs text-destructive">
                    {t(`validation.${errors.login.message || 'required'}`)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.password')}
                    autoComplete="current-password"
                    {...register('password')}
                    className={
                      errors.password ? 'border-destructive pr-10' : 'pr-10'
                    }
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {t(`validation.${errors.password.message || 'required'}`)}
                  </p>
                )}
              </div>

              {apiError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{apiError}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isPending}
              >
                {isPending ? t('auth.loggingIn') : t('auth.submit')}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <a
                href={`https://admin.${window.location.hostname.replace(/^app\./, '')}/login`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {t('auth.adminLogin')} →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
