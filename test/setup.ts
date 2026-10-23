import '@testing-library/jest-dom/vitest';
import { createElement } from 'react';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { server } from './msw-server';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => createElement('img', { src, alt }),
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  process.env.TMDB_TOKEN = 'test-token';
});
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
