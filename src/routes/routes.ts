import {Express, Request, Response} from 'express';
import MongooseUserPersistence
  from '../core/frameworks_and_drivers/persistence/MongooseUserPersistence';
import BcryptEncryptionHandler
  from '../core/frameworks_and_drivers/security/BcryptEncryptionHandler';
import JwtTokenGenerator
  from '../core/frameworks_and_drivers/security/JwtTokenGenerator';
import UserUseCases from '../core/use_cases/UserUseCases';
import userRegisterHandler from './user/post.register';
import userLoginHandler from './user/get.login';
import userGetByHandler from './user/get.userBy';
import {EncryptedToken} from '../core/entities/Token';

const tokenGenerator = new JwtTokenGenerator();
const encryptionHandler = new BcryptEncryptionHandler();
const userPersistence = new MongooseUserPersistence();
const userUseCases = new UserUseCases(
  userPersistence,
  tokenGenerator,
  encryptionHandler,
);

export default function bindRoutes(server: Express): void {
  server.post('/user/register', userRegisterHandler(userUseCases));

  server.get('/user/login', userLoginHandler(userUseCases));

  server.get('/user/get-by', verifyToken, userGetByHandler(userUseCases));
}

const verifyToken = (req: Request, res: Response, next: any) => {
  const token = req.headers.token;
  if (token !== undefined && typeof token === 'string') {
    const decodedToken = tokenGenerator.decode(new EncryptedToken(token));
    if (decodedToken !== undefined) {
      req.query.requestId = decodedToken.id.trim();
      next();
      return;
    }
  }
  res.sendStatus(401);
};
