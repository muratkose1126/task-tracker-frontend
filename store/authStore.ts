import { create } from 'zustand'
import { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  initAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('auth_token', token)
    set({ user, token, isAuthenticated: true })
  },

  clearAuth: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  initAuth: () => {
    const userStr = localStorage.getItem('user')
    const token = localStorage.getItem('auth_token')
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr)
        set({ user, token, isAuthenticated: true })
      } catch (error) {
        localStorage.removeItem('user')
        localStorage.removeItem('auth_token')
      }
    }
  },
}))
