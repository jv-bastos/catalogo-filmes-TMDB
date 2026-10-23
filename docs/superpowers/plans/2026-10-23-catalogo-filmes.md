# Catálogo de Filmes em Streaming — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App Next.js que lista os filmes em assinatura de streaming no Brasil, com filtro por streaming, busca por título e página de detalhes, usando a API do TMDB.

**Architecture:** Server Components buscam dados do TMDB no servidor através de um único módulo (`lib/tmdb`); filtros, página e termo de busca vivem na URL. Apenas `ProviderFilter` e `SearchBox` são Client Components. Lógica pura (parâmetros, URLs, mapeamento de respostas) é testada com Vitest + MSW; páginas assíncronas são cobertas por smoke tests Playwright.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React, TypeScript, Tailwind CSS, Vitest, Testing Library, MSW 2, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-23-catalogo-filmes-design.md`

## Global Constraints

- Node 24 / npm 11 (ambiente do usuário: Windows 11, Git Bash disponível).
- Next.js 16 App Router: `params` e `searchParams` das páginas são `Promise` e precisam de `await`.
- Token: variável `TMDB_TOKEN` em `.env.local`, **nunca** com prefixo `NEXT_PUBLIC_`. `.env.example` versionado com `TMDB_TOKEN=`.
- Base da API: `https://api.themoviedb.org/3`; toda chamada leva `Authorization: Bearer <TMDB_TOKEN>` e `language=pt-BR`.
- Região: `watch_region=BR`.
- Revalidação (`fetch(..., { next: { revalidate } })`): provedores `86400`; discover, search e detalhes `3600`.
- Máximo de páginas do TMDB: `500`.
- Provedores no filtro: os `12` primeiros por `display_priorities.BR` crescente.
- Elenco: os `10` primeiros de `credits.cast`.
- Imagens: `https://image.tmdb.org/t/p/<size>/<path>`; `image.tmdb.org` em `images.remotePatterns`.
- MSW fixado em `msw@^2` (API `http`/`HttpResponse`/`setupServer` de `msw/node`).
- Todo texto da interface em português (pt-BR). Textos fixos pela spec:
  - "Nenhum filme encontrado nesses streamings" · "Limpar filtros"
  - `Nenhum resultado para "<q>"`
  - "Não disponível em streaming no Brasil"
  - "Sinopse não disponível"
  - "Algo deu errado" · "Tentar novamente"
  - "Filme não encontrado"
  - "Onde assistir" · "Assinatura" · "Aluguel" · "Compra"
  - Mensagem de token: "TMDB_TOKEN ausente ou inválido — veja .env.local"
  - Rodapé: "This product uses the TMDB API but is not endorsed or certified by TMDB." + "Dados de streaming fornecidos por JustWatch."
- Antes de cada commit: `npm run typecheck && npm run lint && npm run test` passam.
- Mensagens de commit em português, prefixo convencional (`feat:`, `test:`, `chore:`, `docs:`), terminando com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **URL adulterada no catálogo** (`/?providers=abc,8,999999&page=-3`) → ignora IDs inválidos/desconhecidos e usa página 1, sem erro. *Testado na Task 1 (`parseProviders`, `parsePage`).*
2. **Página além do fim** (`/?page=600`, ou `?page=40` quando só há 3 páginas) → página limitada a 500; sem link "Próxima" além da última; grade vazia mostra o estado vazio em vez de quebrar. *Testado na Task 1 (`parsePage`) e Task 4 (`Pagination`).*
3. **Busca com acentos e símbolos** ("O Poderoso Chefão & Cia") → codificada corretamente na URL e na chamada à API. *Testado nas Tasks 1 (`searchHref`), 2 (`searchMovies`) e 5 (`SearchBox`).*
4. **Filme com dados faltando** (sem pôster, sinopse vazia, sem provedores no BR, elenco vazio) → placeholders e textos da spec, sem quebrar. *Testado nas Tasks 2 (mapeamento) e 4 (componentes).*
5. **TMDB fora do ar, token ausente/inválido ou ID inexistente** → `TmdbError` com status correto; 404 de detalhes vira `null` (→ "Filme não encontrado"); demais viram página de erro com "Tentar novamente". *Testado nas Tasks 1 (`parseMovieId`) e 2 (cliente e `getMovieDetails`).*

---

## Estrutura de arquivos

