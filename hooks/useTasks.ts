'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/lib/tasks'
import type { Task, TaskFormData, TaskWithRelations, TaskComment, CommentFormData, TaskAttachment } from '@/types'

export function useTaskLists(spaceId: string) {
  return useQuery({
    queryKey: ['task-lists', spaceId],
    queryFn: () => tasksApi.getSpaceLists(spaceId),
    enabled: !!spaceId,
    staleTime: 60 * 1000,
  })
}

export function useListTasks(listId: number | null) {
  return useQuery<Task[]>({
    queryKey: ['tasks', 'list', listId],
    queryFn: () => listId ? tasksApi.getListTasks(listId) : Promise.resolve([]),
    enabled: !!listId,
    staleTime: 60 * 1000,
  })
}

export function useAllWorkspaceTasks() {
  return useQuery<Task[]>({
    queryKey: ['tasks', 'all'],
    queryFn: () => tasksApi.getAllTasks(),
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
    mutationFn: ({ listId, data }: { listId: number; data: TaskFormData }) =>
      tasksApi.createTask(listId, data),
    onSuccess: (task: Task, { listId }) => {
      // Update list tasks cache
      queryClient.setQueryData<Task[]>(['tasks', 'list', listId], (old = []) => [task, ...old])
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
      queryClient.invalidateQueries({ queryKey: ['tasks', 'list', task.list_id] })
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

export function useReorderTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ listId, tasks }: { listId: string | number; tasks: Task[] }) =>
      tasksApi.reorderTasks(listId, tasks.map((t, idx) => ({ id: t.id, order: idx }))),
    onSuccess: (_, { listId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'list', listId] })
    },
  })
}

export function useUpdateList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string } }) =>
      tasksApi.updateList(id, data),
    onSuccess: (list) => {
      queryClient.invalidateQueries({ queryKey: ['task-lists'] })
    },
  })
}

export function useDeleteList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tasksApi.deleteList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-lists'] })
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
export function useTasks(listId?: string | null) {
  // If listId is provided (string), use it for list tasks
  if (listId) {
    return useListTasks(Number(listId));
  }
  
  // Otherwise return all tasks
  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getAllTasks(),
    staleTime: 60 * 1000,
  })
}
