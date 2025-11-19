import { beforeAll, afterEach, afterAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';
import { server } from './mocks/server.js';

// Load test environment variables
beforeAll(() => {
  dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
