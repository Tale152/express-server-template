#!/usr/bin/env node

/**
 * Test helper script that automatically manages Docker test containers
 * Checks if test containers are running and starts them if needed
 */

const { execSync } = require('child_process');

const PROJECT_NAME = 'express-server-test-db';
const COMPOSE_FILE = 'docker-compose.test.yml';

/**
 * Check if test containers are running
 */
function areTestContainersRunning() {
  try {
    const output = execSync(`docker compose -p ${PROJECT_NAME} -f ${COMPOSE_FILE} ps -q`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    // If there are running containers, output will contain container IDs
    return output.trim().length > 0;
  } catch (error) {
    // If command fails, containers are not running
    return false;
  }
}

/**
 * Start test containers
 */
function startTestContainers() {
  console.log('Starting test containers...');
  try {
    execSync(`docker compose -p ${PROJECT_NAME} -f ${COMPOSE_FILE} up -d`, {
      stdio: 'inherit'
    });
    console.log('Test containers started successfully');
  } catch (error) {
    console.error('Failed to start test containers');
    process.exit(1);
  }
}

/**
 * Ensure test containers are running before proceeding
 */
function ensureTestContainers() {
  if (areTestContainersRunning()) {
    console.log('Test containers are already running');
  } else {
    console.log('Test containers not running, starting them...');
    startTestContainers();
  }
}

/**
 * Run the actual Jest command with provided arguments
 */
function runJest() {
  const jestArgs = process.argv.slice(2);
  const jestCommand = ['npx', 'jest', ...jestArgs].join(' ');
  
  try {
    execSync(jestCommand, { stdio: 'inherit' });
  } catch (error) {
    process.exit(error.status || 1);
  }
}

/**
 * Main function
 */
function main() {
  console.log('Auto Test Container Runner');
  console.log('==============================================');
  
  // Ensure containers are running
  ensureTestContainers();
  
  // Run Jest with original arguments
  runJest();
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  areTestContainersRunning,
  startTestContainers,
  ensureTestContainers
};