```
app/
  layout.tsx                 # Task 6: cabeçalho com SearchBox, rodapé com atribuição
  page.tsx                   # Task 6: catálogo
  busca/page.tsx             # Task 6: busca
  filme/[id]/page.tsx        # Task 7: detalhes
  filme/[id]/not-found.tsx   # Task 7: "Filme não encontrado"
  loading.tsx, error.tsx, not-found.tsx   # Task 6
lib/
  params.ts                  # Task 1: parseProviders, parsePage, parseMovieId, MAX_PAGES
  urls.ts                    # Task 1: catalogHref, searchHref
  tmdb/
    client.ts                # Task 2: tmdbFetch, TmdbError
    types.ts                 # Task 2: tipos crus da API + tipos do app
    images.ts                # Task 2: posterUrl, logoUrl
    movies.ts                # Task 3: getProviders, discoverMovies, searchMovies, getMovieDetails
components/
  MovieCard.tsx, MovieGrid.tsx, Pagination.tsx, WatchProviders.tsx, CastList.tsx   # Task 4
  ProviderFilter.tsx, SearchBox.tsx                                                # Task 5
test/
  setup.ts                   # Task 1: jest-dom, MSW, TMDB_TOKEN de teste, mock de next/image
  msw-server.ts              # Task 1
  server-only-stub.ts        # Task 1
e2e/
  smoke.spec.ts              # Task 8
vitest.config.mts, playwright.config.ts, .env.example, README.md
```

Testes unitários ficam ao lado do arquivo testado (`lib/params.test.ts`, `components/Pagination.test.tsx` etc.).

---

### Task 1: Projeto base, ferramentas de teste e helpers de URL

**Files:**
- Create: projeto Next.js na raiz (via `create-next-app`)
- Create: `vitest.config.mts`, `test/setup.ts`, `test/msw-server.ts`, `test/server-only-stub.ts`, `.env.example`
- Modify: `package.json` (scripts), `.gitignore` (liberar `.env.example`)
- Create: `lib/params.ts`, `lib/urls.ts`
- Test: `lib/params.test.ts`, `lib/urls.test.ts`

**Interfaces:**
- Produces:
  - `MAX_PAGES = 500`
  - `parseProviders(raw: string | string[] | undefined, allowedIds: number[]): number[]` — inteiros únicos, só os presentes em `allowedIds`, ordenados crescente.
  - `parsePage(raw: string | string[] | undefined): number` — inteiro ≥ 1, no máximo `MAX_PAGES`; inválido → `1`. Array → usa o primeiro.
  - `parseMovieId(raw: string): number | null` — inteiro positivo só com dígitos; caso contrário `null`.
  - `catalogHref(providers: number[], page?: number): string`
  - `searchHref(query: string, page?: number): string`
  - Scripts: `npm run test` (`vitest run`), `npm run test:watch` (`vitest`), `npm run typecheck` (`tsc --noEmit`), `npm run lint` (já criado pelo scaffold).

- [ ] **Step 1: Gerar o projeto Next.js**

`create-next-app` recusa diretórios com arquivos desconhecidos, então mova `docs/` temporariamente:

```bash
mv docs ../_docs_tmp
npx create-next-app@latest . --ts --eslint --tailwind --app --no-src-dir --import-alias "@/*" --use-npm --yes
mv ../_docs_tmp docs
```

Esperado: `package.json`, `app/`, `next.config.ts` criados; `docs/` de volta; `git status` mostra o `.git` existente preservado.

- [ ] **Step 2: Instalar dependências**

```bash
npm install server-only
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw@^2
```

- [ ] **Step 3: Configurar Vitest**

- `vitest.config.mts`: plugins `react()` e `tsconfigPaths()`; `test.environment: 'jsdom'`; `test.setupFiles: ['./test/setup.ts']`; `test.exclude: [...configDefaults.exclude, 'e2e/**']`; `resolve.alias: { 'server-only': <caminho absoluto de test/server-only-stub.ts> }` (o pacote real lança erro fora do Next).
- `test/server-only-stub.ts`: `export {};`
- `test/msw-server.ts`: `export const server = setupServer();`
- `test/setup.ts`: importa `@testing-library/jest-dom/vitest`; `beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))`, `afterEach(() => { server.resetHandlers(); cleanup(); })`, `afterAll(() => server.close())`; define `process.env.TMDB_TOKEN = 'test-token'` em `beforeEach`; `vi.mock('next/image', ...)` renderizando um `<img>` comum com `src` e `alt`.
- `package.json` scripts: adicionar `test`, `test:watch`, `typecheck` conforme Interfaces.
- `.env.example`: `TMDB_TOKEN=`; em `.gitignore`, logo após a linha `.env*`, adicionar `!.env.example`.

- [ ] **Step 4: Escrever os testes que falham**

`lib/params.test.ts`:

