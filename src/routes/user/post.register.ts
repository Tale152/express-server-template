import {Request, Response} from 'express';

import {EncryptedToken} from '../../core/entities/Token';
import {UnpersistedUser} from '../../core/entities/User';
import UserUseCases from '../../core/use_cases/UserUseCases';
import {onError} from '../_common/onError';
import {authenticationHandler} from '../_common/authentication';

/**
 * Handler of the POST /user/register route
 * @param {UserUseCases} userUseCases use cases for the User
 * @return {Promise<void>} a promise that will be solved after
 * the request is handled
 */
export default function userRegisterHandler(
  userUseCases: UserUseCases,
): (req: Request, res: Response) => Promise<void> {
  return authenticationHandler(
    (username: string, password: string, res: Response) => {
      userUseCases.register(
        new UnpersistedUser(username.trim(), password.trim()),
        onUserAlreadyExists(res),
        onSuccess(res),
        onError(res),
      );
    },
  );
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
