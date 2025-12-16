import { apiClient } from './api'

export type Space = {
  id: string
  workspace_id: string
  name: string
  visibility: 'public' | 'private'
  color?: string
  is_archived?: boolean
  created_at?: string
  updated_at?: string
}

export async function listSpaces(workspaceId: string): Promise<Space[]> {
  const { data } = await apiClient.get(`/workspaces/${workspaceId}/spaces`)
  return data.data
}

export async function getSpace(id: string): Promise<Space | null> {
  const { data } = await apiClient.get(`/spaces/${id}`)
  return data.data
}

export async function createSpace(
  payload: {
    workspace_id: string
    name: string
    is_public?: boolean
    color?: string
  }
): Promise<Space> {
  const { workspace_id, name, is_public, color } = payload
  const { data } = await apiClient.post(`/workspaces/${workspace_id}/spaces`, {
    name,
    visibility: is_public ? 'public' : 'private',
    color,
  })
  return data.data
}

export async function updateSpace(
  id: string,
  payload: {
    name?: string
    visibility?: 'public' | 'private'
    color?: string
    is_archived?: boolean
  }
): Promise<Space> {
  const { data } = await apiClient.put(`/spaces/${id}`, payload)
  return data.data
}

export async function deleteSpace(id: string): Promise<void> {
  await apiClient.delete(`/spaces/${id}`)
}
