import {
  listTaskLists,
  getTaskList,
  createTaskList,
  updateTaskList,
  deleteTaskList,
  type TaskList,
} from '@/lib/lists'
import { apiClient } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('Lists API', () => {
  const mockLists: TaskList[] = [
    {
      id: '1',
      space_id: '1',
      group_id: '1',
      name: 'Bugs to Fix',
      status_schema: { pending: 'To Do', in_progress: 'In Progress', done: 'Done' },
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      space_id: '1',
      group_id: '1',
      name: 'Features',
      created_at: '2024-01-02T00:00:00Z',
    },
  ]

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('listTaskLists', () => {
    it('should list all lists in a space', async () => {

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: { data: mockLists },
      })

      const result = await listTaskLists('1')

      expect(apiClient.get).toHaveBeenCalledWith('/spaces/1/lists')
      expect(result).toEqual(mockLists)
      expect(result).toHaveLength(2)
    })

    it('should return empty array if no lists exist', async () => {

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: { data: [] },
      })

      const result = await listTaskLists('2')

      expect(result).toEqual([])
    })

    it('should handle space not found error', async () => {

      ;(apiClient.get as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'Space not found' } },
      })

      await expect(listTaskLists('999')).rejects.toMatchObject({
        response: { status: 404 },
      })
    })

    it('should handle permission error when listing lists', async () => {

      ;(apiClient.get as jest.Mock).mockRejectedValue({
        response: { status: 403, data: { message: 'Unauthorized' } },
      })

      await expect(listTaskLists('1')).rejects.toMatchObject({
        response: { status: 403 },
      })
    })
  })

  describe('getTaskList', () => {
    it('should get list by ID', async () => {

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: { data: mockLists[0] },
      })

      const result = await getTaskList('1')

      expect(apiClient.get).toHaveBeenCalledWith('/lists/1')
      expect(result).toEqual(mockLists[0])
    })

    it('should return null if list not found', async () => {

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: { data: null },
      })

      const result = await getTaskList('999')

      expect(result).toBeNull()
    })

    it('should handle list not found error', async () => {

      ;(apiClient.get as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'List not found' } },
      })

      await expect(getTaskList('999')).rejects.toMatchObject({
        response: { status: 404 },
      })
    })

    it('should include status schema in response', async () => {

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: { data: mockLists[0] },
      })

      const result = await getTaskList('1')

      expect(result?.status_schema).toBeDefined()
      expect(result?.status_schema?.pending).toBe('To Do')
    })
  })

  describe('createTaskList', () => {
    it('should create new list in space', async () => {
      // Assign to space to start adding tasks

      const newList: TaskList = {
        id: '3',
        space_id: '1',
        name: 'Documentation',
        created_at: '2024-01-03T00:00:00Z',
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue({
        data: { data: newList },
      })

      const result = await createTaskList('1', {
        name: 'Documentation',
      })

      expect(apiClient.post).toHaveBeenCalledWith('/spaces/1/lists', {
        name: 'Documentation',
        group_id: undefined,
        status_schema: undefined,
      })
      expect(result).toEqual(newList)
    })

    it('should create list in specific group', async () => {
      // Group organizes multiple related lists

      const newList: TaskList = {
        id: '4',
        space_id: '1',
        group_id: '1',
        name: 'UI Tasks',
        created_at: '2024-01-04T00:00:00Z',
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue({
        data: { data: newList },
      })

      const result = await createTaskList('1', {
        name: 'UI Tasks',
        group_id: '1',
      })

      expect(apiClient.post).toHaveBeenCalledWith('/spaces/1/lists', {
        name: 'UI Tasks',
        group_id: '1',
        status_schema: undefined,
      })
      expect(result.group_id).toBe('1')
    })

    it('should create list with custom status schema', async () => {
      // Define custom statuses instead of default

      const customSchema = {
        planned: 'Planned',
        in_progress: 'Being Done',
        review: 'Code Review',
        done: 'Completed',
      }

      const newList: TaskList = {
        id: '5',
        space_id: '1',
        name: 'Development',
        status_schema: customSchema,
        created_at: '2024-01-05T00:00:00Z',
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue({
        data: { data: newList },
      })

      const result = await createTaskList('1', {
        name: 'Development',
        status_schema: customSchema,
      })

      expect(apiClient.post).toHaveBeenCalledWith('/spaces/1/lists', {
        name: 'Development',
        group_id: undefined,
        status_schema: customSchema,
      })
      expect(result.status_schema).toEqual(customSchema)
    })

    it('should validate required name', async () => {

      ;(apiClient.post as jest.Mock).mockRejectedValue({
        response: { status: 422, data: { errors: { name: ['Name is required'] } } },
      })

      await expect(
        createTaskList('1', { name: '' })
      ).rejects.toMatchObject({
        response: { status: 422 },
      })
    })

    it('should handle space not found on creation', async () => {

      ;(apiClient.post as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'Space not found' } },
      })

      await expect(
        createTaskList('999', { name: 'New List' })
      ).rejects.toMatchObject({
        response: { status: 404 },
      })
    })

    it('should prevent duplicate list names in same space', async () => {

      ;(apiClient.post as jest.Mock).mockRejectedValue({
        response: {
          status: 422,
          data: { errors: { name: ['List name already exists'] } },
        },
      })

      await expect(
        createTaskList('1', { name: 'Bugs to Fix' })
      ).rejects.toMatchObject({
        response: { status: 422 },
      })
    })
  })

  describe('updateTaskList', () => {
    it('should update list name', async () => {

      const updated: TaskList = {
        ...mockLists[0],
        name: 'Critical Bugs',
      }

      ;(apiClient.put as jest.Mock).mockResolvedValue({
        data: { data: updated },
      })

      const result = await updateTaskList('1', {
        name: 'Critical Bugs',
      })

      expect(apiClient.put).toHaveBeenCalledWith('/lists/1', {
        name: 'Critical Bugs',
      })
      expect(result.name).toBe('Critical Bugs')
    })

    it('should move list to different group', async () => {

      const updated: TaskList = {
        ...mockLists[0],
        group_id: '2',
      }

      ;(apiClient.put as jest.Mock).mockResolvedValue({
        data: { data: updated },
      })

      const result = await updateTaskList('1', {
        group_id: '2',
      })

      expect(result.group_id).toBe('2')
    })

    it('should remove list from group', async () => {

      const updated: TaskList = {
        ...mockLists[0],
        group_id: null,
      }

      ;(apiClient.put as jest.Mock).mockResolvedValue({
        data: { data: updated },
      })

      const result = await updateTaskList('1', {
        group_id: null,
      })

      expect(result.group_id).toBeNull()
    })

    it('should update status schema', async () => {

      const newSchema = {
        todo: 'To Do',
        doing: 'Doing',
        done: 'Done',
      }

      const updated: TaskList = {
        ...mockLists[0],
        status_schema: newSchema,
      }

      ;(apiClient.put as jest.Mock).mockResolvedValue({
        data: { data: updated },
      })

      const result = await updateTaskList('1', {
        status_schema: newSchema,
      })

      expect(result.status_schema).toEqual(newSchema)
    })

    it('should archive list', async () => {

      const updated: TaskList = {
        ...mockLists[0],
        is_archived: true,
      }

      ;(apiClient.put as jest.Mock).mockResolvedValue({
        data: { data: updated },
      })

      const result = await updateTaskList('1', {
        is_archived: true,
      })

      expect(result.is_archived).toBe(true)
    })

    it('should handle list not found on update', async () => {

      ;(apiClient.put as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'List not found' } },
      })

      await expect(
        updateTaskList('999', { name: 'New Name' })
      ).rejects.toMatchObject({
        response: { status: 404 },
      })
    })

    it('should handle permission error on update', async () => {

      ;(apiClient.put as jest.Mock).mockRejectedValue({
        response: { status: 403, data: { message: 'Unauthorized' } },
      })

      await expect(
        updateTaskList('1', { name: 'New Name' })
      ).rejects.toMatchObject({
        response: { status: 403 },
      })
    })
  })

  describe('deleteTaskList', () => {
    it('should delete list', async () => {
      // Removes from space

      ;(apiClient.delete as jest.Mock).mockResolvedValue({})

      await deleteTaskList('1')

      expect(apiClient.delete).toHaveBeenCalledWith('/lists/1')
    })

    it('should handle list not found on delete', async () => {

      ;(apiClient.delete as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'List not found' } },
      })

      await expect(deleteTaskList('999')).rejects.toMatchObject({
        response: { status: 404 },
      })
    })

    it('should handle permission error on delete', async () => {

      ;(apiClient.delete as jest.Mock).mockRejectedValue({
        response: { status: 403, data: { message: 'Unauthorized' } },
      })

      await expect(deleteTaskList('1')).rejects.toMatchObject({
        response: { status: 403 },
      })
    })

    it('should prevent deletion of list with active tasks', async () => {

      ;(apiClient.delete as jest.Mock).mockRejectedValue({
        response: {
          status: 422,
          data: { message: 'List has active tasks' },
        },
      })

      await expect(deleteTaskList('1')).rejects.toMatchObject({
        response: { status: 422 },
      })
    })
  })
})
