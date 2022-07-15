import { v4 as uuidv4 } from 'uuid';
import EnvVariablesSingleton from '../../src/setup/EnvVariablesSingleton';
import mongoose from 'mongoose';

export async function createConnectionToTestDB() {
  await mongoose.connect(EnvVariablesSingleton.instance.dbAddress + uuidv4());
}

export async function resetDB() {
  const collections = Object.keys(mongoose.connection.collections)
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName]
    await collection.deleteMany({})
  }
}

export async function dropConnectedTestDB() {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
}
