// src/common/utils/objectid.util.ts

/**
 * Converts a MongoDB ObjectId to string, or returns the input if already a string.
 */
export function objectIdToString(id: any): string {
  if (!id) return '';
  if (typeof id === 'string') return id;
  if (id.toHexString) return id.toHexString();
  if (id.toString) return id.toString();
  return '';
}
