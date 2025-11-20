import { beforeAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';
import { server } from './mocks/server.js';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Close MSW server for integration tests (supertest shouldn't be intercepted)
beforeAll(() => {
  server.close();
});
