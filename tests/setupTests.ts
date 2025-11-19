import { beforeAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
beforeAll(() => {
  dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });
});