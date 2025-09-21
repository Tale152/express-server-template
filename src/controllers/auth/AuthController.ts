import { TransactionAbstractController } from '../CustomController';
import { JWTPayload, JWTService } from '../../utils/JWTService';
import { EnvVars } from '../../setup/EnvVars';
import { ContainerDAO } from '../../domain/interfaces/ContainerDAO';
import { DatabaseSession } from '../../domain/interfaces/DatabaseSession';
import { User } from '../../domain/interfaces/entities/User';
import { AuthResponse } from '../../dto/auth/AuthResponse';
import { TokenDBUtils } from '../../domain/utils/TokenDBUtils';

/**
 * Abstract base controller for authentication operations
 * Contains common private fields and initialization logic for auth controllers
 */
export abstract class AuthController extends TransactionAbstractController {
  protected jwtService: JWTService;
  protected now: number;

  constructor(
    envVars: EnvVars, 
    containerDAO: ContainerDAO<unknown>,
    session: DatabaseSession<unknown>,
    now: number
  ) {
    super(envVars, containerDAO, session);
    this.jwtService = new JWTService(envVars);
    this.now = now;
  }

  /**
   * Generates JWT tokens and stores them in the database
   * @param user User object with id and username
   * @returns AuthResponse with tokens and user info
   */
  protected async generateAndStoreTokens(user: User): Promise<AuthResponse> {
    const jwtPayload: JWTPayload = {
      userId: user.id,
      username: user.username
    };
  
    const tokenPair = this.jwtService.generateTokenPair(jwtPayload);
  
    await TokenDBUtils.storeTokens(
      this.containerDAO,
      this.session,
      this.envVars,
      jwtPayload.userId,
      tokenPair.accessToken,
      tokenPair.refreshToken,
      this.now
    );
  
    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: {
        id: jwtPayload.userId,
        username: user.username
      }
    };

  }
}