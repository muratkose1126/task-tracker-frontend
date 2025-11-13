// User Types
export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  token: string
}

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

// Task Types
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: number
  project_id: number
  user_id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Task Comment Types
export type CommentType = 'note' | 'status_change' | 'assignment'

export interface TaskComment {
  id: number
  task_id: number
  user_id: number
  comment: string
  type: CommentType
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// API Response Types
export interface ApiResponse<T> {
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface ProjectFormData {
  name: string
  description?: string
}

export interface TaskFormData {
  project_id: number
  user_id: number
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string
}

export interface CommentFormData {
  task_id: number
  comment: string
  type?: CommentType
}
