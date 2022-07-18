import {Request, Response} from 'express';

import {EncryptedToken} from '../../core/entities/Token';
import {UnpersistedUser} from '../../core/entities/User';
import UserUseCases from '../../core/use_cases/UserUseCases';
import {onError} from '../_common/onError';
import {authenticationHandler} from '../_common/authentication';

/**
 * Handler of the POST /user/login route
 * @param {UserUseCases} userUseCases use cases for the User
 * @return {Promise<void>} a promise that will be solved after
 * the request is handled
 */
export default function userLoginHandler(
  userUseCases: UserUseCases,
): (req: Request, res: Response) => Promise<void> {
  return authenticationHandler(
    (username: string, password: string, res: Response) => {
      userUseCases.login(
        new UnpersistedUser(username.trim(), password),
        onInvalidCredentials(res),
        onSuccess(res),
        onError(res),
      );
    },
  );
}

/**
 * Handler called when the provided cretentials are not valid for performing
 * login with any User.
 * @param {Express} res Express response
 * @return {function(): Promise<void>} the actual callback that will be
 * invoked
 */
function onInvalidCredentials(res: Response): () => Promise<void> {
  return async () => {
    res.status(401).send();
  };
}

/**
 * Handler called when the login request is completed successfully.
 * @param {Express} res Express response
 * @return {function(): Promise<void>} the actual callback that will be
 * invoked
 */
function onSuccess(res: Response): (token: EncryptedToken) => Promise<void> {
  return async (token: EncryptedToken) => {
    res.status(200).json({token: token.value}).send();
  };
}
