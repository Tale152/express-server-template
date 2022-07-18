import {Request, Response} from 'express';

import {EncryptedToken} from '../../core/entities/Token';
import {UnpersistedUser} from '../../core/entities/User';
import UserUseCases from '../../core/use_cases/UserUseCases';
import {isStringEmpty} from '../../core/utils/checks/stringChecks';
import {onError} from '../_common/onError';

/**
 * Handler of the POST /user/register route
 * @param {UserUseCases} userUseCases use cases for the User
 * @return {Promise<void>} a promise that will be solved after
 * the request is handled
 */
export default function userRegisterHandler(
  userUseCases: UserUseCases,
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response) => {
    const username = req.body.username;
    const password = req.body.password;
    if (areParametersValid(username, password)) {
      userUseCases.register(
        new UnpersistedUser(username.trim(), password.trim()),
        onUserAlreadyExists(res),
        onSuccess(res),
        onError(res),
      );
    } else {
      res.status(400).send();
    }
  };
}

/**
 * Checks if the parameters for the request are valid.
 * @param {string} username the provided username
 * @param {string} password the provided password
 * @return {boolean} true if the parameters are valid, false otherwise
 */
function areParametersValid(username: string, password: string): boolean {
  return !isStringEmpty(username) && !isStringEmpty(password);
}

/**
 * Handler called when the request cannot be completed since the provided
 * User already exists.
 * @param {Express} res Express response
 * @return {function(): Promise<void>} the actual callback that will be
 * invoked
 */
function onUserAlreadyExists(res: Response): () => Promise<void> {
  return async () => {
    res.status(406).send();
  };
}

/**
 * Handler called when the registration request is completed successfully.
 * @param {Express} res Express response
 * @return {function(): Promise<void>} the actual callback that will be
 * invoked
 */
function onSuccess(res: Response): (token: EncryptedToken) => Promise<void> {
  return async (token: EncryptedToken) => {
    res.status(201).json({token: token.value}).send();
  };
}
