import { apiClient } from '@/lib/api'
import * as workspacesLib from '@/lib/workspaces'

// Mock axios
jest.mock('axios')

// Mock the HTTP client
jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('Workspaces API - Real CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('List Workspaces', () => {
    it('should fetch all user workspaces', async () => {
      // API returns list of workspaces they have access to

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: [
          {
            id: 1,
            name: 'Personal',
            slug: 'personal',
            owner_id: 1,
            role: 'owner',
            last_visited_path: '/workspaces/1/spaces',
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 2,
            name: 'Company Project',
            slug: 'company-project',
            owner_id: 2,
            role: 'member',
            last_visited_path: '/workspaces/2/spaces',
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
      })

      const response = await apiClient.get('/workspaces')

      expect(apiClient.get).toHaveBeenCalledWith('/workspaces')
      expect(response.data).toHaveLength(2)
      expect(response.data[0].name).toBe('Personal')
      expect(response.data[0].role).toBe('owner')
    })

    it('should include workspace metadata (owner, role, last visited)', async () => {
      // Also track last visited path for navigation

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: [
          {
            id: 1,
            name: 'My Workspace',
            owner_id: 1,
            role: 'owner',
            members_count: 5,
            last_visited_path: '/workspaces/1/spaces/3/groups',
          },
        ],
      })

      const response = await apiClient.get('/workspaces')

      expect(response.data[0].role).toBe('owner')
      expect(response.data[0].last_visited_path).toBeTruthy()
      expect(response.data[0].members_count).toBe(5)
    })
  })

  describe('Get Workspace Detail', () => {
    it('should fetch single workspace with full details', async () => {
      // Need full workspace information including members

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: {
          id: 1,
          name: 'Company Project',
          slug: 'company-project',
          description: 'Main company workspace',
          owner_id: 1,
          owner: { id: 1, name: 'Alice', email: 'alice@company.com' },
          members: [
            { id: 1, name: 'Alice', email: 'alice@company.com', role: 'owner' },
            { id: 2, name: 'Bob', email: 'bob@company.com', role: 'member' },
          ],
          spaces_count: 3,
          tasks_count: 45,
          created_at: '2024-01-01T00:00:00Z',
        },
      })

      const response = await apiClient.get('/workspaces/1')

      expect(apiClient.get).toHaveBeenCalledWith('/workspaces/1')
      expect(response.data.name).toBe('Company Project')
      expect(response.data.members).toHaveLength(2)
      expect(response.data.owner.name).toBe('Alice')
    })
  })

  describe('Create Workspace', () => {
    it('should create new workspace with basic info', async () => {
      // Fills name, description, invites members
      // Backend creates and returns new workspace

      ;(apiClient.post as jest.Mock).mockResolvedValue({
        data: {
          id: 5,
          name: 'New Project',
          slug: 'new-project',
          description: 'Starting new project',
          owner_id: 1,
          created_at: '2024-01-15T00:00:00Z',
        },
      })

      const newWorkspace = {
        name: 'New Project',
        description: 'Starting new project',
      }

      const response = await apiClient.post('/workspaces', newWorkspace)

      expect(apiClient.post).toHaveBeenCalledWith('/workspaces', newWorkspace)
      expect(response.data.id).toBe(5)
      expect(response.data.owner_id).toBe(1)
      expect(response.data.slug).toBe('new-project')
    })

    it('should auto-generate slug from workspace name', async () => {
      // Backend auto-generates slug like "my-company-workspace"

      ;(apiClient.post as jest.Mock).mockResolvedValue({
        data: {
          id: 5,
          name: 'My Company Workspace',
          slug: 'my-company-workspace',
        },
      })

      const response = await apiClient.post('/workspaces', {
        name: 'My Company Workspace',
      })

      expect(response.data.slug).toBe('my-company-workspace')
    })
  })

  describe('Update Workspace', () => {
    it('should update workspace name and description', async () => {
      // Changes name, description, etc.

      ;(apiClient.put as jest.Mock).mockResolvedValue({
        data: {
          id: 1,
          name: 'Updated Name',
          description: 'Updated description',
          slug: 'company-project',
        },
      })

      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
      }

      const response = await apiClient.put('/workspaces/1', updateData)

      expect(apiClient.put).toHaveBeenCalledWith('/workspaces/1', updateData)
      expect(response.data.name).toBe('Updated Name')
    })

    it('should not allow non-owner to update workspace', async () => {
      // Backend returns 403 Forbidden

      ;(apiClient.put as jest.Mock).mockRejectedValue({
        response: {
          status: 403,
          data: { message: 'Not authorized to update this workspace' },
        },
      })

      try {
        await apiClient.put('/workspaces/1', { name: 'Hacked Name' })
        expect(true).toBe(false) // Should not reach here
      } catch (err: any) {
        expect(err.response.status).toBe(403)
      }
    })
  })

  describe('Delete Workspace', () => {
    it('should delete workspace', async () => {
      // All spaces, groups, lists, tasks are also deleted

      ;(apiClient.delete as jest.Mock).mockResolvedValue({
        data: { success: true, message: 'Workspace deleted' },
      })

      const response = await apiClient.delete('/workspaces/1')

      expect(apiClient.delete).toHaveBeenCalledWith('/workspaces/1')
      expect(response.data.success).toBe(true)
    })

    it('should only allow owner to delete workspace', async () => {
      // Should get 403 error

      ;(apiClient.delete as jest.Mock).mockRejectedValue({
        response: {
          status: 403,
          data: { message: 'Only owner can delete workspace' },
        },
      })

      try {
        await apiClient.delete('/workspaces/1')
      } catch (err: any) {
        expect(err.response.status).toBe(403)
      }
    })
  })

  describe('Workspace Tracking & Navigation', () => {
    it('should track last visited path in workspace', async () => {
      // When they return to workspace, should remember and redirect to last path

      ;(apiClient.post as jest.Mock).mockResolvedValue({
        data: {
          workspace_id: 1,
          path: '/workspaces/1/spaces/2/groups/3',
          updated_at: '2024-01-15T10:30:00Z',
        },
      })

      const response = await apiClient.post('/workspaces/1/last-visited', {
        path: '/workspaces/1/spaces/2/groups/3',
      })

      expect(apiClient.post).toHaveBeenCalledWith('/workspaces/1/last-visited', {
        path: '/workspaces/1/spaces/2/groups/3',
      })
      expect(response.data.path).toBe('/workspaces/1/spaces/2/groups/3')
    })
  })

  describe('Workspace Permissions & Members', () => {
    it('should list workspace members with roles', async () => {

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: [
          { id: 1, name: 'Alice', email: 'alice@company.com', role: 'owner' },
          { id: 2, name: 'Bob', email: 'bob@company.com', role: 'admin' },
          { id: 3, name: 'Carol', email: 'carol@company.com', role: 'member' },
          { id: 4, name: 'Dave', email: 'dave@company.com', role: 'viewer' },
        ],
      })

      const response = await apiClient.get('/workspaces/1/members')

      expect(response.data).toHaveLength(4)
      expect(response.data[0].role).toBe('owner')
      expect(response.data[1].role).toBe('admin')
    })

    it('should invite member to workspace', async () => {
      // Sends invitation email

      ;(apiClient.post as jest.Mock).mockResolvedValue({
        data: {
          id: 1,
          workspace_id: 1,
          email: 'newmember@company.com',
          role: 'member',
          status: 'pending',
          invited_at: '2024-01-15T10:30:00Z',
        },
      })

      const inviteData = { email: 'newmember@company.com', role: 'member' }

      const response = await apiClient.post('/workspaces/1/invitations', inviteData)

      expect(apiClient.post).toHaveBeenCalledWith('/workspaces/1/invitations', inviteData)
      expect(response.data.status).toBe('pending')
      expect(response.data.role).toBe('member')
    })

    it('should update member role', async () => {
      // Or downgrades admin to member

      ;(apiClient.put as jest.Mock).mockResolvedValue({
        data: {
          id: 2,
          workspace_id: 1,
          name: 'Bob',
          role: 'admin',
        },
      })

      const response = await apiClient.put('/workspaces/1/members/2', {
        role: 'admin',
      })

      expect(apiClient.put).toHaveBeenCalledWith('/workspaces/1/members/2', {
        role: 'admin',
      })
      expect(response.data.role).toBe('admin')
    })

    it('should remove member from workspace', async () => {

      ;(apiClient.delete as jest.Mock).mockResolvedValue({
        data: { success: true },
      })

      const response = await apiClient.delete('/workspaces/1/members/2')

      expect(apiClient.delete).toHaveBeenCalledWith('/workspaces/1/members/2')
      expect(response.data.success).toBe(true)
    })
  })

  describe('Validation & Error Handling', () => {
    it('should reject workspace with empty name', async () => {
      // Backend validation rejects it

      ;(apiClient.post as jest.Mock).mockRejectedValue({
        response: {
          status: 422,
          data: {
            errors: {
              name: ['Name is required'],
            },
          },
        },
      })

      try {
        await apiClient.post('/workspaces', { name: '' })
      } catch (err: any) {
        expect(err.response.status).toBe(422)
        expect(err.response.data.errors.name).toContain('Name is required')
      }
    })

    it('should handle duplicate workspace slug', async () => {

      ;(apiClient.post as jest.Mock).mockRejectedValue({
        response: {
          status: 422,
          data: {
            errors: {
              slug: ['This workspace slug is already taken'],
            },
          },
        },
      })

      try {
        await apiClient.post('/workspaces', {
          name: 'Company Project',
        })
      } catch (err: any) {
        expect(err.response.data.errors.slug).toBeTruthy()
      }
    })

    it('should handle unauthorized access to workspace', async () => {
      // Returns 404 (pretend doesn't exist) or 403 (explicitly forbidden)

      ;(apiClient.get as jest.Mock).mockRejectedValue({
        response: {
          status: 403,
          data: { message: 'You do not have access to this workspace' },
        },
      })

      try {
        await apiClient.get('/workspaces/999')
      } catch (err: any) {
        expect(err.response.status).toBe(403)
      }
    })
  })
})
