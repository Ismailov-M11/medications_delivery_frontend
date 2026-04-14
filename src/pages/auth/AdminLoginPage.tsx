import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adminLogin } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

const adminLoginSchema = z.object({
  email: z.string().email('invalidEmail'),
  password: z.string().min(1, 'required'),
})

type AdminLoginForm = z.infer<typeof adminLoginSchema>

export function AdminLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: adminLogin,
    onSuccess: (response) => {
      if (response.success && response.data) {
        setAuth(response.data.token, response.data.user)
        navigate('/admin/orders', { replace: true })
      } else {
        setApiError(response.message || t('auth.invalidCredentials'))
      }
    },
    onError: () => {
      setApiError(t('auth.invalidCredentials'))
    },
  })

  const onSubmit = (data: AdminLoginForm) => {
    setApiError(null)
    mutate(data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
      {/* Top bar */}
      <div className="flex justify-end p-4">
        <LanguageSwitcher />
      </div>

      {/* Centered form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex justify-center">
              <div className="bg-slate-700 p-3 rounded-2xl shadow-md border border-slate-600">
                <ShieldCheck className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">MedDelivery</h1>
              <CardTitle className="text-base font-medium text-muted-foreground mt-1">
                {t('auth.adminLogin')}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {t(`validation.${errors.email.message || 'required'}`)}
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
                href="/login"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                ← {t('auth.pharmacyLogin')}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
