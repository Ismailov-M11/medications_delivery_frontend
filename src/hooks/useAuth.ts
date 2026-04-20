import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const { token, user, setAuth, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return {
    token,
    user,
    setAuth,
    logout: handleLogout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    isPharmacy: user?.role === 'pharmacy',
  }
}
