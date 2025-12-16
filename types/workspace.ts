export type Workspace = {
  id: string
  name: string
  slug: string
  owner_id: string
  description?: string
  settings?: Record<string, unknown>
  last_visited_path?: string
  created_at?: string
  updated_at?: string
}

export type WorkspaceMember = {
  id: string
  workspace_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'guest'
  created_at?: string
  updated_at?: string
}
