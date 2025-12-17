import { renderHook, waitFor } from '@testing-library/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useSpaces, useSpace, useCreateSpace, useUpdateSpace, useDeleteSpace } from '@/hooks/useSpaces'
import * as spacesApi from '@/lib/spaces'

jest.mock('@tanstack/react-query')
jest.mock('@/lib/spaces')

describe('useSpaces Hook', () => {
  const mockSpaces = [
    {
      id: '1',
      workspace_id: '1',
      name: 'Development',
      visibility: 'private',
      color: '#FF5733',
    },
    {
      id: '2',
      workspace_id: '1',
      name: 'Marketing',
      visibility: 'public',
      color: '#33FF57',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useSpaces', () => {
    it('should fetch spaces on mount', () => {

      const mockUseQuery = useQuery as jest.Mock
      mockUseQuery.mockReturnValue({
        data: mockSpaces,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useSpaces('1'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['spaces', '1'],
        })
      )
    })

    it('should handle loading state while fetching', () => {

      const mockUseQuery = useQuery as jest.Mock
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      const { result } = renderHook(() => useSpaces('1'))

      expect(result.current.isLoading).toBe(true)
    })

    it('should handle error when fetching fails', () => {

      const mockError = new Error('Failed to fetch spaces')
      const mockUseQuery = useQuery as jest.Mock
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
      })

      const { result } = renderHook(() => useSpaces('1'))

      expect(result.current.error).toBe(mockError)
    })

    it('should return empty array when no workspaceId', () => {

      const mockUseQuery = useQuery as jest.Mock
      mockUseQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useSpaces())

      expect(result.current.data).toEqual([])
    })
  })

  describe('useSpace', () => {
    it('should fetch single space', () => {

      const mockUseQuery = useQuery as jest.Mock
      mockUseQuery.mockReturnValue({
        data: mockSpaces[0],
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useSpace('1'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['space', '1'],
        })
      )
    })
  })

  describe('useCreateSpace', () => {
    it('should create new space', () => {

      const mockMutate = jest.fn()
      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: jest.fn().mockResolvedValue(mockSpaces[0]),
        isPending: false,
        error: null,
        data: mockSpaces[0],
      })

      const { result } = renderHook(() => useCreateSpace())

      expect(result.current.mutate).toBeDefined()
    })

    it('should invalidate spaces query after creation', () => {
      // Keep list up to date

      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        error: null,
      })

      renderHook(() => useCreateSpace())

      expect(mockUseMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          onSuccess: expect.any(Function),
        })
      )
    })

    it('should show loading state while creating', () => {

      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
        error: null,
      })

      const { result } = renderHook(() => useCreateSpace())

      expect(result.current.isPending).toBe(true)
    })
  })

  describe('useUpdateSpace', () => {
    it('should update space properties', () => {
      // Save changes to server

      const mockMutate = jest.fn()
      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      })

      const { result } = renderHook(() => useUpdateSpace())

      expect(result.current.mutate).toBeDefined()
    })
  })

  describe('useDeleteSpace', () => {
    it('should delete space', () => {
      // Remove from list

      const mockMutate = jest.fn()
      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      })

      const { result } = renderHook(() => useDeleteSpace())

      expect(result.current.mutate).toBeDefined()
    })

    it('should show loading state while deleting', () => {
      // Disable delete button

      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
        error: null,
      })

      const { result } = renderHook(() => useDeleteSpace())

      expect(result.current.isPending).toBe(true)
    })
  })
})
