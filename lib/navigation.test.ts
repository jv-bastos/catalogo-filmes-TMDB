import { beforeEach, describe, expect, it, vi } from 'vitest';

type Nav = typeof import('./navigation');

async function load(): Promise<Nav> {
  vi.resetModules();
  return import('./navigation');
}

function at(path: string) {
  window.history.pushState({}, '', path);
}

describe('navigation', () => {
  beforeEach(() => at('/'));

  it('sem local registrado não há histórico no app', async () => {
    const nav = await load();
    expect(nav.hasInAppHistory()).toBe(false);
  });

  it('na página de entrada não há histórico, em outro local há', async () => {
    const nav = await load();
    at('/filme/1');
    nav.recordLocation('/filme/1');
    expect(nav.hasInAppHistory()).toBe(false);
    at('/filme/2?x=1');
    expect(nav.hasInAppHistory()).toBe(true);
  });

  it('só o primeiro local registrado vira entrada (re-render ou Strict Mode não conta)', async () => {
    const nav = await load();
    at('/filme/1');
    nav.recordLocation('/filme/1');
    nav.recordLocation('/filme/1');
    nav.recordLocation('/outra');
    expect(nav.hasInAppHistory()).toBe(false);
  });

  it('voltar do navegador até a entrada volta a ser sem histórico', async () => {
    const nav = await load();
    at('/filme/1');
    nav.recordLocation('/filme/1');
    at('/filme/2');
    expect(nav.hasInAppHistory()).toBe(true);
    at('/filme/1');
    expect(nav.hasInAppHistory()).toBe(false);
  });
});
