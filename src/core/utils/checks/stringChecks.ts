import {hasValue} from './valueChecks';

/**
 * Utility function that checks if a string is defined and not empty.
 * A string only composed by spaces is still considered empty.
 * @param {string} str the string to check
 * @return {boolean} true if a string is defined and not empty, false otherwise
 */
export function isStringEmpty(str: string): boolean {
  return !hasValue(str) || str.trim() === '';
}
