import { v4 as uuidv4 } from 'uuid';
import EnvVariablesSingleton from '../../src/setup/EnvVariablesSingleton';
import mongoose from 'mongoose';

export function createConnectionToTestDB(completionCallback: () => void) {
  mongoose.connect(EnvVariablesSingleton.instance.dbAddress + uuidv4(), () =>
    completionCallback(),
  );
}

export function dropConnectedTestDB(completionCallback: () => void) {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => completionCallback());
  });
}
