import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listGroups, getGroup, createGroup, updateGroup, deleteGroup } from '@/lib/groups'
import type { Group } from '@/lib/groups'

export function useGroups(spaceId: string, options = {}) {
  return useQuery({
    queryKey: ['groups', spaceId],
    queryFn: () => listGroups(spaceId),
    enabled: !!spaceId,
    refetchOnWindowFocus: true,
    ...options,
  })
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => getGroup(id),
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ spaceId, data }: { spaceId: string; data: { name: string; color?: string } }) =>
      createGroup(spaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.spaceId] })
    },
  })
}

export function useUpdateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; color?: string } }) =>
      updateGroup(id, data),
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: ['groups', group.id] })
      queryClient.invalidateQueries({ queryKey: ['groups', group.space_id] })
    },
  })
}

export function useDeleteGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, spaceId }: { id: string; spaceId: string }) => deleteGroup(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.spaceId] })
      // Ensure refetch happens immediately
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['groups', variables.spaceId] })
      }, 50)
    },
  })
}
