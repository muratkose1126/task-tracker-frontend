export type TaskList = {
  id: string
  space_id: string
  group_id?: string | null
  name: string
  status_schema?: Record<string, unknown>
  is_archived?: boolean
  created_at?: string
  updated_at?: string
}
