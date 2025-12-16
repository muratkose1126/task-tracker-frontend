import { apiClient } from './api'

export type Group = {
  id: string
  space_id: string
  name: string
  color?: string
  created_at?: string
  updated_at?: string
}

export async function listGroups(spaceId: string): Promise<Group[]> {
  const { data } = await apiClient.get(`/spaces/${spaceId}/groups`)
  return data.data
}

export async function getGroup(id: string): Promise<Group | null> {
  const { data } = await apiClient.get(`/groups/${id}`)
  return data.data
}

export async function createGroup(
  spaceId: string,
  payload: {
    name: string
    color?: string
  }
): Promise<Group> {
  const { data } = await apiClient.post(`/spaces/${spaceId}/groups`, payload)
  return data.data
}

export async function updateGroup(
  id: string,
  payload: {
    name?: string
    color?: string
  }
): Promise<Group> {
  const { data } = await apiClient.put(`/groups/${id}`, payload)
  return data.data
}

export async function deleteGroup(id: string): Promise<void> {
  await apiClient.delete(`/groups/${id}`)
}
