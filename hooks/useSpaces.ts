import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listSpaces, getSpace, createSpace, updateSpace, deleteSpace, Space } from '@/lib/spaces'

export function useSpaces(workspaceId?: string) {
  return useQuery<Space[]>({
    queryKey: ['spaces', workspaceId],
    queryFn: () => (workspaceId ? listSpaces(workspaceId) : Promise.resolve([])),
    enabled: !!workspaceId,
  })
}

export function useSpace(spaceId?: string) {
  return useQuery<Space | null>({
    queryKey: ['space', spaceId],
    queryFn: () => (spaceId ? getSpace(spaceId) : Promise.resolve(null)),
    enabled: !!spaceId,
  })
}

export function useCreateSpace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { workspace_id: string; name: string; is_public?: boolean; color?: string }) => 
      createSpace(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spaces', variables.workspace_id] })
    },
  })
}

export function useUpdateSpace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Space> }) => updateSpace(id, data),
    onSuccess: (space) => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
      queryClient.invalidateQueries({ queryKey: ['space', space.id] })
    },
  })
}

export function useDeleteSpace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, workspaceId }: { id: string; workspaceId: string }) => deleteSpace(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spaces', variables.workspaceId] })
      // Ensure refetch happens immediately
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['spaces', variables.workspaceId] })
      }, 50)
    },
  })
}
