import {v4 as uuidv4} from 'uuid';
import EnvVariablesSingleton from '../../src/setup/EnvVariablesSingleton';
import mongoose from 'mongoose';

/**
 * Creates a connection to MongoDB's test DB.
 * Each time this function is called, a connection to a DB with different
 * name will be enstablished; this is because jest runs test files
 * concurrently, so you need to operate in different databases for
 * different test files.
 * The newly created DB will be dropped calling the
 * {@link dropAndDisconnectTestDB} function.
 * @see {@link dropAndDisconnectTestDB}
 * @see {@link resetDB}
 */
export async function createConnectionToTestDB() {
  await mongoose.connect(EnvVariablesSingleton.instance.dbAddress + uuidv4());
}

/**
 * Deletes every entry contained in every collection created inside the DB.
 * @see {@link createConnectionToTestDB}
 * @see {@link dropAndDisconnectTestDB}
 */
export async function resetDB() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany({});
  }
}

/**
 * Drops and disconnects from the DB created by calling the
 * {@link createConnectionToTestDB} function.
 * @see {@link createConnectionToTestDB}
 * @see {@link resetDB}
 */
export async function dropAndDisconnectTestDB() {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
}
