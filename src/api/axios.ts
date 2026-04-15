import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const msg: string = error.response?.data?.message || ''

    if (status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    } else if (status === 403) {
      useAuthStore.getState().logout()
      if (msg.toLowerCase().includes('subscription')) {
        window.location.href = '/login?reason=subscription_expired'
      } else {
        window.location.href = '/login?reason=inactive'
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
