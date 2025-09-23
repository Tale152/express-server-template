// This script allows you to start or stop a local MongoDB instance configured as a single-node replica set (needed for session handling).
// Usage:
//   node mongo-rs.js start   -> starts MongoDB, initializes the replica set if needed
//   node mongo-rs.js stop    -> stops any running MongoDB instance on the configured port
// It creates a data directory in the project root if it doesn't exist, checks if MongoDB is already running,
// and manages the replica set initialization automatically.

import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'mongodb', 'rs0');
const port = 27017;

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`[INFO] Created data directory: ${dataDir}`);
}

async function checkPortInUse(port) {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

async function stopMongo() {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    if (!stdout.trim()) {
      console.log('[INFO] No mongo process running.');
      return;
    }

    const pids = stdout.trim().split('\n');
    console.log(`[INFO] Stopping existing mongod processes (PIDs ${pids.join(', ')})...`);

    for (const pid of pids) {
      try {
        await execAsync(`kill -2 ${pid}`);
      } catch {
        await execAsync(`kill -9 ${pid}`);
      }
    }

    while (await checkPortInUse(port)) {
      await sleep(500);
    }
    console.log('[INFO] Mongo stopped, port is now free.');
  } catch {
    console.log('[INFO] No mongo process running.');
  }
}

async function startMongo() {
  console.log(`[INFO] Starting mongod on port ${port} with replica set 'rs0'...`);
  
  spawn('mongod', ['--dbpath', dataDir, '--replSet', 'rs0', '--port', port], {
    stdio: 'ignore',
    detached: true
  }).unref();

  while (!(await checkPortInUse(port))) {
    await sleep(500);
  }

  const rsAlready = !(await isReplicaSet());
  if (rsAlready) {
    console.log('[INFO] Initializing replica set...');
    try {
      await execAsync(`mongosh --port ${port} --eval 'rs.initiate()'`);
      console.log('[INFO] Replica set initialized.');
    } catch (err) {
      console.error('[ERROR] Failed to initialize replica set:', err.message);
    }
  } else {
    console.log('[INFO] Replica set already initialized.');
  }

  console.log('[INFO] MongoDB is running!');
}

async function isReplicaSet() {
  try {
    const { stdout } = await execAsync(`mongosh --port ${port} --eval 'JSON.stringify(rs.status())'`);
    return !stdout.includes('NotYetInitialized');
  } catch {
    return false;
  }
}

const action = process.argv[2];

(async () => {
  if (action === 'start') {
    await startMongo();
  } else if (action === 'stop') {
    await stopMongo();
  } else {
    console.log('Usage: node start-mongo-rs.js <start|stop>');
  }
})();
