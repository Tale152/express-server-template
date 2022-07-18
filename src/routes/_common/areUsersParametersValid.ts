import {isStringEmpty} from '../../core/utils/checks/stringChecks';

/**
 * Checks if the parameters for the request are valid.
 * @param {string} username the provided username
 * @param {string} password the provided password
 * @return {boolean} true if the parameters are valid, false otherwise
 */
export function areUsersParametersValid(
  username: string,
  password: string,
): boolean {
  return !isStringEmpty(username) && !isStringEmpty(password);
}
