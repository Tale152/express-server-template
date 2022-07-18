import {Express} from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

/**
 * Sets additional properties to server like cors policies
 * and body parser.
 * @param {Express} server the server to add the additional
 * properties to
 */
export function setupServer(server: Express): void {
  server.use(cors());
  server.use(bodyParser.json());
}
