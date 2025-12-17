import { apiClient } from '@/lib/api'

describe('API Client - Backend Communication Setup', () => {
  describe('Server Configuration', () => {
    it('should connect to correct API endpoint', () => {
      // API client should point to our backend server
      const expectedUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      expect(apiClient.defaults.baseURL).toBe(expectedUrl)
    })
  })

  describe('Request Configuration', () => {
    it('should send correct content type headers', () => {
      // Backend expects JSON requests
      const headers = apiClient.defaults.headers as any
      expect(headers['Content-Type']).toBe('application/json')
      expect(headers['Accept']).toBe('application/json')
    })

    it('should send credentials with requests (for session cookies)', () => {
      // Required for session-based auth to send auth cookies
      expect(apiClient.defaults.withCredentials).toBe(true)
    })
  })

  describe('Request/Response Handling', () => {
    it('should have request interceptor configured', () => {
      // Used to add API version prefix to routes
      expect(apiClient.interceptors.request.handlers.length).toBeGreaterThan(0)
    })

    it('should have response interceptor configured', () => {
      // Used to handle 401 errors and redirect to login
      expect(apiClient.interceptors.response.handlers.length).toBeGreaterThan(0)
    })
  })
})
