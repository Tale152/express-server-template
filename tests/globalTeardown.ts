import mongoose from 'mongoose';

export default async function globalTeardown() {
  try {
    // Disconnect mongoose if still connected
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Mongoose disconnected');
    }
    
    console.log('Test teardown completed');
    console.log('Remember to stop test containers: npm run mongo:test:stop');
  } catch (error) {
    console.error('Error during global teardown:', error);
  }
}
