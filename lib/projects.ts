import { apiClient } from './api'
import type { Project, ProjectFormData } from '@/types'

export const projectsApi = {
  async getProjects(): Promise<Project[]> {
    const response = await apiClient.get<{ data: Project[] }>('/projects')
    return response.data.data
  },

  async getProject(id: number): Promise<Project> {
    const response = await apiClient.get<{ data: Project }>(`/projects/${id}`)
    return response.data.data
  },

  async createProject(data: ProjectFormData): Promise<Project> {
    const response = await apiClient.post<{ data: Project }>('/projects', data)
    return response.data.data
  },

  async updateProject(id: number, data: ProjectFormData): Promise<Project> {
    const response = await apiClient.put<{ data: Project }>(`/projects/${id}`, data)
    return response.data.data
  },

  async deleteProject(id: number): Promise<void> {
    await apiClient.delete(`/projects/${id}`)
  },
}

export default projectsApi
