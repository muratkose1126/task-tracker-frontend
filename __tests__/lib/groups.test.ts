import {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  type Group,
} from '@/lib/groups'
import { apiClient } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('Groups API', () => {
  const mockGroups: Group[] = [
    {
      id: '1',
      space_id: '1',
      name: 'Backend Tasks',
      color: '#FF5733',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      space_id: '1',
      name: 'Frontend Tasks',
      color: '#33FF57',
      created_at: '2024-01-02T00:00:00Z',
    },
  ]

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('listGroups', () => {
    it('should list all groups in a space', async () => {

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: { data: mockGroups },
      })

      const result = await listGroups('1')

      expect(apiClient.get).toHaveBeenCalledWith('/spaces/1/groups')
      expect(result).toEqual(mockGroups)
      expect(result).toHaveLength(2)
    })

    it('should return empty array if no groups exist', async () => {

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: { data: [] },
      })

      const result = await listGroups('2')

      expect(result).toEqual([])
    })

    it('should handle space not found error', async () => {

      ;(apiClient.get as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'Space not found' } },
      })

      await expect(listGroups('999')).rejects.toMatchObject({
        response: { status: 404 },
      })
    })

    it('should handle permission error when listing groups', async () => {

      ;(apiClient.get as jest.Mock).mockRejectedValue({
        response: { status: 403, data: { message: 'Unauthorized' } },
      })

      await expect(listGroups('1')).rejects.toMatchObject({
        response: { status: 403 },
      })
    })
  })

  describe('getGroup', () => {
    it('should get group by ID', async () => {

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: { data: mockGroups[0] },
      })

      const result = await getGroup('1')

      expect(apiClient.get).toHaveBeenCalledWith('/groups/1')
      expect(result).toEqual(mockGroups[0])
    })

    it('should return null if group not found', async () => {

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: { data: null },
      })

      const result = await getGroup('999')

      expect(result).toBeNull()
    })

    it('should handle group not found error', async () => {

      ;(apiClient.get as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'Group not found' } },
      })

      await expect(getGroup('999')).rejects.toMatchObject({
        response: { status: 404 },
      })
    })
  })

  describe('createGroup', () => {
    it('should create new group with name', async () => {
      // Group starts empty, ready for lists

      const newGroup: Group = {
        id: '3',
        space_id: '1',
        name: 'API Development',
        color: '#0080FF',
        created_at: '2024-01-03T00:00:00Z',
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue({
        data: { data: newGroup },
      })

      const result = await createGroup('1', {
        name: 'API Development',
        color: '#0080FF',
      })

      expect(apiClient.post).toHaveBeenCalledWith('/spaces/1/groups', {
        name: 'API Development',
        color: '#0080FF',
      })
      expect(result).toEqual(newGroup)
    })

    it('should create group without color', async () => {
      // Use default color

      const newGroup: Group = {
        id: '4',
        space_id: '1',
        name: 'Testing',
        created_at: '2024-01-04T00:00:00Z',
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue({
        data: { data: newGroup },
      })

      const result = await createGroup('1', {
        name: 'Testing',
      })

      expect(apiClient.post).toHaveBeenCalledWith('/spaces/1/groups', {
        name: 'Testing',
        color: undefined,
      })
      expect(result.name).toBe('Testing')
    })

    it('should validate required name', async () => {

      ;(apiClient.post as jest.Mock).mockRejectedValue({
        response: { status: 422, data: { errors: { name: ['Name is required'] } } },
      })

      await expect(
        createGroup('1', { name: '' })
      ).rejects.toMatchObject({
        response: { status: 422 },
      })
    })

    it('should handle space not found on creation', async () => {

      ;(apiClient.post as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'Space not found' } },
      })

      await expect(
        createGroup('999', { name: 'New Group' })
      ).rejects.toMatchObject({
        response: { status: 404 },
      })
    })

    it('should prevent duplicate group names in same space', async () => {

      ;(apiClient.post as jest.Mock).mockRejectedValue({
        response: {
          status: 422,
          data: { errors: { name: ['Group name already exists'] } },
        },
      })

      await expect(
        createGroup('1', { name: 'Backend Tasks' })
      ).rejects.toMatchObject({
        response: { status: 422 },
      })
    })
  })

  describe('updateGroup', () => {
    it('should update group name', async () => {
      // Update navigation and lists display

      const updated: Group = {
        ...mockGroups[0],
        name: 'Backend Development',
      }

      ;(apiClient.put as jest.Mock).mockResolvedValue({
        data: { data: updated },
      })

      const result = await updateGroup('1', {
        name: 'Backend Development',
      })

      expect(apiClient.put).toHaveBeenCalledWith('/groups/1', {
        name: 'Backend Development',
      })
      expect(result.name).toBe('Backend Development')
    })

    it('should update group color', async () => {

      const updated: Group = {
        ...mockGroups[0],
        color: '#FF00FF',
      }

      ;(apiClient.put as jest.Mock).mockResolvedValue({
        data: { data: updated },
      })

      const result = await updateGroup('1', {
        color: '#FF00FF',
      })

      expect(result.color).toBe('#FF00FF')
    })

    it('should update both name and color', async () => {

      const updated: Group = {
        ...mockGroups[0],
        name: 'DevOps',
        color: '#00FF00',
      }

      ;(apiClient.put as jest.Mock).mockResolvedValue({
        data: { data: updated },
      })

      const result = await updateGroup('1', {
        name: 'DevOps',
        color: '#00FF00',
      })

      expect(apiClient.put).toHaveBeenCalledWith('/groups/1', {
        name: 'DevOps',
        color: '#00FF00',
      })
      expect(result).toEqual(updated)
    })

    it('should handle group not found on update', async () => {

      ;(apiClient.put as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'Group not found' } },
      })

      await expect(
        updateGroup('999', { name: 'New Name' })
      ).rejects.toMatchObject({
        response: { status: 404 },
      })
    })

    it('should handle permission error on update', async () => {

      ;(apiClient.put as jest.Mock).mockRejectedValue({
        response: { status: 403, data: { message: 'Unauthorized' } },
      })

      await expect(
        updateGroup('1', { name: 'New Name' })
      ).rejects.toMatchObject({
        response: { status: 403 },
      })
    })
  })

  describe('deleteGroup', () => {
    it('should delete group', async () => {
      // Removes from space

      ;(apiClient.delete as jest.Mock).mockResolvedValue({})

      await deleteGroup('1')

      expect(apiClient.delete).toHaveBeenCalledWith('/groups/1')
    })

    it('should handle group not found on delete', async () => {

      ;(apiClient.delete as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'Group not found' } },
      })

      await expect(deleteGroup('999')).rejects.toMatchObject({
        response: { status: 404 },
      })
    })

    it('should handle permission error on delete', async () => {

      ;(apiClient.delete as jest.Mock).mockRejectedValue({
        response: { status: 403, data: { message: 'Unauthorized' } },
      })

      await expect(deleteGroup('1')).rejects.toMatchObject({
        response: { status: 403 },
      })
    })

    it('should prevent deletion of group with active lists', async () => {

      ;(apiClient.delete as jest.Mock).mockRejectedValue({
        response: {
          status: 422,
          data: { message: 'Group has active lists' },
        },
      })

      await expect(deleteGroup('1')).rejects.toMatchObject({
        response: { status: 422 },
      })
    })
  })
})
