// Project Types
export interface Project {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ProjectMember {
  id: number
  project_id: number
  user_id: number
  role: 'owner' | 'manager' | 'developer'
  created_at: string
  updated_at: string
}

export interface ProjectStats {
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  todo_tasks: number
  completion_percentage: number
}

// Form Types
export interface ProjectFormData {
  name: string
  description?: string
}
