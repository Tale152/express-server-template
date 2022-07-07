import {hasValue} from './valueChecks';

export function isStringEmpty(str: string): boolean {
  return !hasValue(str) || str.trim() === '';
}
