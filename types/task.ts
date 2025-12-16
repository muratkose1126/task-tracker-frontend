import type { User } from './auth'

// Task Types
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: number
  list_id: number
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

// Task Attachment Types
export interface TaskAttachment {
  id: number
  task_id: number
  file_path: string
  file_name: string
  file_type: string
  file_size: number
  created_at: string
  updated_at: string
}

// Task with Relations
export interface TaskWithRelations extends Task {
  comments?: TaskComment[]
  attachments?: TaskAttachment[]
  assignee?: User
  creator?: User
}

// Form Types
export interface TaskFormData {
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
