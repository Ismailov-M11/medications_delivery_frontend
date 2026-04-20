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
import { LandingPage } from '@/pages/landing/LandingPage'
import { Toaster } from '@/components/ui/toaster'

const hostname = window.location.hostname
const isAdmin    = hostname.startsWith('admin.')
const isPharmacy = hostname.startsWith('app.')

function App() {
  return (
    <>
      <Routes>
        {/* Customer order page — available on all domains */}
        <Route path="/order/:token" element={<CustomerOrderPage />} />

        {isAdmin && (
          <>
            <Route path="/login" element={<AdminLoginPage />} />
            <Route element={<AdminLayout />}>
              <Route path="/orders" element={<AdminOrdersPage />} />
              <Route path="/pharmacies" element={<AdminPharmaciesPage />} />
              <Route path="/analytics" element={<AdminAnalyticsPage />} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}

        {isPharmacy && (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<PharmacyLayout />}>
              <Route path="/orders" element={<PharmacyOrdersPage />} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}

        {!isAdmin && !isPharmacy && (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
      <Toaster />
    </>
  )
}

export default App
