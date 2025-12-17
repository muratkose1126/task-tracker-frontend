import { authApi } from '@/lib/auth'
import { apiClient } from '@/lib/api'

// Mock the API client
jest.mock('@/lib/api', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    defaults: {
      baseURL: 'http://localhost:8000/api',
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    },
    interceptors: {
      request: { handlers: [1] },
      response: { handlers: [1] },
    },
  },
  getCsrfCookie: jest.fn(),
}))

describe('Auth API - Login/Register/Logout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Login', () => {
    it('should send email and password to backend', async () => {
      const loginData = {
        email: 'alice@example.com',
        password: 'password123',
      }

      const mockResponse = {
        data: {
          user: {
            id: 1,
            name: 'Alice',
            email: 'alice@example.com',
            email_verified_at: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          token: 'session-token',
        },
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      // Call the login API
      const result = await authApi.login(loginData)

      // Verify API was called with correct data
      expect(apiClient.post).toHaveBeenCalledWith('/auth/session/login', loginData)

      // Verify response contains user data
      expect(result.user.email).toBe('alice@example.com')
      expect(result.user.id).toBe(1)
    })

    it('should handle login error when wrong password', async () => {
      const loginData = {
        email: 'alice@example.com',
        password: 'wrongpassword',
      }

      // Backend returns 401 Unauthorized
      ;(apiClient.post as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials')
      )

      // Attempt to login should throw error
      await expect(authApi.login(loginData)).rejects.toThrow(
        'Invalid credentials'
      )
    })
  })

  describe('User Registration', () => {
    it('should register new user with email and password', async () => {
      const registerData = {
        name: 'Bob',
        email: 'bob@example.com',
        password: 'password123',
        password_confirmation: 'password123',
      }

      const mockResponse = {
        data: {
          user: {
            id: 2,
            name: 'Bob',
            email: 'bob@example.com',
            email_verified_at: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          token: 'session-token',
        },
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await authApi.register(registerData)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/session/register',
        registerData
      )
      expect(result.user.email).toBe('bob@example.com')
    })
  })

  describe('Logout', () => {
    it('should clear session when user logs out', async () => {
      ;(apiClient.post as jest.Mock).mockResolvedValue({})

      await authApi.logout()

      // Backend endpoint called to destroy session
      expect(apiClient.post).toHaveBeenCalledWith('/auth/session/logout')
    })
  })

  describe('Get Current User', () => {
    it('should fetch authenticated user data', async () => {
      const mockUser = {
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        email_verified_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: { data: mockUser },
      })

      const result = await authApi.getCurrentUser()

      expect(apiClient.get).toHaveBeenCalledWith('/auth/session/me')
      expect(result.email).toBe('alice@example.com')
    })
  })
})
