import { apiClient } from './api'

export type Workspace = {
  id: string
  name: string
  slug?: string
  description?: string
  owner_id?: string
  settings?: Record<string, any>
  last_visited_path?: string
  created_at?: string
  updated_at?: string
}

export async function listWorkspaces(): Promise<Workspace[]> {
  const { data } = await apiClient.get('/workspaces')
  return data.data
}

export async function getWorkspace(id: string): Promise<Workspace | null> {
  const { data } = await apiClient.get(`/workspaces/${id}`)
  return data.data
}

export async function createWorkspace(payload: {
  name: string
  description?: string
  settings?: Record<string, any>
}): Promise<Workspace> {
  const { data } = await apiClient.post('/workspaces', payload)
  return data.data
}

export async function updateWorkspace(
  id: string,
  payload: {
    name?: string
    description?: string
    settings?: Record<string, any>
  }
): Promise<Workspace> {
  const { data } = await apiClient.put(`/workspaces/${id}`, payload)
  return data.data
}

export async function deleteWorkspace(id: string): Promise<void> {
  await apiClient.delete(`/workspaces/${id}`)
}

export async function updateLastVisited(id: string, path: string): Promise<void> {
  await apiClient.post(`/workspaces/${id}/last-visited`, { path })
}
