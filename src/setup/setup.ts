import {Express} from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

export function setupServer(server: Express): void {
  server.use(cors());
  server.use(bodyParser.json());
}
