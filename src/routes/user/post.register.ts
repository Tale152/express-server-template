import {Request, Response} from 'express';

import {EncryptedToken} from '../../core/entities/Token';
import User from '../../core/entities/User';
import UserUseCases from '../../core/use_cases/UserUseCases';
import {isStringEmpty} from '../../core/utils/checks/stringChecks';

export default function userRegisterHandler(userUseCases: UserUseCases): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response) => {
    const username = req.body.username.trim();
    const password = req.body.password.trim();
    if (areParametersValid(username, password)) {
      userUseCases.register(
          User.createInstance(username, password),
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

function onError(res: Response): () => Promise<void> {
  return async () => {
    res.status(500).send();
  };
}
