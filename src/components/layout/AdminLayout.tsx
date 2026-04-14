import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import {
  ShoppingCart,
  Building2,
  BarChart3,
  LogOut,
  Pill,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    key: 'orders',
    to: '/admin/orders',
    icon: ShoppingCart,
    labelKey: 'admin.orders',
  },
  {
    key: 'pharmacies',
    to: '/admin/pharmacies',
    icon: Building2,
    labelKey: 'admin.pharmacies',
  },
  {
    key: 'analytics',
    to: '/admin/analytics',
    icon: BarChart3,
    labelKey: 'admin.analytics',
  },
]

export function AdminLayout() {
  const { t } = useTranslation()
  const { token, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/pharmacy/orders" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-1.5 rounded-lg">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">MedDelivery</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Admin badge */}
        <div className="px-4 py-3 border-b bg-blue-50">
          <p className="text-xs text-blue-500 font-medium">
            {t('admin.dashboard')}
          </p>
          {user.name && (
            <p className="text-sm font-semibold text-blue-700">{user.name}</p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.key}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {t(item.labelKey)}
              </NavLink>
            )
          })}
        </nav>

        {/* Language & Logout */}
        <div className="p-4 border-t space-y-3">
          <LanguageSwitcher className="justify-center" />
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('common.logout')}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-white border-b px-4 h-14 flex items-center gap-3 sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-1 rounded">
              <Pill className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">MedDelivery Admin</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
