import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'admin' | 'pharmacy'

export interface AuthUser {
  id: string
  role: UserRole
  name?: string
  login?: string
}

interface AuthStore {
  token: string | null
  user: AuthUser | null
  setAuth: (token: string, user: AuthUser) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'med-delivery-auth',
    },
  ),
)
