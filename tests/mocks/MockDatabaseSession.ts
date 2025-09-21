import { DatabaseSession } from '../../src/domain/interfaces/DatabaseSession';

/**
 * Mock implementation of DatabaseSession for testing
 */
export class MockDatabaseSession implements DatabaseSession<unknown> {
  private _session: unknown = {};

  get session(): unknown {
    return this._session;
  }

  /**
   * Mock implementation of startTransaction
   */
  public async startTransaction(): Promise<void> {
    // Mock implementation - do nothing
    return Promise.resolve();
  }

  /**
   * Mock implementation of commitTransaction
   */
  public async commitTransaction(): Promise<void> {
    // Mock implementation - do nothing
    return Promise.resolve();
  }

  /**
   * Mock implementation of abortTransaction
   */
  public async abortTransaction(): Promise<void> {
    // Mock implementation - do nothing
    return Promise.resolve();
  }

  /**
   * Mock implementation of endSession
   */
  public async endSession(): Promise<void> {
    // Mock implementation - do nothing
    return Promise.resolve();
  }
}
