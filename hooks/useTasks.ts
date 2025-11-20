'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/lib/tasks'
import type { Task, TaskFormData, TaskWithRelations, TaskComment, CommentFormData, TaskAttachment } from '@/types'

export function useProjectTasks(projectId: number | null) {
  return useQuery<Task[]>({
    queryKey: ['tasks', 'project', projectId],
    queryFn: () => projectId ? tasksApi.getProjectTasks(projectId) : Promise.resolve([]),
    enabled: !!projectId,
    staleTime: 60 * 1000,
  })
}

export function useTask(id: number | null) {
  return useQuery<Task | null>({
    queryKey: ['tasks', id],
    queryFn: () => id ? tasksApi.getTask(id) : Promise.resolve(null),
    enabled: !!id,
    staleTime: 60 * 1000,
  })
}

export function useTaskWithRelations(id: number | null) {
  return useQuery<TaskWithRelations | null>({
    queryKey: ['tasks', id, 'with-relations'],
    queryFn: () => id ? tasksApi.getTaskWithRelations(id) : Promise.resolve(null),
    enabled: !!id,
    staleTime: 60 * 1000,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: TaskFormData }) =>
      tasksApi.createTask(projectId, data),
    onSuccess: (task: Task, { projectId }) => {
      // Update project tasks list
      queryClient.setQueryData<Task[]>(['tasks', 'project', projectId], (old = []) => [task, ...old])
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TaskFormData> }) =>
      tasksApi.updateTask(id, data),
    onSuccess: (task: Task) => {
      queryClient.setQueryData<Task[]>(['tasks'], (old = []) =>
        old.map((t) => (t.id === task.id ? task : t))
      )
      queryClient.setQueryData(['tasks', task.id], task)
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', task.project_id] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => tasksApi.deleteTask(id),
    onSuccess: (_data, id: number) => {
      queryClient.setQueryData<Task[]>(['tasks'], (old = []) => old.filter((t) => t.id !== id))
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// Task Comments
export function useTaskComments(taskId: number | null) {
  return useQuery<TaskComment[]>({
    queryKey: ['task-comments', taskId],
    queryFn: () => taskId ? tasksApi.getTaskComments(taskId) : Promise.resolve([]),
    enabled: !!taskId,
    staleTime: 30 * 1000,
  })
}

export function useCreateTaskComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: CommentFormData }) =>
      tasksApi.createTaskComment(taskId, data),
    onSuccess: (comment: TaskComment) => {
      queryClient.setQueryData<TaskComment[]>(['task-comments', comment.task_id], (old = []) => [
        ...old,
        comment,
      ])
    },
  })
}

export function useDeleteTaskComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => tasksApi.deleteTaskComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments'] })
    },
  })
}

// Task Attachments
export function useTaskAttachments(taskId: number | null) {
  return useQuery<TaskAttachment[]>({
    queryKey: ['task-attachments', taskId],
    queryFn: () => taskId ? tasksApi.getTaskAttachments(taskId) : Promise.resolve([]),
    enabled: !!taskId,
    staleTime: 60 * 1000,
  })
}

export function useUploadTaskAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: number; file: File }) =>
      tasksApi.uploadTaskAttachment(taskId, file),
    onSuccess: (attachment: TaskAttachment) => {
      queryClient.setQueryData<TaskAttachment[]>(['task-attachments', attachment.task_id], (old = []) => [
        ...old,
        attachment,
      ])
    },
  })
}

export function useDeleteTaskAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attachmentId: number) => tasksApi.deleteTaskAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-attachments'] })
    },
  })
}

// All Tasks (for dashboard)
export function useTasks() {
  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getAllTasks(),
    staleTime: 60 * 1000,
  })
}
