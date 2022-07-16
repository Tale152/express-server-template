/**
 * Utility function that checks if a value is neither undefined or null.
 * @param {any} value the value to check
 * @return {boolean} if the value is neither undefined or null, false otherwise
 */
export function hasValue(value: any): boolean {
  return value !== undefined && value !== null;
}
