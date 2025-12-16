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

export type SpaceMember = {
  id: string
  space_id: string
  user_id: string
  role: 'admin' | 'editor' | 'commenter' | 'viewer'
  created_at?: string
  updated_at?: string
}
