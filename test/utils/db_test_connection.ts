import EnvVariablesSingleton from '../../src/setup/EnvVariablesSingleton';
const mongoose = require('mongoose');

export function createConnectionToTestDB(completionCallback) {
  mongoose.connect(
    EnvVariablesSingleton.instance.dbAddress,
    {useNewUrlParser: true, useUnifiedTopology: true},
    () => completionCallback(),
  );
}

export async function resetTestDB() {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.remove();
  }
}

export function dropConnectedTestDB(completionCallback) {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => completionCallback());
  });
}
