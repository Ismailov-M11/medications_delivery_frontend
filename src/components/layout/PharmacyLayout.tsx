import { Outlet, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { LogOut, Package } from 'lucide-react'
import { Logo } from '@/pages/landing/components/Logo'

export function PharmacyLayout() {
  const { t } = useTranslation()
  const { token, user, logout } = useAuthStore()

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'pharmacy') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-muted/40 lg:flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-background border-r border-border h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-border">
          <Logo size="sm" />
          {user.name && (
            <p className="text-xs text-muted-foreground mt-2 truncate">{user.name}</p>
          )}
        </div>

        <nav className="flex-1 p-3">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm bg-primary/10 text-primary font-medium">
            <Package className="h-4 w-4" />
            {t('pharmacy.orders')}
          </div>
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5 mt-1"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('common.logout')}
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed inset-x-0 top-0 z-30 bg-background border-b border-border h-14 flex items-center justify-between px-4">
        <Logo size="sm" />
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-muted-foreground hover:text-destructive"
            aria-label={t('common.logout')}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Desktop topbar */}
        <header className="hidden lg:flex items-center justify-between h-14 px-8 bg-background border-b border-border sticky top-0 z-10">
          <p className="text-sm font-medium text-foreground">{t('pharmacy.orders')}</p>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pt-20 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
