import mongoose from 'mongoose';
import { DatabaseConnectionMongoDB } from '../../../../src/domain/mongodb/DatabaseConnectionMongoDB';
import { EnvVars } from '../../../../src/setup/EnvVars';
import winston from 'winston';
import { MongoClient } from 'mongodb';

// Mock mongoose module
jest.mock('mongoose');

const mockedMongoose = jest.mocked(mongoose);

describe('DatabaseConnectionMongoDB', () => {
  let databaseConnection: DatabaseConnectionMongoDB;
  let mockEnvVars: EnvVars;
  let mockLogger: winston.Logger;
  let mockConnection: {
    on: jest.Mock;
    getClient: jest.Mock;
    db: unknown;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup connection mock
    mockConnection = {
      on: jest.fn(),
      getClient: jest.fn(),
      db: {},
    };
    
    // Override mongoose.connection with our mock
    Object.defineProperty(mockedMongoose, 'connection', {
      value: mockConnection,
      writable: true,
    });

    databaseConnection = new DatabaseConnectionMongoDB();
    mockEnvVars = {
      DATABASE_URL: 'mongodb://localhost:27017/test',
    } as EnvVars;
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as winston.Logger;
  });

  describe('getMongoClient', () => {
    it('should return null when not connected', () => {
      const client = databaseConnection.getMongoClient();
      expect(client).toBeNull();
    });

    it('should return null when connected but no database', () => {
      // Simulate connected state but no db
      Object.defineProperty(databaseConnection, 'isConnected', { value: true, writable: true });
      mockConnection.db = undefined;

      const client = databaseConnection.getMongoClient();
      expect(client).toBeNull();
    });

    it('should return mongo client when connected', async () => {
      const mockClient = {} as MongoClient;
      mockedMongoose.connect.mockResolvedValue(mongoose);
      mockConnection.getClient.mockReturnValue(mockClient);

      await databaseConnection.connect(mockEnvVars, mockLogger);

      const client = databaseConnection.getMongoClient();
      expect(client).toBe(mockClient);
    });
  });

  describe('connect', () => {
    it('should connect to MongoDB successfully', async () => {
      mockedMongoose.connect.mockResolvedValue(mongoose);

      await databaseConnection.connect(mockEnvVars, mockLogger);

      expect(mockedMongoose.connect).toHaveBeenCalledWith(
        'mongodb://localhost:27017/test',
        {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        }
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Connected to MongoDB at mongodb://localhost:27017/test'
      );
      expect(databaseConnection.getConnectionState(mockEnvVars, mockLogger)).toBe(true);
    });

    it('should not connect if already connected', async () => {
      // First connection
      mockedMongoose.connect.mockResolvedValue(mongoose);
      await databaseConnection.connect(mockEnvVars, mockLogger);

      jest.clearAllMocks();

      // Second connection attempt
      await databaseConnection.connect(mockEnvVars, mockLogger);

      expect(mockedMongoose.connect).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Database already connected');
    });

    it('should throw error when connection fails', async () => {
      const connectionError = new Error('Connection failed');
      mockedMongoose.connect.mockRejectedValue(connectionError);

      await expect(databaseConnection.connect(mockEnvVars, mockLogger))
        .rejects.toThrow('Connection failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to connect to MongoDB at mongodb://localhost:27017/test:',
        connectionError
      );
    });

    it('should set up connection event listeners', async () => {
      mockedMongoose.connect.mockResolvedValue(mongoose);

      await databaseConnection.connect(mockEnvVars, mockLogger);

      expect(mockConnection.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockConnection.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
      expect(mockConnection.on).toHaveBeenCalledWith('reconnected', expect.any(Function));
    });

    it('should handle error event', async () => {
      mockedMongoose.connect.mockResolvedValue(mongoose);
      let errorHandler: (error: Error) => void;

      mockConnection.on.mockImplementation((event: string, handler: (error?: Error) => void) => {
        if (event === 'error') {
          errorHandler = handler;
        }
      });

      await databaseConnection.connect(mockEnvVars, mockLogger);

      const testError = new Error('Database error');
      errorHandler!(testError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'MongoDB connection error at mongodb://localhost:27017/test:',
        testError
      );
    });

    it('should handle disconnected event', async () => {
      mockedMongoose.connect.mockResolvedValue(mongoose);
      let disconnectedHandler: () => void;

      mockConnection.on.mockImplementation((event: string, handler: () => void) => {
        if (event === 'disconnected') {
          disconnectedHandler = handler;
        }
      });

      await databaseConnection.connect(mockEnvVars, mockLogger);

      disconnectedHandler!();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'MongoDB disconnected from mongodb://localhost:27017/test'
      );
      expect(databaseConnection.getConnectionState(mockEnvVars, mockLogger)).toBe(false);
    });

    it('should handle reconnected event', async () => {
      mockedMongoose.connect.mockResolvedValue(mongoose);
      let reconnectedHandler: () => void;

      mockConnection.on.mockImplementation((event: string, handler: () => void) => {
        if (event === 'reconnected') {
          reconnectedHandler = handler;
        }
      });

      await databaseConnection.connect(mockEnvVars, mockLogger);

      // Simulate disconnection first
      Object.defineProperty(databaseConnection, 'isConnected', { value: false, writable: true });

      reconnectedHandler!();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'MongoDB reconnected at mongodb://localhost:27017/test'
      );
      expect(databaseConnection.getConnectionState(mockEnvVars, mockLogger)).toBe(true);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from MongoDB successfully', async () => {
      // First connect
      mockedMongoose.connect.mockResolvedValue(mongoose);
      await databaseConnection.connect(mockEnvVars, mockLogger);

      mockedMongoose.disconnect.mockResolvedValue(undefined);

      await databaseConnection.disconnect(mockEnvVars, mockLogger);

      expect(mockedMongoose.disconnect).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Disconnected from MongoDB');
      expect(databaseConnection.getConnectionState(mockEnvVars, mockLogger)).toBe(false);
    });

    it('should not disconnect if not connected', async () => {
      await databaseConnection.disconnect(mockEnvVars, mockLogger);

      expect(mockedMongoose.disconnect).not.toHaveBeenCalled();
    });

    it('should throw error when disconnection fails', async () => {
      // First connect
      mockedMongoose.connect.mockResolvedValue(mongoose);
      await databaseConnection.connect(mockEnvVars, mockLogger);

      const disconnectionError = new Error('Disconnection failed');
      mockedMongoose.disconnect.mockRejectedValue(disconnectionError);

      await expect(databaseConnection.disconnect(mockEnvVars, mockLogger))
        .rejects.toThrow('Disconnection failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error disconnecting from MongoDB:',
        disconnectionError
      );
    });
  });

  describe('getConnectionState', () => {
    it('should return false when not connected', () => {
      const state = databaseConnection.getConnectionState(mockEnvVars, mockLogger);
      expect(state).toBe(false);
    });

    it('should return true when connected', async () => {
      mockedMongoose.connect.mockResolvedValue(mongoose);
      await databaseConnection.connect(mockEnvVars, mockLogger);

      const state = databaseConnection.getConnectionState(mockEnvVars, mockLogger);
      expect(state).toBe(true);
    });
  });
});