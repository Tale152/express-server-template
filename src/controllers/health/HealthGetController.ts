import { Get, Route, Tags } from 'tsoa';
import { BaseCustomController } from '../CustomController';
import { GetHealthResponse } from '../../dto/health/GetHealthResponse';
import { EnvVars } from '../../setup/EnvVars';
import { ContainerDAO } from '../../domain/interfaces/ContainerDAO';

@Route('health')
@Tags('Health')
export class HealthGetController extends BaseCustomController {
  constructor(envVars: EnvVars, containerDAO: ContainerDAO<unknown>) {
    super(envVars, containerDAO);
  }

  /**
   * Get health status
   * @returns API health status
   */
  @Get()
  public async getHealth(): Promise<GetHealthResponse> {
    return {
      status: 'OK'
    };
  }
}
