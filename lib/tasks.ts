import { apiClient } from './api'
import type { Task, TaskFormData, TaskWithRelations, TaskComment, CommentFormData, TaskAttachment, TaskList } from '@/types'

export const tasksApi = {
  // Lists
  async getSpaceLists(spaceId: string): Promise<TaskList[]> {
    const response = await apiClient.get<{ data: TaskList[] }>(`/spaces/${spaceId}/lists`)
    return response.data.data
  },

  async updateList(id: string, data: { name?: string }): Promise<TaskList> {
    const response = await apiClient.patch<{ data: TaskList }>(`/lists/${id}`, data)
    return response.data.data
  },

  async deleteList(id: string): Promise<void> {
    await apiClient.delete(`/lists/${id}`)
  },

  // Tasks - All operations are list-scoped
  async getAllTasks(): Promise<Task[]> {
    const response = await apiClient.get<{ data: Task[] }>('/tasks')
    return response.data.data
  },

  async getListTasks(listId: number): Promise<Task[]> {
    const response = await apiClient.get<{ data: Task[] }>(`/lists/${listId}/tasks`)
    return response.data.data
  },

  async getTask(id: number): Promise<Task> {
    const response = await apiClient.get<{ data: Task }>(`/tasks/${id}`)
    return response.data.data
  },

  async getTaskWithRelations(id: number): Promise<TaskWithRelations> {
    const response = await apiClient.get<{ data: TaskWithRelations }>(`/tasks/${id}`)
    return response.data.data
  },

  async createTask(listId: number, data: TaskFormData): Promise<Task> {
    const response = await apiClient.post<{ data: Task }>(`/lists/${listId}/tasks`, {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      due_date: data.due_date,
    })
    return response.data.data
  },

  async updateTask(id: number, data: Partial<TaskFormData>): Promise<Task> {
    const response = await apiClient.put<{ data: Task }>(`/tasks/${id}`, {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      due_date: data.due_date,
    })
    return response.data.data
  },

  async deleteTask(id: number): Promise<void> {
    await apiClient.delete(`/tasks/${id}`)
  },

  async reorderTasks(listId: string | number, tasks: Array<{ id: number; order: number }>): Promise<void> {
    await apiClient.post(`/lists/${listId}/tasks/reorder`, { tasks })
  },

  // Task Comments - Shallow routing
  async getTaskComments(taskId: number): Promise<TaskComment[]> {
    const response = await apiClient.get<{ data: TaskComment[] }>(`/tasks/${taskId}/comments`)
    return response.data.data
  },

  async createTaskComment(taskId: number, data: CommentFormData): Promise<TaskComment> {
    const response = await apiClient.post<{ data: TaskComment }>(`/tasks/${taskId}/comments`, {
      comment: data.comment,
      type: data.type,
    })
    return response.data.data
  },

  async deleteTaskComment(commentId: number): Promise<void> {
    await apiClient.delete(`/comments/${commentId}`)
  },

  // Task Attachments - Shallow routing
  async getTaskAttachments(taskId: number): Promise<TaskAttachment[]> {
    const response = await apiClient.get<{ data: TaskAttachment[] }>(`/tasks/${taskId}/attachments`)
    return response.data.data
  },

  async uploadTaskAttachment(taskId: number, file: File): Promise<TaskAttachment> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<{ data: TaskAttachment }>(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },

  async deleteTaskAttachment(attachmentId: number): Promise<void> {
    await apiClient.delete(`/attachments/${attachmentId}`)
  },
}

export default tasksApi
