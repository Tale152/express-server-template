import {Request, Response} from 'express';
import {isStringEmpty} from '../../core/utils/checks/stringChecks';

/**
 * Checks if the parameters for the request are valid.
 * @param {string} username the provided username
 * @param {string} password the provided password
 * @return {boolean} true if the parameters are valid, false otherwise
 */
function areUsersParametersValid(
  username: string,
  password: string,
): boolean {
  return !isStringEmpty(username) && !isStringEmpty(password);
}

/**
 * Handler called by login and registration since they share a lot of behaviour.
 * @param {function(username: string, password: string, res: Response): void}
 * onValidParameters specialized behaviour to perform after credentials
 * evaluation
 * @return {function(req: Request, res: Response): Promise<void>} a promise
 * that will be solved after the request is handled
 */
export function authenticationHandler(
  onValidParameters: (
    username: string,
    password: string,
    res: Response
  ) => void,
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response) => {
    const username = req.body.username;
    const password = req.body.password;
    if (areUsersParametersValid(username, password)) {
      onValidParameters(username, password, res);
    } else {
      res.status(400).send();
    }
  };
}
