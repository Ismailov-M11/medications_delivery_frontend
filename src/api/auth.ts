import apiClient from './axios'
import { AuthUser } from '@/store/authStore'

export interface PharmacyLoginPayload {
  login: string
  password: string
}

export interface AdminLoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data: {
    token: string
    user: AuthUser
  }
  message?: string
}

export const pharmacyLogin = async (
  payload: PharmacyLoginPayload,
): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/api/auth/pharmacy/login', payload)
  return data
}

export const adminLogin = async (
  payload: AdminLoginPayload,
): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/api/auth/admin/login', payload)
  return data
}
