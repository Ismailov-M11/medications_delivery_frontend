import { Outlet, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { LogOut, Pill } from 'lucide-react'

export function PharmacyLayout() {
  const { t } = useTranslation()
  const { token, user, logout } = useAuthStore()

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'pharmacy') {
    return <Navigate to="/admin/orders" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 p-1.5 rounded-lg">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">MedDelivery</p>
                {user.name && (
                  <p className="text-xs text-muted-foreground">{user.name}</p>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('common.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
