import { apiClient } from './api'

export type TaskList = {
  id: string
  space_id: string
  group_id?: string | null
  name: string
  status_schema?: Record<string, any>
  is_archived?: boolean
  created_at?: string
  updated_at?: string
}

export async function listTaskLists(spaceId: string): Promise<TaskList[]> {
  const { data } = await apiClient.get(`/spaces/${spaceId}/lists`)
  return data.data
}

export async function getTaskList(id: string): Promise<TaskList | null> {
  const { data } = await apiClient.get(`/lists/${id}`)
  return data.data
}

export async function createTaskList(
  spaceId: string,
  payload: {
    name: string
    group_id?: string | null
    status_schema?: Record<string, any>
  }
): Promise<TaskList> {
  const { data } = await apiClient.post(`/spaces/${spaceId}/lists`, payload)
  return data.data
}

export async function updateTaskList(
  id: string,
  payload: {
    name?: string
    group_id?: string | null
    status_schema?: Record<string, any>
    is_archived?: boolean
  }
): Promise<TaskList> {
  const { data } = await apiClient.put(`/lists/${id}`, payload)
  return data.data
}

export async function deleteTaskList(id: string): Promise<void> {
  await apiClient.delete(`/lists/${id}`)
}
