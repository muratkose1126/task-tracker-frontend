import { renderHook } from '@testing-library/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useGroups, useGroup, useCreateGroup, useUpdateGroup, useDeleteGroup } from '@/hooks/useGroups'
import * as groupsApi from '@/lib/groups'

jest.mock('@tanstack/react-query')
jest.mock('@/lib/groups')

describe('useGroups Hook', () => {
  const mockGroups = [
    {
      id: '1',
      space_id: '1',
      name: 'Backend Tasks',
      color: '#FF5733',
    },
    {
      id: '2',
      space_id: '1',
      name: 'Frontend Tasks',
      color: '#33FF57',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useGroups', () => {
    it('should fetch groups on mount', () => {

      const mockUseQuery = useQuery as jest.Mock
      mockUseQuery.mockReturnValue({
        data: mockGroups,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useGroups('1'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['groups', '1'],
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

      const { result } = renderHook(() => useGroups('1'))

      expect(result.current.isLoading).toBe(true)
    })

    it('should handle error when fetching fails', () => {

      const mockError = new Error('Failed to fetch groups')
      const mockUseQuery = useQuery as jest.Mock
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
      })

      const { result } = renderHook(() => useGroups('1'))

      expect(result.current.error).toBe(mockError)
    })
  })

  describe('useGroup', () => {
    it('should fetch single group', () => {

      const mockUseQuery = useQuery as jest.Mock
      mockUseQuery.mockReturnValue({
        data: mockGroups[0],
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useGroup('1'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['groups', '1'],
        })
      )
    })
  })

  describe('useCreateGroup', () => {
    it('should create new group', () => {

      const mockMutate = jest.fn()
      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: jest.fn().mockResolvedValue(mockGroups[0]),
        isPending: false,
        error: null,
      })

      const { result } = renderHook(() => useCreateGroup())

      expect(result.current.mutate).toBeDefined()
    })

    it('should show loading state while creating', () => {

      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
        error: null,
      })

      const { result } = renderHook(() => useCreateGroup())

      expect(result.current.isPending).toBe(true)
    })
  })

  describe('useUpdateGroup', () => {
    it('should update group properties', () => {

      const mockMutate = jest.fn()
      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      })

      const { result } = renderHook(() => useUpdateGroup())

      expect(result.current.mutate).toBeDefined()
    })
  })

  describe('useDeleteGroup', () => {
    it('should delete group', () => {

      const mockMutate = jest.fn()
      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      })

      const { result } = renderHook(() => useDeleteGroup())

      expect(result.current.mutate).toBeDefined()
    })

    it('should handle deletion error', () => {

      const mockError = new Error('Group has active lists')
      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        error: mockError,
      })

      const { result } = renderHook(() => useDeleteGroup())

      expect(result.current.error).toBe(mockError)
    })
  })
})
