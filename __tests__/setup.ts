import React from 'react'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock zustand store
jest.mock('@/store/authStore', () => ({
  useAuthStore: jest.fn((selector) => {
    const mockState = {
      user: null,
      isAuthenticated: false,
      initialized: false,
      setAuth: jest.fn(),
      clearAuth: jest.fn(),
      setInitialized: jest.fn(),
    }
    return selector(mockState)
  }),
}))

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(() => ({
    setQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
  })),
  QueryClient: jest.fn(() => ({})),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))