```ts
describe('parseProviders', () => {
  const allowed = [8, 119, 337];
  it('converte lista separada por vírgula, ordena e remove duplicatas', () => {
    expect(parseProviders('119,8,8', allowed)).toEqual([8, 119]);
  });
  it('descarta valores não numéricos e IDs desconhecidos', () => {
    expect(parseProviders('abc,8,999999', allowed)).toEqual([8]);
  });
  it('retorna vazio para undefined ou string vazia', () => {
    expect(parseProviders(undefined, allowed)).toEqual([]);
    expect(parseProviders('', allowed)).toEqual([]);
  });
  it('usa o primeiro valor quando recebe array', () => {
    expect(parseProviders(['337', '8'], allowed)).toEqual([337]);
  });
});

describe('parsePage', () => {
  it('aceita inteiros positivos', () => expect(parsePage('3')).toBe(3));
  it.each([undefined, '', 'abc', '0', '-3', '2.5'])('valor inválido %s vira 1', (v) => {
    expect(parsePage(v)).toBe(1);
  });
  it('limita a MAX_PAGES', () => expect(parsePage('600')).toBe(500));
});

describe('parseMovieId', () => {
  it('aceita só dígitos', () => expect(parseMovieId('438631')).toBe(438631));
  it.each(['abc', '0', '-1', '12abc', '1.5', ''])('rejeita %s', (v) => {
    expect(parseMovieId(v)).toBeNull();
  });
});
```

`lib/urls.test.ts`:

```ts
describe('catalogHref', () => {
  it('sem filtros e página 1 é a raiz', () => expect(catalogHref([])).toBe('/'));
  it('inclui providers separados por vírgula', () => expect(catalogHref([8, 119])).toBe('/?providers=8%2C119'));
  it('omite page=1 e inclui páginas maiores', () => {
    expect(catalogHref([8], 1)).toBe('/?providers=8');
    expect(catalogHref([8], 2)).toBe('/?providers=8&page=2');
    expect(catalogHref([], 3)).toBe('/?page=3');
  });
});

describe('searchHref', () => {
  it('codifica acentos e símbolos', () => {
    expect(searchHref('O Poderoso Chefão & Cia')).toBe('/busca?q=O+Poderoso+Chef%C3%A3o+%26+Cia');
  });
  it('inclui página maior que 1', () => expect(searchHref('duna', 2)).toBe('/busca?q=duna&page=2'));
});
```

- [ ] **Step 5: Rodar e ver falhar**

Run: `npm run test`
Expected: FAIL — módulos `./params` e `./urls` não encontrados.

- [ ] **Step 6: Implementar `lib/params.ts` e `lib/urls.ts`**

`urls.ts` usa `URLSearchParams` (por isso a vírgula vira `%2C` e espaço vira `+`).

- [ ] **Step 7: Rodar e ver passar**

Run: `npm run typecheck && npm run lint && npm run test`
Expected: tudo PASS. Também `npm run build` conclui sem erro.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: projeto Next.js com Vitest, MSW e helpers de URL"
```

---

### Task 2: Cliente TMDB, tipos e imagens

**Files:**
- Create: `lib/tmdb/client.ts`, `lib/tmdb/types.ts`, `lib/tmdb/images.ts`
- Test: `lib/tmdb/client.test.ts`, `lib/tmdb/images.test.ts`

**Interfaces:**
- Consumes: `server` de `test/msw-server.ts` (Task 1).
- Produces:
  - `TMDB_BASE_URL = 'https://api.themoviedb.org/3'`
  - `class TmdbError extends Error { status: number }` — define `this.name = 'TmdbError'`; `status` é o HTTP status; `0` para falha de rede.
  - `tmdbFetch<T>(path: string, params: Record<string, string | number | undefined>, revalidate: number): Promise<T>` — ignora params `undefined`, sempre acrescenta `language=pt-BR`.
  - `types.ts` (tipos do app, usados pelas Tasks 3–7):
    ```ts
    type Provider = { id: number; name: string; logoPath: string | null };
    type MovieSummary = { id: number; title: string; posterPath: string | null; releaseYear: string | null };
    type MoviePage = { movies: MovieSummary[]; page: number; totalPages: number };
    type CastMember = { id: number; name: string; character: string };
    type WatchOptions = { link: string | null; flatrate: Provider[]; rent: Provider[]; buy: Provider[] };
    type MovieDetails = MovieSummary & {
      overview: string | null; runtime: number | null; genres: string[];
      cast: CastMember[]; watch: WatchOptions | null;
    };
    ```
    Mais os tipos crus da API (`RawMovie`, `RawProvider`, `RawPage`, `RawMovieDetails`) usados só por `movies.ts`.
  - `posterUrl(path: string | null, size?: 'w342' | 'w500'): string | null` (padrão `w342`)
  - `logoUrl(path: string | null): string | null` (tamanho `w92`)

- [ ] **Step 1: Escrever os testes que falham**

`lib/tmdb/client.test.ts` (usar `server.use(http.get(...))` capturando `request`):

```ts
it('monta URL, parâmetros e cabeçalho de autenticação', async () => {
  let req!: Request;
  server.use(http.get(`${TMDB_BASE_URL}/search/movie`, ({ request }) => { req = request; return HttpResponse.json({ ok: true }); }));
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
  await expect(tmdbFetch('/movie/1', {}, 3600)).rejects.toMatchObject({ name: 'TmdbError', status: 404 });
});

