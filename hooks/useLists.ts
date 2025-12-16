import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listTaskLists, getTaskList, createTaskList, updateTaskList, deleteTaskList } from '@/lib/lists'
import type { TaskList } from '@/lib/lists'

export function useTaskLists(spaceId: string, options = {}) {
  return useQuery({
    queryKey: ['lists', spaceId],
    queryFn: () => listTaskLists(spaceId),
    enabled: !!spaceId,
    refetchOnWindowFocus: true,
    ...options,
  })
}

export function useTaskList(id: string) {
  return useQuery({
    queryKey: ['lists', id],
    queryFn: () => getTaskList(id),
  })
}

export function useCreateTaskList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      spaceId, 
      data 
    }: { 
      spaceId: string
      data: { name: string; group_id?: string | null; status_schema?: Record<string, any> } 
    }) => createTaskList(spaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lists', variables.spaceId] })
    },
  })
}

export function useUpdateTaskList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string
      data: { 
        name?: string
        group_id?: string | null
        status_schema?: Record<string, any>
        is_archived?: boolean 
      } 
    }) => updateTaskList(id, data),
    onSuccess: (list) => {
      queryClient.invalidateQueries({ queryKey: ['lists', list.id] })
      queryClient.invalidateQueries({ queryKey: ['lists', list.space_id] })
    },
  })
}

export function useDeleteTaskList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, spaceId }: { id: string; spaceId: string }) => deleteTaskList(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lists', variables.spaceId] })
      // Ensure refetch happens immediately
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['lists', variables.spaceId] })
      }, 50)
    },
  })
}
