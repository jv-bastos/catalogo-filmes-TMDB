import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/msw-server';
import { TMDB_BASE_URL, TmdbError, tmdbFetch } from './client';

describe('tmdbFetch', () => {
  it('monta URL, parâmetros e cabeçalho de autenticação', async () => {
    let req!: Request;
    server.use(
      http.get(`${TMDB_BASE_URL}/search/movie`, ({ request }) => {
        req = request;
        return HttpResponse.json({ ok: true });
      }),
    );
    await tmdbFetch('/search/movie', { query: 'duna', page: 2, skip: undefined }, 3600);
    const url = new URL(req.url);
    expect(url.searchParams.get('query')).toBe('duna');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('language')).toBe('pt-BR');
    expect(url.searchParams.has('skip')).toBe(false);
    expect(req.headers.get('authorization')).toBe('Bearer test-token');
  });

  it('lança TmdbError com o status em resposta não-OK', async () => {
    server.use(http.get(`${TMDB_BASE_URL}/movie/1`, () => new HttpResponse(null, { status: 404 })));
    await expect(tmdbFetch('/movie/1', {}, 3600)).rejects.toMatchObject({
      name: 'TmdbError',
      status: 404,
    });
  });

  it('em 401 registra a mensagem do token no console.error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(http.get(`${TMDB_BASE_URL}/movie/1`, () => new HttpResponse(null, { status: 401 })));
    await expect(tmdbFetch('/movie/1', {}, 3600)).rejects.toMatchObject({ status: 401 });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('TMDB_TOKEN ausente ou inválido — veja .env.local'),
    );
    spy.mockRestore();
  });

  it('sem TMDB_TOKEN lança erro antes de fazer a requisição', async () => {
    delete process.env.TMDB_TOKEN;
    await expect(tmdbFetch('/movie/1', {}, 3600)).rejects.toThrow(
      'TMDB_TOKEN ausente ou inválido — veja .env.local',
    );
  });

  it('falha de rede vira TmdbError com status 0', async () => {
    server.use(http.get(`${TMDB_BASE_URL}/movie/1`, () => HttpResponse.error()));
    const err = await tmdbFetch('/movie/1', {}, 3600).catch((e) => e);
    expect(err).toBeInstanceOf(TmdbError);
    expect(err).toMatchObject({ name: 'TmdbError', status: 0 });
  });
});
