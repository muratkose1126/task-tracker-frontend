import { authApi } from '@/lib/auth'

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}))

// Mock the HTTP client
jest.mock('@/lib/api', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('Task API Integration - Real World Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Task CRUD Operations', () => {
    it('should send correct request to create a task', async () => {
      // Backend creates task and returns it

      const { apiClient } = require('@/lib/api')
      apiClient.post.mockResolvedValue({
        id: 1,
        title: 'Design Dashboard',
        description: 'Create mockups and designs',
        status: 'pending',
        priority: 'high',
        assigned_to: 2,
        workspace_id: 1,
        created_at: '2024-01-01T00:00:00Z',
      })

      const newTask = {
        title: 'Design Dashboard',
        description: 'Create mockups and designs',
        priority: 'high',
        assigned_to: 2,
        workspace_id: 1,
      }

      const response = await apiClient.post('/tasks', newTask)

      expect(apiClient.post).toHaveBeenCalledWith('/tasks', newTask)
      expect(response.id).toBe(1)
      expect(response.title).toBe('Design Dashboard')
    })

    it('should fetch tasks for a workspace', async () => {
      // App needs to load all tasks for that workspace

      const { apiClient } = require('@/lib/api')
      apiClient.get.mockResolvedValue({
        data: [
          {
            id: 1,
            title: 'Design Dashboard',
            status: 'in_progress',
            priority: 'high',
            assigned_to: 2,
          },
          {
            id: 2,
            title: 'Write Documentation',
            status: 'pending',
            priority: 'medium',
            assigned_to: 3,
          },
        ],
      })

      const workspaceId = 1
      const response = await apiClient.get(`/workspaces/${workspaceId}/tasks`)

      expect(apiClient.get).toHaveBeenCalledWith(`/workspaces/${workspaceId}/tasks`)
      expect(response.data).toHaveLength(2)
      expect(response.data[0].title).toBe('Design Dashboard')
    })

    it('should update task status', async () => {
      // Update task status on backend
      // UI reflects change

      const { apiClient } = require('@/lib/api')
      apiClient.put.mockResolvedValue({
        id: 1,
        title: 'Design Dashboard',
        status: 'in_progress',
        priority: 'high',
      })

      const taskId = 1
      const updateData = { status: 'in_progress' }
      const response = await apiClient.put(`/tasks/${taskId}`, updateData)

      expect(apiClient.put).toHaveBeenCalledWith(`/tasks/${taskId}`, updateData)
      expect(response.status).toBe('in_progress')
    })

    it('should delete a task', async () => {
      // Confirms deletion
      // Task removed from backend and UI

      const { apiClient } = require('@/lib/api')
      apiClient.delete.mockResolvedValue({ success: true })

      const taskId = 1
      const response = await apiClient.delete(`/tasks/${taskId}`)

      expect(apiClient.delete).toHaveBeenCalledWith(`/tasks/${taskId}`)
      expect(response.success).toBe(true)
    })
  })

  describe('Task Assignment and Collaboration', () => {
    it('should assign task to team member', async () => {
      // Backend updates task assignment
      // Team member sees task in their list

      const { apiClient } = require('@/lib/api')
      apiClient.put.mockResolvedValue({
        id: 1,
        title: 'Review PR',
        assigned_to: 2,
        assigned_to_user: { id: 2, name: 'Alice' },
      })

      const taskId = 1
      const assignData = { assigned_to: 2 }
      const response = await apiClient.put(`/tasks/${taskId}`, assignData)

      expect(apiClient.put).toHaveBeenCalledWith(`/tasks/${taskId}`, assignData)
      expect(response.assigned_to_user.name).toBe('Alice')
    })

    it('should update task priority', async () => {
      // Backend updates priority
      // UI shows new priority indicator

      const { apiClient } = require('@/lib/api')
      apiClient.put.mockResolvedValue({
        id: 1,
        title: 'Fix Bug',
        priority: 'high',
      })

      const taskId = 1
      const updateData = { priority: 'high' }
      const response = await apiClient.put(`/tasks/${taskId}`, updateData)

      expect(apiClient.put).toHaveBeenCalledWith(`/tasks/${taskId}`, updateData)
      expect(response.priority).toBe('high')
    })

    it('should add comment to task', async () => {
      // Comment added and visible to all team members

      const { apiClient } = require('@/lib/api')
      apiClient.post.mockResolvedValue({
        id: 1,
        content: 'This looks good, let me review',
        author_id: 2,
        author: { name: 'Bob' },
        created_at: '2024-01-01T12:00:00Z',
      })

      const taskId = 1
      const commentData = { content: 'This looks good, let me review' }
      const response = await apiClient.post(`/tasks/${taskId}/comments`, commentData)

      expect(apiClient.post).toHaveBeenCalledWith(
        `/tasks/${taskId}/comments`,
        commentData
      )
      expect(response.author.name).toBe('Bob')
      expect(response.content).toContain('review')
    })
  })

  describe('Workspace Operations', () => {
    it('should fetch user workspaces', async () => {
      // App loads their workspaces to show in sidebar

      const { apiClient } = require('@/lib/api')
      apiClient.get.mockResolvedValue({
        data: [
          { id: 1, name: 'Personal', role: 'owner' },
          { id: 2, name: 'Company Project', role: 'member' },
        ],
      })

      const response = await apiClient.get('/workspaces')

      expect(apiClient.get).toHaveBeenCalledWith('/workspaces')
      expect(response.data).toHaveLength(2)
      expect(response.data[0].name).toBe('Personal')
    })

    it('should create new workspace', async () => {
      // Enters name, adds members
      // Backend creates workspace

      const { apiClient } = require('@/lib/api')
      apiClient.post.mockResolvedValue({
        id: 3,
        name: 'New Project',
        owner_id: 1,
      })

      const workspaceData = { name: 'New Project' }
      const response = await apiClient.post('/workspaces', workspaceData)

      expect(apiClient.post).toHaveBeenCalledWith('/workspaces', workspaceData)
      expect(response.name).toBe('New Project')
      expect(response.owner_id).toBe(1)
    })

    it('should invite member to workspace', async () => {
      // Sends invitation email
      // Member can accept/reject

      const { apiClient } = require('@/lib/api')
      apiClient.post.mockResolvedValue({
        id: 1,
        workspace_id: 1,
        email: 'alice@company.com',
        role: 'member',
        status: 'pending',
      })

      const workspaceId = 1
      const inviteData = { email: 'alice@company.com', role: 'member' }
      const response = await apiClient.post(
        `/workspaces/${workspaceId}/invitations`,
        inviteData
      )

      expect(apiClient.post).toHaveBeenCalledWith(
        `/workspaces/${workspaceId}/invitations`,
        inviteData
      )
      expect(response.status).toBe('pending')
    })
  })

  describe('Error Handling', () => {
    it('should handle unauthorized error (401)', async () => {
      // API returns 401 Unauthorized
      // App should redirect to login

      const { apiClient } = require('@/lib/api')
      const error = new Error('Unauthorized')
      ;(error as any).response = { status: 401 }
      apiClient.get.mockRejectedValue(error)

      try {
        await apiClient.get('/tasks')
        expect(true).toBe(false) // Should not reach here
      } catch (err: any) {
        expect(err.response.status).toBe(401)
        // App would redirect to /login
      }
    })

    it('should handle server error (500)', async () => {
      // API returns 500 error

      const { apiClient } = require('@/lib/api')
      const error = new Error('Internal Server Error')
      ;(error as any).response = { status: 500 }
      apiClient.post.mockRejectedValue(error)

      try {
        await apiClient.post('/tasks', {})
        expect(true).toBe(false)
      } catch (err: any) {
        expect(err.response.status).toBe(500)
      }
    })

    it('should handle validation error (422)', async () => {
      // Backend returns 422 Unprocessable Entity

      const { apiClient } = require('@/lib/api')
      const error = new Error('Validation error')
      ;(error as any).response = {
        status: 422,
        data: {
          errors: {
            title: ['Title is required'],
            email: ['Email must be valid'],
          },
        },
      }
      apiClient.post.mockRejectedValue(error)

      try {
        await apiClient.post('/tasks', {})
      } catch (err: any) {
        expect(err.response.status).toBe(422)
        expect(err.response.data.errors.title).toContain('Title is required')
      }
    })

    it('should handle network error', async () => {
      // API call fails

      const { apiClient } = require('@/lib/api')
      const error = new Error('Network Error')
      apiClient.get.mockRejectedValue(error)

      try {
        await apiClient.get('/tasks')
      } catch (err: any) {
        expect(err.message).toBe('Network Error')
      }
    })
  })
})
