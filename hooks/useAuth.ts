'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types'

export function useLogin() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user)
      // hydrate currentUser cache to avoid duplicate fetch
      queryClient.setQueryData(['currentUser'], data.user as User)
      router.push('/dashboard')
    },
  })
}

export function useRegister() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user)
      queryClient.setQueryData(['currentUser'], data.user as User)
      router.push('/dashboard')
    },
  })
}

export function useLogout() {
  const router = useRouter()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth()
  // remove only currentUser related cache to avoid wiping unrelated data
  queryClient.removeQueries({ queryKey: ['currentUser'] })
      router.push('/login')
    },
  })
}

export function useCurrentUser() {
  const initialized = useAuthStore((state) => state.initialized)

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    retry: false,
    enabled: initialized,
  })
}
