import EnvVariablesSingleton from '../../src/setup/EnvVariablesSingleton';
import mongoose from 'mongoose';

export function createConnectionToTestDB(completionCallback: () => void) {
  mongoose.connect(
    EnvVariablesSingleton.instance.dbAddress,
    () => completionCallback()
  );
}

export async function resetTestDB() {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({}, {}, () => {});
  }
}

export function dropConnectedTestDB(completionCallback: () => void) {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => completionCallback());
  });
}
