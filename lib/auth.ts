import { apiClient, getCsrfCookie } from './api'
import type { AuthResponse, LoginFormData, RegisterFormData, User } from '@/types'

export const authApi = {
  /**
   * Session-based register
   * Uses /auth/session/register endpoint
   * Sets session cookie (auth:web guard)
   */
  async register(data: RegisterFormData): Promise<AuthResponse> {
    // Get CSRF token first (required for session-based auth)
    await getCsrfCookie()

    const response = await apiClient.post<AuthResponse>('/auth/session/register', data)
    return response.data
  },

  /**
   * Session-based login
   * Uses /auth/session/login endpoint
   * Sets session cookie (auth:web guard)
   */
  async login(data: LoginFormData): Promise<AuthResponse> {
    // Get CSRF token first (required for session-based auth)
    await getCsrfCookie()

    const response = await apiClient.post<AuthResponse>('/auth/session/login', data)
    return response.data
  },

  /**
   * Session-based logout
   * Destroys session and invalidates token
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/session/logout')
  },

  /**
   * Get current authenticated user (session-based)
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ data: User }>('/auth/session/me')
    return response.data.data
  },
}