import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/LoginPage'
import { AdminLoginPage } from '@/pages/auth/AdminLoginPage'
import { PharmacyOrdersPage } from '@/pages/pharmacy/OrdersPage'
import { AdminOrdersPage } from '@/pages/admin/OrdersPage'
import { AdminPharmaciesPage } from '@/pages/admin/PharmaciesPage'
import { AdminAnalyticsPage } from '@/pages/admin/AnalyticsPage'
import { CustomerOrderPage } from '@/pages/order/CustomerOrderPage'
import { PharmacyLayout } from '@/components/layout/PharmacyLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/order/:token" element={<CustomerOrderPage />} />

        {/* Pharmacy protected routes */}
        <Route element={<PharmacyLayout />}>
          <Route path="/pharmacy/orders" element={<PharmacyOrdersPage />} />
        </Route>

        {/* Admin protected routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/pharmacies" element={<AdminPharmaciesPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