it('em 401 registra a mensagem do token no console.error', async () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  server.use(http.get(`${TMDB_BASE_URL}/movie/1`, () => new HttpResponse(null, { status: 401 })));
  await expect(tmdbFetch('/movie/1', {}, 3600)).rejects.toMatchObject({ status: 401 });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('TMDB_TOKEN ausente ou inválido — veja .env.local'));
});

it('sem TMDB_TOKEN lança erro antes de fazer a requisição', async () => {
  delete process.env.TMDB_TOKEN;
  await expect(tmdbFetch('/movie/1', {}, 3600)).rejects.toThrow('TMDB_TOKEN ausente ou inválido — veja .env.local');
  // onUnhandledRequest: 'error' garante que nenhuma requisição saiu
});

it('falha de rede vira TmdbError com status 0', async () => {
  server.use(http.get(`${TMDB_BASE_URL}/movie/1`, () => HttpResponse.error()));
  await expect(tmdbFetch('/movie/1', {}, 3600)).rejects.toMatchObject({ name: 'TmdbError', status: 0 });
});
```

`lib/tmdb/images.test.ts`:

```ts
expect(posterUrl('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w342/abc.jpg');
expect(posterUrl('/abc.jpg', 'w500')).toBe('https://image.tmdb.org/t/p/w500/abc.jpg');
expect(posterUrl(null)).toBeNull();
expect(logoUrl('/n.png')).toBe('https://image.tmdb.org/t/p/w92/n.png');
expect(logoUrl(null)).toBeNull();
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- lib/tmdb`
Expected: FAIL — módulos não encontrados.

- [ ] **Step 3: Implementar `client.ts`, `types.ts`, `images.ts`**

`client.ts` começa com `import 'server-only';`. Passa `{ headers, next: { revalidate } }` ao `fetch`. Token ausente lança `TmdbError` com `status 401` e a mensagem de token.

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run typecheck && npm run lint && npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/tmdb
git commit -m "feat: cliente TMDB com tratamento de erros e helpers de imagem"
```

---

### Task 3: Funções de filmes (`movies.ts`)

**Files:**
- Create: `lib/tmdb/movies.ts`
- Test: `lib/tmdb/movies.test.ts`

**Interfaces:**
- Consumes: `tmdbFetch`, `TmdbError`, tipos de `types.ts` (Task 2).
- Produces:
  - `getProviders(): Promise<Provider[]>` — `/watch/providers/movie`, `watch_region=BR`, revalidate `86400`; ordena por `display_priorities.BR` crescente (ausente = fim), mantém 12.
  - `discoverMovies(opts: { providers: number[]; page: number }): Promise<MoviePage>` — `/discover/movie` com `watch_region=BR`, `with_watch_monetization_types=flatrate`, `sort_by=popularity.desc`, `with_watch_providers` = IDs unidos por `|` (omitido se lista vazia); revalidate `3600`.
  - `searchMovies(opts: { query: string; page: number }): Promise<MoviePage>` — `/search/movie` com `include_adult=false`; revalidate `3600`.
  - `getMovieDetails(id: number): Promise<MovieDetails | null>` — `/movie/<id>` com `append_to_response=credits,watch/providers`; `null` quando `TmdbError` 404; outros erros propagam.
  - Mapeamento comum: `releaseYear` = 4 primeiros caracteres de `release_date` ou `null` se vazio; `totalPages = Math.min(total_pages, MAX_PAGES)`; `overview` vazio → `null`; `runtime` 0 → `null`; `cast` = 10 primeiros; `watch` = `results.BR` mapeado (listas ausentes → `[]`) ou `null` se não houver `BR`.

- [ ] **Step 1: Escrever os testes que falham**

Use fixtures pequenas inline. Casos (cada um um `it`):

```ts
// getProviders
it('ordena por prioridade no BR e mantém 12', async () => {
  // fixture com 14 provedores, prioridades embaralhadas, um sem chave BR
  const providers = await getProviders();
  expect(providers).toHaveLength(12);
  expect(providers[0]).toEqual({ id: 8, name: 'Netflix', logoPath: '/netflix.png' }); // prioridade BR 1
  expect(providers.map((p) => p.id)).not.toContain(SEM_BR_ID);
});

// discoverMovies
it('envia filtros de região, assinatura e provedores com |', async () => {
  const result = await discoverMovies({ providers: [8, 119], page: 2 });
  expect(url.searchParams.get('watch_region')).toBe('BR');
  expect(url.searchParams.get('with_watch_monetization_types')).toBe('flatrate');
  expect(url.searchParams.get('sort_by')).toBe('popularity.desc');
  expect(url.searchParams.get('with_watch_providers')).toBe('8|119');
  expect(url.searchParams.get('page')).toBe('2');
  expect(result.movies[0]).toEqual({ id: 1, title: 'Duna', posterPath: '/duna.jpg', releaseYear: '2021' });
});
it('omite with_watch_providers quando a lista é vazia', ...);
it('limita totalPages a 500 e trata release_date vazio', async () => {
  // fixture: total_pages 9000, um filme com release_date '' e poster_path null
  expect(result.totalPages).toBe(500);
  expect(result.movies[1]).toMatchObject({ releaseYear: null, posterPath: null });
});

// searchMovies
it('envia a busca com acentos e include_adult=false', async () => {
  await searchMovies({ query: 'O Poderoso Chefão & Cia', page: 1 });
  expect(url.searchParams.get('query')).toBe('O Poderoso Chefão & Cia');
  expect(url.searchParams.get('include_adult')).toBe('false');
});

// getMovieDetails
it('pede credits e watch/providers numa única chamada e mapeia tudo', async () => {
  const d = await getMovieDetails(438631);
  expect(url.pathname).toBe('/3/movie/438631');
  expect(url.searchParams.get('append_to_response')).toBe('credits,watch/providers');
  expect(d!.cast).toHaveLength(10);            // fixture com 15
  expect(d!.watch).toEqual({ link: 'https://www.themoviedb.org/movie/438631/watch?locale=BR',
    flatrate: [{ id: 337, name: 'Disney Plus', logoPath: '/d.png' }], rent: [], buy: [] });
  expect(d!.genres).toEqual(['Ficção científica', 'Aventura']);
});
it('dados faltando: sinopse vazia, runtime 0, sem BR, sem elenco', async () => {
  expect(d).toMatchObject({ overview: null, runtime: null, watch: null, cast: [], posterPath: null });
});
it('retorna null em 404', ...);
it('propaga TmdbError 500', async () => {
  await expect(getMovieDetails(1)).rejects.toMatchObject({ status: 500 });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- lib/tmdb/movies`
Expected: FAIL — módulo `./movies` não encontrado.

- [ ] **Step 3: Implementar `lib/tmdb/movies.ts`**

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run typecheck && npm run lint && npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/tmdb/movies.ts lib/tmdb/movies.test.ts
git commit -m "feat: funções de catálogo, busca, detalhes e provedores do TMDB"
```

---

### Task 4: Componentes de exibição

**Files:**
- Create: `components/MovieCard.tsx`, `components/MovieGrid.tsx`, `components/Pagination.tsx`, `components/WatchProviders.tsx`, `components/CastList.tsx`
- Test: `components/MovieCard.test.tsx`, `components/Pagination.test.tsx`, `components/WatchProviders.test.tsx`, `components/CastList.test.tsx`

**Interfaces:**
- Consumes: tipos de `types.ts`, `posterUrl`, `logoUrl` (Task 2).
- Produces (componentes síncronos, sem `'use client'`):
  - `MovieCard({ movie }: { movie: MovieSummary })` — `<Link href={`/filme/${id}`}>` com pôster (`alt` = título) ou placeholder (elemento com `data-testid="poster-placeholder"`), título e ano.
  - `MovieGrid({ movies }: { movies: MovieSummary[] })` — `<ul aria-label="Filmes">` com um `<li>` por filme.
  - `Pagination({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (page: number) => string })` — `<nav aria-label="Paginação">` com link "Anterior" (se `page > 1`, para `hrefFor(min(page - 1, totalPages))`), texto `Página X de Y`, link "Próxima" (se `page < totalPages`). Nada renderizado quando `totalPages <= 1` e `page === 1`.
  - `WatchProviders({ watch }: { watch: WatchOptions | null })` — `<section>` com `<h2>Onde assistir</h2>`; grupos "Assinatura", "Aluguel", "Compra" (só os não vazios), cada provedor com logo `alt` = nome; link "Ver no JustWatch" para `watch.link`; se `watch` for `null` ou os três grupos vazios → "Não disponível em streaming no Brasil".
  - `CastList({ cast }: { cast: CastMember[] })` — `<h2>Elenco</h2>` e lista "Nome — Personagem"; não renderiza nada se vazio.

- [ ] **Step 1: Escrever os testes que falham**

```ts
// MovieCard
it('linka para a página do filme e mostra pôster com alt', () => {
  render(<MovieCard movie={{ id: 1, title: 'Duna', posterPath: '/d.jpg', releaseYear: '2021' }} />);
  expect(screen.getByRole('link')).toHaveAttribute('href', '/filme/1');
  expect(screen.getByAltText('Duna')).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w342/d.jpg');
  expect(screen.getByText('2021')).toBeInTheDocument();
});
it('sem pôster mostra placeholder', () => {
  render(<MovieCard movie={{ id: 1, title: 'X', posterPath: null, releaseYear: null }} />);
  expect(screen.getByTestId('poster-placeholder')).toBeInTheDocument();
});

// Pagination
const hrefFor = (p: number) => catalogHref([8], p);
it('na primeira página só tem Próxima', () => {
  render(<Pagination page={1} totalPages={3} hrefFor={hrefFor} />);
  expect(screen.queryByRole('link', { name: 'Anterior' })).toBeNull();
  expect(screen.getByRole('link', { name: 'Próxima' })).toHaveAttribute('href', '/?providers=8&page=2');
  expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
});
it('na última página só tem Anterior', ...);           // page 3 de 3 → Anterior '/?providers=8&page=2'
it('página além do fim não oferece Próxima e Anterior volta para a última', () => {
  render(<Pagination page={40} totalPages={3} hrefFor={hrefFor} />);
  expect(screen.queryByRole('link', { name: 'Próxima' })).toBeNull();
  expect(screen.getByRole('link', { name: 'Anterior' })).toHaveAttribute('href', '/?providers=8&page=3');
});
it('não renderiza com uma página só', ...);            // page 1, totalPages 1 → container vazio
it('não renderiza com zero páginas', ...);             // page 1, totalPages 0 → container vazio

// WatchProviders
it('mostra só os grupos com provedores e o link do JustWatch', () => {
  render(<WatchProviders watch={{ link: 'https://jw', flatrate: [{ id: 8, name: 'Netflix', logoPath: '/n.png' }], rent: [], buy: [] }} />);
  expect(screen.getByRole('heading', { name: 'Onde assistir' })).toBeInTheDocument();
  expect(screen.getByText('Assinatura')).toBeInTheDocument();
  expect(screen.queryByText('Aluguel')).toBeNull();
  expect(screen.getByAltText('Netflix')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Ver no JustWatch' })).toHaveAttribute('href', 'https://jw');
});
it.each([null, { link: null, flatrate: [], rent: [], buy: [] }])('sem provedores mostra aviso', (watch) => {
  render(<WatchProviders watch={watch} />);
  expect(screen.getByText('Não disponível em streaming no Brasil')).toBeInTheDocument();
});

// CastList
it('lista nome e personagem', ...);                    // 'Timothée Chalamet — Paul Atreides'
it('não renderiza nada sem elenco', ...);
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- components`
Expected: FAIL — componentes não encontrados.

- [ ] **Step 3: Implementar os cinco componentes**

Estilo com Tailwind: grade responsiva (2 colunas no celular, até 5–6 no desktop), pôster com proporção 2:3. Imagens com `next/image` e `width`/`height` explícitos.

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run typecheck && npm run lint && npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components
git commit -m "feat: componentes de grade, paginação, onde assistir e elenco"
```

---

### Task 5: Componentes de cliente (`ProviderFilter`, `SearchBox`)

**Files:**
- Create: `components/ProviderFilter.tsx`, `components/SearchBox.tsx`
- Test: `components/ProviderFilter.test.tsx`, `components/SearchBox.test.tsx`

**Interfaces:**
- Consumes: `catalogHref`, `searchHref` (Task 1); `Provider`, `logoUrl` (Task 2).
- Produces (ambos com `'use client'`, usam `useRouter` de `next/navigation`):
  - `ProviderFilter({ providers, selected }: { providers: Provider[]; selected: number[] })` — `<fieldset>` com `<legend>Streamings</legend>` e um checkbox por provedor (rótulo = nome). Ao marcar/desmarcar: `router.push(catalogHref(novaSelecao))` — sem `page`, ou seja, volta para a página 1.
  - `SearchBox({ initialQuery }: { initialQuery?: string })` — `<form role="search">` com `<input type="search" aria-label="Buscar filme">` e botão "Buscar". No envio: termo com `trim()`; vazio não navega; senão `router.push(searchHref(termo))`.

- [ ] **Step 1: Escrever os testes que falham**

```ts
const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
beforeEach(() => push.mockClear());

const providers = [
  { id: 8, name: 'Netflix', logoPath: null },
  { id: 119, name: 'Amazon Prime Video', logoPath: null },
];

// ProviderFilter
it('marcar um streaming navega com o filtro e sem page', async () => {
  render(<ProviderFilter providers={providers} selected={[]} />);
  await userEvent.click(screen.getByRole('checkbox', { name: 'Netflix' }));
  expect(push).toHaveBeenCalledWith('/?providers=8');
});
it('reflete a seleção atual', () => {
  render(<ProviderFilter providers={providers} selected={[119]} />);
  expect(screen.getByRole('checkbox', { name: 'Amazon Prime Video' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Netflix' })).not.toBeChecked();
});
it('desmarcar mantém os outros em ordem', async () => {
  render(<ProviderFilter providers={providers} selected={[8, 119]} />);
  await userEvent.click(screen.getByRole('checkbox', { name: 'Netflix' }));
  expect(push).toHaveBeenCalledWith('/?providers=119');
});
it('desmarcar o último volta para a raiz', ...);       // selected [8] → push('/')

// SearchBox
it('envia o termo para /busca', async () => {
  render(<SearchBox />);
  await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar filme' }), 'duna{Enter}');
  expect(push).toHaveBeenCalledWith('/busca?q=duna');
});
it('codifica acentos e símbolos e remove espaços nas pontas', ...); // '  O Poderoso Chefão & Cia ' → '/busca?q=O+Poderoso+Chef%C3%A3o+%26+Cia'
it('termo vazio não navega', ...);                     // '   {Enter}' → push não chamado
it('preenche com initialQuery', ...);                  // initialQuery 'duna' → input com value 'duna'
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- components/ProviderFilter components/SearchBox`
Expected: FAIL — componentes não encontrados.

- [ ] **Step 3: Implementar os dois componentes**

`SearchBox` com estado local do campo inicializado por `initialQuery`.

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run typecheck && npm run lint && npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ProviderFilter.* components/SearchBox.*
git commit -m "feat: filtro de streamings e campo de busca"
```

---

### Task 6: Layout, catálogo e busca

**Files:**
- Modify: `app/layout.tsx`, `app/page.tsx`, `app/globals.css` (remover estilos do template), `next.config.ts`
- Create: `app/busca/page.tsx`, `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`

**Interfaces:**
- Consumes: `getProviders`, `discoverMovies`, `searchMovies` (Task 3); `parseProviders`, `parsePage` (Task 1); `catalogHref`, `searchHref` (Task 1); `MovieGrid`, `Pagination` (Task 4); `ProviderFilter`, `SearchBox` (Task 5).
- Produces: rotas `/` e `/busca` funcionando com dados reais.

Páginas assíncronas não têm teste unitário (spec); a verificação é build + execução manual aqui e smoke tests na Task 8.

- [ ] **Step 1: `next.config.ts`**

`images.remotePatterns: [{ protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' }]`.

- [ ] **Step 2: `app/layout.tsx`**

`<html lang="pt-BR">`; `metadata.title = 'Catálogo de Filmes'`; cabeçalho com link "Catálogo de Filmes" para `/` e `<SearchBox />`; rodapé com os dois textos de atribuição das Global Constraints (link para `https://www.themoviedb.org` e `https://www.justwatch.com`).

- [ ] **Step 3: `app/page.tsx` (catálogo)**

```ts
export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ providers?: string | string[]; page?: string | string[] }> })
```
Fluxo: `getProviders()` → `allowed = ids` → `selected = parseProviders(sp.providers, allowed)` → `page = parsePage(sp.page)` → `discoverMovies({ providers: selected.length ? selected : allowed, page })`. Renderiza `ProviderFilter` (`selected`), depois `MovieGrid` ou o estado vazio ("Nenhum filme encontrado nesses streamings" + link "Limpar filtros" para `/`), e `Pagination` com `hrefFor = (p) => catalogHref(selected, p)`.

- [ ] **Step 4: `app/busca/page.tsx`**

`q` = primeiro valor de `searchParams.q`, com `trim()`. Vazio → texto "Digite o título de um filme para buscar." e **nenhuma** chamada à API. Senão `searchMovies({ query: q, page })` → título `Resultados para "<q>"`, `MovieGrid` ou `Nenhum resultado para "<q>"`, `Pagination` com `hrefFor = (p) => searchHref(q, p)`. O `SearchBox` do cabeçalho não sabe o termo atual, então esta página não repete o campo.

- [ ] **Step 5: `loading.tsx`, `error.tsx`, `not-found.tsx`**

- `loading.tsx`: grade de 12 blocos cinza com `animate-pulse`, proporção 2:3.
- `error.tsx` (`'use client'`, props `{ error, reset }`): "Algo deu errado" e botão "Tentar novamente" que chama `reset()`.
- `not-found.tsx`: "Página não encontrada" + link para `/`.

- [ ] **Step 6: Verificar build e execução manual**

Run: `npm run typecheck && npm run lint && npm run test && npm run build`
Expected: tudo PASS; build sem erros.

Se `.env.local` com `TMDB_TOKEN` existir: `npm run dev`, abrir `http://localhost:3000`, conferir grade, marcar Netflix (URL com `providers=8`), paginar, buscar "Duna". Se não existir, registrar no relatório que a verificação manual ficou pendente para a Task 8.

- [ ] **Step 7: Commit**

```bash
git add app next.config.ts
git commit -m "feat: páginas de catálogo e busca com layout e estados de erro"
```

---

### Task 7: Página de detalhes

**Files:**
- Create: `app/filme/[id]/page.tsx`, `app/filme/[id]/not-found.tsx`

**Interfaces:**
- Consumes: `getMovieDetails` (Task 3); `parseMovieId` (Task 1); `posterUrl` (Task 2); `WatchProviders`, `CastList` (Task 4).
- Produces: rota `/filme/[id]`.

- [ ] **Step 1: `app/filme/[id]/page.tsx`**

```ts
export default async function MoviePage({ params }: { params: Promise<{ id: string }> })
```
`parseMovieId(id)` → `null` → `notFound()`; `getMovieDetails(id)` → `null` → `notFound()`. Layout: pôster `w500` (ou placeholder) ao lado de título, ano, duração (`runtime` em "Xh Ymin", omitida se `null`), gêneros, sinopse (ou "Sinopse não disponível"); abaixo `WatchProviders` e `CastList`.

Exportar também `generateMetadata` com `title: '<título> — Catálogo de Filmes'`, chamando o mesmo `getMovieDetails` (o cache do `fetch` evita chamada duplicada); `id` inválido ou `null` → título padrão.

- [ ] **Step 2: `app/filme/[id]/not-found.tsx`**

"Filme não encontrado" + link "Voltar ao catálogo" para `/`.

- [ ] **Step 3: Verificar**

Run: `npm run typecheck && npm run lint && npm run test && npm run build`
Expected: PASS.

Com token: `npm run dev` e abrir `/filme/438631` (Duna), `/filme/abc` e `/filme/999999999` (ambos "Filme não encontrado").

- [ ] **Step 4: Commit**

```bash
git add app/filme
git commit -m "feat: página de detalhes com onde assistir e elenco"
```

---

### Task 8: Smoke tests E2E e README

**Files:**
- Create: `playwright.config.ts`, `e2e/smoke.spec.ts`, `README.md` (substitui o do template)
- Modify: `package.json` (script `test:e2e`), `.gitignore` (`/test-results`, `/playwright-report`)

**Interfaces:**
- Consumes: as rotas das Tasks 6 e 7; nomes acessíveis definidos nas Tasks 4 e 5 (`list` "Filmes", `checkbox` "Netflix", `searchbox` "Buscar filme", `heading` "Onde assistir").

- [ ] **Step 1: Instalar e configurar Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

`playwright.config.ts`: no topo, `try { process.loadEnvFile('.env.local'); } catch {}`; `testDir: 'e2e'`; só o projeto `chromium`; `use.baseURL: 'http://localhost:3000'`; `webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: true, timeout: 120_000 }`. Script: `"test:e2e": "playwright test"`.

- [ ] **Step 2: Escrever `e2e/smoke.spec.ts`**

```ts
test.skip(!process.env.TMDB_TOKEN, 'TMDB_TOKEN não definido — smoke tests pulados');

test('catálogo carrega pôsteres', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('list', { name: 'Filmes' }).getByRole('listitem').first()).toBeVisible();
});

test('filtrar por Netflix muda a URL e mantém resultados', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('checkbox', { name: 'Netflix' }).check();
  await expect(page).toHaveURL(/providers=8(&|$)/);
  await expect(page.getByRole('list', { name: 'Filmes' }).getByRole('listitem').first()).toBeVisible();
});

test('buscar Duna e abrir detalhes mostra Onde assistir', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar filme' }).fill('Duna');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/busca\?q=Duna/);
  await page.getByRole('list', { name: 'Filmes' }).getByRole('link').first().click();
  await expect(page.getByRole('heading', { name: 'Onde assistir' })).toBeVisible();
});
```

- [ ] **Step 3: Rodar**

Run: `npm run test:e2e`
Expected: com token, 3 passed; sem token, 3 skipped (relatar qual dos dois aconteceu).

- [ ] **Step 4: Verificação da spec sobre o filtro padrão (só com token)**

Comparar `total_results` de `/discover/movie?watch_region=BR&with_watch_monetization_types=flatrate` com e sem `with_watch_providers` (lista completa dos 12). Se a chamada sem o parâmetro também retornar só filmes em assinatura no BR (total menor que o de `/discover/movie` sem filtros), simplificar `app/page.tsx` para passar `providers: selected` e rodar todos os testes de novo. Registrar o resultado no relatório da task.

- [ ] **Step 5: `README.md`**

Seções: o que é o app (uma frase + funcionalidades da v1); stack; como rodar (criar conta no TMDB, copiar `.env.example` para `.env.local`, preencher `TMDB_TOKEN` com o *API Read Access Token*, `npm install`, `npm run dev`); scripts (`dev`, `build`, `test`, `test:e2e`, `typecheck`, `lint`); "Como foi construído" (link para a spec e este plano, mencionando o fluxo com Claude Code); atribuição TMDB/JustWatch.

- [ ] **Step 6: Verificação final**

Run: `npm run typecheck && npm run lint && npm run test && npm run build`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: smoke tests E2E com Playwright e README do projeto"
```
