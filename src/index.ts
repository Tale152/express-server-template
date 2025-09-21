import 'reflect-metadata';
import { createApp, EnvVars } from './app';
import { createLogger } from './setup/logger';
import { ContainerDAOMongoDB } from './domain/mongodb/ContainerDAOMongoDB';
import { DatabaseConnectionMongoDB } from './domain/mongodb/DatabaseConnectionMongoDB';
import { MongoDBSessionProducer } from './domain/mongodb/MongoDBSessionProducer';
import { DefaultTimestampProducer } from './utils/TimestampProducer';

async function startServer() {
  const envVars = new EnvVars();
  const containerDAO = new ContainerDAOMongoDB();
  const logger = createLogger(envVars);
  const dbConnection = new DatabaseConnectionMongoDB();
  const timestampProducer = new DefaultTimestampProducer();

  try {
    // Connect to database
    await dbConnection.connect(envVars, logger);
    
    const dbSessionProducer = new MongoDBSessionProducer();
    
    const app = await createApp(envVars, containerDAO, dbSessionProducer, timestampProducer, logger);
    
    // Start server
    const server = app.listen(envVars.PORT, () => {
      logger.info(`Server is running on port ${envVars.PORT}`, { port: envVars.PORT });
      logger.info(`Environment: ${envVars.NODE_ENV}`, { environment: envVars.NODE_ENV });
      logger.info(`CORS Origins: ${envVars.CORS_ORIGIN.join(', ')}`, { corsOrigins: envVars.CORS_ORIGIN });
      logger.info('Security headers enabled with Helmet');
      logger.info('Rate limiting enabled');
      logger.info('Input sanitization enabled');
      logger.info(`Health check available at http://localhost:${envVars.PORT}/health`);
      logger.info(`API docs available at http://localhost:${envVars.PORT}/docs`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      
      server.close(async () => {
        try {
          await dbConnection.disconnect(envVars, logger);
          logger.info('Server closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});