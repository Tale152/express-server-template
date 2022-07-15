import {Request, Response} from 'express';

import {EncryptedToken} from '../../core/entities/Token';
import {UnpersistedUser} from '../../core/entities/User';
import UserUseCases from '../../core/use_cases/UserUseCases';
import {isStringEmpty} from '../../core/utils/checks/stringChecks';
import { onError } from '../_common/onError';

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

function areParametersValid(username: string, password: string): boolean {
  return !isStringEmpty(username) && !isStringEmpty(password);
}

function onUserAlreadyExists(res: Response): () => Promise<void> {
  return async () => {
    res.status(406).send();
  };
}

function onSuccess(res: Response): (token: EncryptedToken) => Promise<void> {
  return async (token: EncryptedToken) => {
    res.status(201).json({token: token.value}).send();
  };
}
