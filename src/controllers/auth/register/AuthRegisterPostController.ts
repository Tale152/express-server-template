import * as bcrypt from 'bcrypt';
import { Post, Body, Route, Tags } from 'tsoa';

import { AuthController } from '../AuthController';
import { RegisterRequest } from '../../../dto/auth/register/RegisterRequest';
import { AuthResponse } from '../../../dto/auth/AuthResponse';
import { AppError } from '../../../setup/middleware/errorHandler';
import { EnvVars } from '../../../setup/EnvVars';
import { ContainerDAO } from '../../../domain/interfaces/ContainerDAO';
import { DatabaseSession } from '../../../domain/interfaces/DatabaseSession';

@Route('auth')
@Tags('Authentication')
export class AuthRegisterPostController extends AuthController {
  constructor(
    envVars: EnvVars, containerDAO: ContainerDAO<unknown>, session: DatabaseSession<unknown>, now: number
  ) {
    super(envVars, containerDAO, session, now);
  }

  /**
   * Register a new user
   */
  @Post('register')
  public async register(
    @Body() requestBody: RegisterRequest
  ): Promise<AuthResponse> {
    const { username, password } = requestBody;

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.containerDAO.userDAO.createUser(this.session, username, hashedPassword);
    
    if (!user) {
      throw new AppError('Username already exists', 409);
    }
    
    return this.generateAndStoreTokens(user);
  }
}
