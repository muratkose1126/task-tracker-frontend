import { describe, it, expect } from '@jest/globals';
import { generateItemKey, safeKey, validateKeys } from '@/lib/key-utils';

describe('Key Utils', () => {
  describe('generateItemKey', () => {
    it('generates consistent keys', () => {
      const key1 = generateItemKey('task', 'id-123', 0);
      const key2 = generateItemKey('task', 'id-123', 0);

      expect(key1).toBe(key2);
      expect(key1).toBe('task-id-123-0');
    });

    it('generates different keys for different ids', () => {
      const key1 = generateItemKey('task', 'id-1', 0);
      const key2 = generateItemKey('task', 'id-2', 0);

      expect(key1).not.toBe(key2);
    });
  });

  describe('safeKey', () => {
    it('sanitizes special characters', () => {
      const key = safeKey('task', 'id@123!test');
      expect(/^task__id_123_test$/.test(key)).toBe(true);
    });

    it('uses fallback for null/undefined', () => {
      const key = safeKey('task', null, 'fallback');
      expect(key).toContain('fallback');
    });
  });

  describe('validateKeys', () => {
    it('detects duplicate keys', () => {
      const keys = ['key-1', 'key-2', 'key-1'];
      const result = validateKeys(keys);

      expect(result.valid).toBe(false);
      expect(result.duplicates).toContain('key-1');
    });

    it('validates unique keys', () => {
      const keys = ['key-1', 'key-2', 'key-3'];
      const result = validateKeys(keys);

      expect(result.valid).toBe(true);
      expect(result.duplicates).toHaveLength(0);
    });
  });
});
