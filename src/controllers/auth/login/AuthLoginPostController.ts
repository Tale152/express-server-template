import * as bcrypt from 'bcrypt';
import { Post, Body, Route, Tags } from 'tsoa';

import { AuthController } from '../AuthController';
import { LoginRequest } from '../../../dto/auth/login/LoginRequest';
import { AuthResponse } from '../../../dto/auth/AuthResponse';
import { AppError } from '../../../setup/middleware/errorHandler';
import { EnvVars } from '../../../setup/EnvVars';
import { ContainerDAO } from '../../../domain/interfaces/ContainerDAO';
import { DatabaseSession } from '../../../domain/interfaces/DatabaseSession';

@Route('auth')
@Tags('Authentication')
export class AuthLoginPostController extends AuthController {
  constructor(
    envVars: EnvVars, containerDAO: ContainerDAO<unknown>, session: DatabaseSession<unknown>, now: number
  ) {
    super(envVars, containerDAO, session, now);
  }

  /**
   * Login user
   */
  @Post('login')
  public async login(
    @Body() requestBody: LoginRequest
  ): Promise<AuthResponse> {
    const { username, password } = requestBody;

    const user = await this.containerDAO.userDAO.findByUsernameWithPassword(username);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    return this.generateAndStoreTokens(user);
  }
}
