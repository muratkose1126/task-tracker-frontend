import { generateItemKey, generateListKey, safeKey, validateKeys } from '@/lib/key-utils'

describe('Key Utils - React List Key Generation', () => {
  describe('generateItemKey - Single Item Key', () => {
    it('should create consistent key for task items', () => {
      // When rendering tasks in a list, each task needs a unique key
      const taskId = 'task-456'
      const index = 0
      
      const key = generateItemKey('task', taskId, index)
      expect(key).toBe('task-task-456-0')
    })

    it('should create different keys for different task positions', () => {
      // Same task but different position in list should have different key
      const key1 = generateItemKey('task', 'task-1', 0)
      const key2 = generateItemKey('task', 'task-1', 1)
      
      expect(key1).not.toBe(key2)
    })
  })

  describe('generateListKey - Multiple Items', () => {
    it('should generate keys for list of tasks', () => {
      // Real scenario: rendering tasks in a kanban board
      const tasks = [
        { id: 'task-1' },
        { id: 'task-2' },
        { id: 'task-3' },
      ]
      
      const keys = generateListKey(tasks, 'task')
      expect(keys).toHaveLength(3)
      expect(keys[0]).toBe('task-task-1-0')
      expect(keys[1]).toBe('task-task-2-1')
    })
  })

  describe('safeKey - Handle Special Cases', () => {
    it('should sanitize task IDs with special characters', () => {
      // IDs from API might have special chars
      const unsafeId = 'task@#$%^'
      const key = safeKey('task', unsafeId)
      
      expect(key).not.toContain('@')
      expect(key).not.toContain('#')
    })

    it('should handle missing/null IDs with fallback', () => {
      // If task ID is null, use fallback
      const key = safeKey('task', null, 'unknown-id')
      expect(key).toContain('unknown-id')
    })
  })

  describe('validateKeys - Detect Duplicates', () => {
    it('should detect if task list has duplicate keys', () => {
      // This would be a bug - same task rendered twice
      const keys = ['task-1-0', 'task-2-1', 'task-1-0']
      
      const result = validateKeys(keys)
      expect(result.valid).toBe(false)
      expect(result.duplicates).toContain('task-1-0')
    })

    it('should confirm all keys are unique', () => {
      // Valid list - no duplicates
      const keys = ['task-1-0', 'task-2-1', 'task-3-2']
      
      const result = validateKeys(keys)
      expect(result.valid).toBe(true)
    })
  })
})
