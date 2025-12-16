import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace, Workspace } from '@/lib/workspaces'
import { useRouter } from 'next/navigation'

export function useWorkspaces() {
  return useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: () => listWorkspaces(),
  })
}

export function useWorkspace(id?: string) {
  return useQuery<Workspace | null>({
    queryKey: ['workspaces', id],
    queryFn: () => (id ? listWorkspaces().then(ws => ws.find(w => w.id === id) ?? null) : Promise.resolve(null)),
    enabled: !!id,
  })
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => createWorkspace(data),
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      router.push(`/workspaces/${newWorkspace.id}`)
    },
  })
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Workspace> }) => updateWorkspace(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
    },
  })
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (id: string) => deleteWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      router.push('/dashboard')
    },
  })
}
