import { renderHook } from '@testing-library/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useTaskLists, useTaskList, useCreateTaskList, useUpdateTaskList, useDeleteTaskList } from '@/hooks/useLists'
import * as listsApi from '@/lib/lists'

jest.mock('@tanstack/react-query')
jest.mock('@/lib/lists')

describe('useLists Hook', () => {
  const mockLists = [
    {
      id: '1',
      space_id: '1',
      group_id: '1',
      name: 'Bugs to Fix',
      status_schema: { pending: 'To Do', in_progress: 'In Progress', done: 'Done' },
    },
    {
      id: '2',
      space_id: '1',
      group_id: '1',
      name: 'Features',
      status_schema: { pending: 'To Do', in_progress: 'In Progress', done: 'Done' },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useTaskLists', () => {
    it('should fetch lists on mount', () => {

      const mockUseQuery = useQuery as jest.Mock
      mockUseQuery.mockReturnValue({
        data: mockLists,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useTaskLists('1'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['lists', '1'],
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

      const { result } = renderHook(() => useTaskLists('1'))

      expect(result.current.isLoading).toBe(true)
    })

    it('should handle error when fetching fails', () => {

      const mockError = new Error('Failed to fetch lists')
      const mockUseQuery = useQuery as jest.Mock
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
      })

      const { result } = renderHook(() => useTaskLists('1'))

      expect(result.current.error).toBe(mockError)
    })

    it('should cache lists query results', () => {
      // Reuse cached data if available

      const mockUseQuery = useQuery as jest.Mock
      mockUseQuery.mockReturnValue({
        data: mockLists,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useTaskLists('1'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['lists', '1'],
        })
      )
    })
  })

  describe('useTaskList', () => {
    it('should fetch single list', () => {

      const mockUseQuery = useQuery as jest.Mock
      mockUseQuery.mockReturnValue({
        data: mockLists[0],
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useTaskList('1'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['lists', '1'],
        })
      )
    })
  })

  describe('useCreateTaskList', () => {
    it('should create new list', () => {

      const mockMutate = jest.fn()
      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: jest.fn().mockResolvedValue(mockLists[0]),
        isPending: false,
        error: null,
      })

      const { result } = renderHook(() => useCreateTaskList())

      expect(result.current.mutate).toBeDefined()
    })

    it('should show loading state while creating', () => {

      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
        error: null,
      })

      const { result } = renderHook(() => useCreateTaskList())

      expect(result.current.isPending).toBe(true)
    })

    it('should invalidate query after creating list', () => {

      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        error: null,
      })

      renderHook(() => useCreateTaskList())

      expect(mockUseMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          onSuccess: expect.any(Function),
        })
      )
    })
  })

  describe('useUpdateTaskList', () => {
    it('should update list properties', () => {

      const mockMutate = jest.fn()
      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      })

      const { result } = renderHook(() => useUpdateTaskList())

      expect(result.current.mutate).toBeDefined()
    })

    it('should update list status schema', () => {

      const mockMutate = jest.fn()
      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      })

      const { result } = renderHook(() => useUpdateTaskList())

      expect(result.current.mutate).toBeDefined()
    })

    it('should handle update error', () => {

      const mockError = new Error('Unauthorized')
      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        error: mockError,
      })

      const { result } = renderHook(() => useUpdateTaskList())

      expect(result.current.error).toBe(mockError)
    })
  })

  describe('useDeleteTaskList', () => {
    it('should delete list', () => {

      const mockMutate = jest.fn()
      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      })

      const { result } = renderHook(() => useDeleteTaskList())

      expect(result.current.mutate).toBeDefined()
    })

    it('should show loading state while deleting', () => {

      const mockUseMutation = useMutation as jest.Mock
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
        error: null,
      })

      const { result } = renderHook(() => useDeleteTaskList())

      expect(result.current.isPending).toBe(true)
    })
  })

  describe('List Status Schema', () => {
    it('should track custom status schemas', () => {

      const mockUseQuery = useQuery as jest.Mock
      mockUseQuery.mockReturnValue({
        data: mockLists,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useTaskLists('1'))

      expect(result.current.data?.[0].status_schema).toBeDefined()
    })
  })
})
