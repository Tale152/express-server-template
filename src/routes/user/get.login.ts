import {Request, Response} from 'express';

import {EncryptedToken} from '../../core/entities/Token';
import {UnpersistedUser} from '../../core/entities/User';
import UserUseCases from '../../core/use_cases/UserUseCases';

export default function userLoginHandler(
  userUseCases: UserUseCases,
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response) => {
    const username = req.query.username;
    const password = req.query.password;
    if (
      typeof username === 'string' &&
      typeof password === 'string' &&
      username.trim() !== '' &&
      password !== ''
    ) {
      userUseCases.login(
        new UnpersistedUser(username.trim(), password),
        onInvalidCredentials(res),
        onSuccess(res),
        onError(res),
      );
    } else {
      res.status(400).send();
    }
  };
}

function onInvalidCredentials(res: Response): () => Promise<void> {
  return async () => {
    res.status(401).send();
  };
}

function onSuccess(res: Response): (token: EncryptedToken) => Promise<void> {
  return async (token: EncryptedToken) => {
    res.status(200).json({token: token.value}).send();
  };
}

function onError(res: Response): () => Promise<void> {
  return async () => {
    res.status(500).send();
  };
}
