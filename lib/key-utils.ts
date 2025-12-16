/**
 * Generates unique, stable keys for React list items
 * Prevents key warnings and infinite loops
 */

export function generateItemKey(
  prefix: string,
  id: string | number,
  index: number
): string {
  // Use a stable key format that doesn't change between renders
  return `${prefix}-${id}-${index}`;
}

export function generateListKey(items: Array<{ id: string | number }>, prefix = 'item'): string[] {
  return items.map((item, idx) => generateItemKey(prefix, item.id, idx));
}

/**
 * Safe key generator for maps and loops
 * Returns unique key even if item.id might change
 */
export function safeKey(prefix: string, id: unknown, fallback?: string): string {
  const idStr = typeof id === 'object' && id !== null ? JSON.stringify(id) : String(id || fallback || 'unknown');
  return `${prefix}__${idStr}`.replace(/[^a-z0-9_-]/gi, '_');
}

/**
 * Validates that all keys in an array are unique
 * Use in development to catch key issues
 */
export function validateKeys(keys: string[]): { valid: boolean; duplicates: string[] } {
  const seen = new Set<string>();
  const duplicates: string[] = [];

  keys.forEach((key) => {
    if (seen.has(key)) {
      duplicates.push(key);
    }
    seen.add(key);
  });

  return {
    valid: duplicates.length === 0,
    duplicates,
  };
}
