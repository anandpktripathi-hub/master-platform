// Use 'any' for runtime instanceof check, as 'ObjectId' may be a type only in some builds
export function objectIdToString(id: any): string {
  if (typeof id === 'string') return id;
  if (id && typeof id === 'object' && typeof id.toHexString === 'function')
    return id.toHexString();
  return '';
}
