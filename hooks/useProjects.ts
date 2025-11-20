"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/lib/projects'
import type { Project, ProjectFormData } from '@/types'

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
    staleTime: 60 * 1000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProjectFormData) => projectsApi.createProject(data),
    onSuccess: (project: Project) => {
      // prepend new project into cache if exists
      queryClient.setQueryData<Project[]>(['projects'], (old = []) => [project, ...old])
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => projectsApi.deleteProject(id),
    onSuccess: (_data, id: number) => {
      queryClient.setQueryData<Project[]>(['projects'], (old = []) => old.filter((p) => p.id !== id))
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjectFormData }) => projectsApi.updateProject(id, data),
    onSuccess: (project: Project) => {
      queryClient.setQueryData<Project[]>(['projects'], (old = []) => old.map((p) => (p.id === project.id ? project : p)))
      queryClient.setQueryData(['project', project.id], project)
    },
  })
}
