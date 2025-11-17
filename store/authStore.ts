import { create } from 'zustand'
import { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  initialized: boolean
  setAuth: (user: User) => void
  clearAuth: () => void
  setInitialized: (val: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  initialized: false,

  setAuth: (user) => {
    set({ user, isAuthenticated: true })
  },

  clearAuth: () => {
    set({ user: null, isAuthenticated: false })
  },
  
  setInitialized: (val: boolean) => {
    set({ initialized: val })
  },
}))
