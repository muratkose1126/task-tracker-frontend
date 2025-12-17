import {
  listSpaces,
  getSpace,
  createSpace,
  updateSpace,
  deleteSpace,
  type Space,
} from '@/lib/spaces'
import { apiClient } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('Spaces API', () => {
  const mockSpaces: Space[] = [
    {
      id: '1',
      workspace_id: '1',
      name: 'Development',
      visibility: 'private',
      color: '#FF5733',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      workspace_id: '1',
      name: 'Marketing',
      visibility: 'public',
      color: '#33FF57',
      created_at: '2024-01-02T00:00:00Z',
    },
  ]

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('listSpaces', () => {
    it('should list all spaces in a workspace', async () => {

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: { data: mockSpaces },
      })

      const result = await listSpaces('1')

      expect(apiClient.get).toHaveBeenCalledWith('/workspaces/1/spaces')
      expect(result).toEqual(mockSpaces)
      expect(result).toHaveLength(2)
    })

    it('should return empty array if no spaces exist', async () => {

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: { data: [] },
      })

      const result = await listSpaces('2')

      expect(result).toEqual([])
    })

    it('should handle workspace not found error', async () => {

      ;(apiClient.get as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'Workspace not found' } },
      })

      await expect(listSpaces('999')).rejects.toMatchObject({
        response: { status: 404 },
      })
    })

    it('should handle permission error when listing spaces', async () => {

      ;(apiClient.get as jest.Mock).mockRejectedValue({
        response: { status: 403, data: { message: 'Unauthorized' } },
      })

      await expect(listSpaces('1')).rejects.toMatchObject({
        response: { status: 403 },
      })
    })
  })

  describe('getSpace', () => {
    it('should get space by ID', async () => {

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: { data: mockSpaces[0] },
      })

      const result = await getSpace('1')

      expect(apiClient.get).toHaveBeenCalledWith('/spaces/1')
      expect(result).toEqual(mockSpaces[0])
    })

    it('should return null if space not found', async () => {

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: { data: null },
      })

      const result = await getSpace('999')

      expect(result).toBeNull()
    })

    it('should handle space not found error', async () => {

      ;(apiClient.get as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'Space not found' } },
      })

      await expect(getSpace('999')).rejects.toMatchObject({
        response: { status: 404 },
      })
    })

    it('should handle permission error when accessing space', async () => {

      ;(apiClient.get as jest.Mock).mockRejectedValue({
        response: { status: 403, data: { message: 'Access denied' } },
      })

      await expect(getSpace('1')).rejects.toMatchObject({
        response: { status: 403 },
      })
    })
  })

  describe('createSpace', () => {
    it('should create new public space', async () => {

      const newSpace: Space = {
        id: '3',
        workspace_id: '1',
        name: 'Sales',
        visibility: 'public',
        color: '#0080FF',
        created_at: '2024-01-03T00:00:00Z',
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue({
        data: { data: newSpace },
      })

      const result = await createSpace({
        workspace_id: '1',
        name: 'Sales',
        is_public: true,
        color: '#0080FF',
      })

      expect(apiClient.post).toHaveBeenCalledWith('/workspaces/1/spaces', {
        name: 'Sales',
        visibility: 'public',
        color: '#0080FF',
      })
      expect(result).toEqual(newSpace)
    })

    it('should create new private space', async () => {

      const newSpace: Space = {
        id: '4',
        workspace_id: '1',
        name: 'Private Team',
        visibility: 'private',
        created_at: '2024-01-04T00:00:00Z',
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue({
        data: { data: newSpace },
      })

      const result = await createSpace({
        workspace_id: '1',
        name: 'Private Team',
        is_public: false,
      })

      expect(apiClient.post).toHaveBeenCalledWith('/workspaces/1/spaces', {
        name: 'Private Team',
        visibility: 'private',
        color: undefined,
      })
      expect(result.visibility).toBe('private')
    })

    it('should validate required fields', async () => {

      ;(apiClient.post as jest.Mock).mockRejectedValue({
        response: { status: 422, data: { errors: { name: ['Name is required'] } } },
      })

      await expect(
        createSpace({
          workspace_id: '1',
          name: '',
        })
      ).rejects.toMatchObject({
        response: { status: 422 },
      })
    })

    it('should handle workspace not found on creation', async () => {

      ;(apiClient.post as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'Workspace not found' } },
      })

      await expect(
        createSpace({
          workspace_id: '999',
          name: 'New Space',
        })
      ).rejects.toMatchObject({
        response: { status: 404 },
      })
    })
  })

  describe('updateSpace', () => {
    it('should update space name', async () => {
      // Update navigation immediately

      const updated: Space = {
        ...mockSpaces[0],
        name: 'Engineering',
      }

      ;(apiClient.put as jest.Mock).mockResolvedValue({
        data: { data: updated },
      })

      const result = await updateSpace('1', {
        name: 'Engineering',
      })

      expect(apiClient.put).toHaveBeenCalledWith('/spaces/1', {
        name: 'Engineering',
      })
      expect(result.name).toBe('Engineering')
    })

    it('should update space visibility', async () => {
      // Make it accessible to all team members

      const updated: Space = {
        ...mockSpaces[0],
        visibility: 'public',
      }

      ;(apiClient.put as jest.Mock).mockResolvedValue({
        data: { data: updated },
      })

      const result = await updateSpace('1', {
        visibility: 'public',
      })

      expect(apiClient.put).toHaveBeenCalledWith('/spaces/1', {
        visibility: 'public',
      })
      expect(result.visibility).toBe('public')
    })

    it('should update space color', async () => {
      // Color helps identify space in sidebar

      const updated: Space = {
        ...mockSpaces[0],
        color: '#FF00FF',
      }

      ;(apiClient.put as jest.Mock).mockResolvedValue({
        data: { data: updated },
      })

      const result = await updateSpace('1', {
        color: '#FF00FF',
      })

      expect(result.color).toBe('#FF00FF')
    })

    it('should archive space', async () => {

      const updated: Space = {
        ...mockSpaces[0],
        is_archived: true,
      }

      ;(apiClient.put as jest.Mock).mockResolvedValue({
        data: { data: updated },
      })

      const result = await updateSpace('1', {
        is_archived: true,
      })

      expect(result.is_archived).toBe(true)
    })

    it('should update multiple space properties', async () => {
      // Batch update for efficiency

      const updated: Space = {
        ...mockSpaces[0],
        name: 'Updated Name',
        visibility: 'public',
        color: '#00FF00',
      }

      ;(apiClient.put as jest.Mock).mockResolvedValue({
        data: { data: updated },
      })

      const result = await updateSpace('1', {
        name: 'Updated Name',
        visibility: 'public',
        color: '#00FF00',
      })

      expect(apiClient.put).toHaveBeenCalledWith('/spaces/1', {
        name: 'Updated Name',
        visibility: 'public',
        color: '#00FF00',
      })
      expect(result).toEqual(updated)
    })

    it('should handle space not found on update', async () => {

      ;(apiClient.put as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'Space not found' } },
      })

      await expect(
        updateSpace('999', { name: 'New Name' })
      ).rejects.toMatchObject({
        response: { status: 404 },
      })
    })

    it('should handle permission error on update', async () => {

      ;(apiClient.put as jest.Mock).mockRejectedValue({
        response: { status: 403, data: { message: 'Unauthorized' } },
      })

      await expect(
        updateSpace('1', { name: 'New Name' })
      ).rejects.toMatchObject({
        response: { status: 403 },
      })
    })
  })

  describe('deleteSpace', () => {
    it('should delete space', async () => {
      // Removes from sidebar permanently

      ;(apiClient.delete as jest.Mock).mockResolvedValue({})

      await deleteSpace('1')

      expect(apiClient.delete).toHaveBeenCalledWith('/spaces/1')
    })

    it('should handle space not found on delete', async () => {

      ;(apiClient.delete as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'Space not found' } },
      })

      await expect(deleteSpace('999')).rejects.toMatchObject({
        response: { status: 404 },
      })
    })

    it('should handle permission error on delete', async () => {

      ;(apiClient.delete as jest.Mock).mockRejectedValue({
        response: { status: 403, data: { message: 'Unauthorized' } },
      })

      await expect(deleteSpace('1')).rejects.toMatchObject({
        response: { status: 403 },
      })
    })

    it('should prevent deletion of space with active lists', async () => {

      ;(apiClient.delete as jest.Mock).mockRejectedValue({
        response: {
          status: 422,
          data: { message: 'Space has active lists' },
        },
      })

      await expect(deleteSpace('1')).rejects.toMatchObject({
        response: { status: 422 },
      })
    })
  })
})
