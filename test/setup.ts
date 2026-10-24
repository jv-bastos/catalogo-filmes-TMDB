import '@testing-library/jest-dom/vitest';
import { createElement } from 'react';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { server } from './msw-server';

vi.mock('next/image', () => ({
  default: ({ src, alt, draggable }: { src: string; alt: string; draggable?: boolean }) =>
    createElement('img', { src, alt, draggable }),
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
