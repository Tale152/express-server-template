import {Request, Response} from 'express';

import User from '../../core/entities/User';
import UserUseCases from '../../core/use_cases/UserUseCases';
import {onError} from '../_common/onError';

/**
 * Handler of the GET /user/get-by route
 * @param {UserUseCases} userUseCases use cases for the User
 * @return {Promise<void>} a promise that will be solved after
 * the request is handled
 */
export default function userGetByHandler(
  userUseCases: UserUseCases,
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response) => {
    const id = req.query.id;
    const username = req.query.username;
    if (typeof id === 'string' && id.trim() !== '') {
      userUseCases.getById(
        id.trim(),
        onFound(res),
        onNotFound(res),
        onError(res),
      );
    } else if (typeof username === 'string' && username.trim() !== '') {
      userUseCases.getByUsername(
        username.trim(),
        onFound(res),
        onNotFound(res),
        onError(res),
      );
    } else {
      res.status(400).send();
    }
  };
}

/**
 * Handler called when an User is found using the provided parameters.
 * @param {Express} res Express response
 * @return {function(User): Promise<void>} the actual callback that will be
 * invoked, containing the retreived User
 */
function onFound(res: Response): (user: User) => Promise<void> {
  return async (user: User) => {
    res
      .status(200)
      .json({
        id: user.id,
        username: user.username,
      })
      .send();
  };
}

/**
 * Handler called when no User was found using the provided parameters.
 * @param {Express} res Express response
 * @return {function(): Promise<void>} the actual callback that will be
 * invoked
 */
function onNotFound(res: Response): () => Promise<void> {
  return async () => {
    res.status(204).send();
  };
}
