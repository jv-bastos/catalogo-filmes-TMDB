# Catálogo de Filmes em Streaming — Design

**Data:** 2026-10-23
**Status:** aprovado em conversa, aguardando revisão da spec escrita

## Contexto e objetivo

Aplicativo web que exibe os filmes disponíveis agora nos serviços de streaming no Brasil, usando a API do TMDB.

É um **projeto de aprendizado**, mas o foco não é a stack: o objetivo principal é exercitar o fluxo completo de desenvolvimento com Claude Code (brainstorming → spec → plano → implementação com TDD → revisão → git). O escopo é propositalmente pequeno para ser concluído de ponta a ponta.

**Critério de sucesso:** o app roda localmente, cumpre as quatro funcionalidades abaixo, tem a suíte de testes passando e foi construído seguindo o fluxo de ponta a ponta.

## Decisões

| Tema | Decisão |
|---|---|
| Stack | Next.js (App Router) + React + TypeScript |
| Busca de dados | Server Components chamando o TMDB no servidor; filtros, página e termo de busca na URL |
| Região / idioma | `watch_region=BR`, `language=pt-BR`; interface em português |
| Execução | Somente local (sem deploy nesta versão) |
| Token | `TMDB_TOKEN` (API Read Access Token v4) em `.env.local`, sem prefixo `NEXT_PUBLIC_` |
| Controle de versão | git desde o início, repositório no GitHub (`jv-bastos`) |

## Escopo da v1

1. **Catálogo com paginação** — grade de pôsteres dos filmes incluídos em assinatura de streaming no BR, ordenados por popularidade.
2. **Filtro por streaming** — seleção de um ou mais serviços (Netflix, Prime Video, Disney+, Max, Globoplay etc.).
3. **Busca por título** — busca livre: retorna qualquer filme com o título, mesmo fora de streaming.
4. **Página de detalhes** — sinopse, elenco e onde assistir (assinatura, aluguel, compra).

**Fora do escopo:** filtro por gênero, ordenação configurável, favoritos, deploy/proxy, retry automático. Candidatos a ciclos futuros.

## Estrutura

```
app/
  layout.tsx            # cabeçalho (logo + SearchBox) e rodapé com atribuição TMDB/JustWatch
  page.tsx              # Catálogo: ?providers=&page=
  busca/page.tsx        # Busca: ?q=&page=
  filme/[id]/page.tsx   # Detalhes
  loading.tsx, error.tsx, not-found.tsx

lib/tmdb/
  client.ts     # fetch autenticado, URL base, TmdbError; importa 'server-only'
  movies.ts     # discoverMovies, searchMovies, getMovieDetails, getProviders
  types.ts      # tipos das respostas usadas
  images.ts     # URLs de pôster e logo

lib/params.ts   # conversão/validação dos parâmetros da URL (providers, page)

components/
  MovieGrid, MovieCard      # servidor
  Pagination                # servidor: links que preservam os filtros
  WatchProviders, CastList  # servidor: blocos da página de detalhes
  ProviderFilter            # cliente: seleção de streamings → atualiza a URL
  SearchBox                 # cliente: navega para /busca?q=
```

**Fronteiras:**
- `lib/tmdb` é o único módulo que conversa com o TMDB. Páginas chamam funções nomeadas (`discoverMovies({ providers, page })`), sem montar URLs ou cabeçalhos.
- `server-only` faz o build falhar se um Client Component importar o cliente TMDB.
- Apenas `ProviderFilter` e `SearchBox` são Client Components. A paginação são links comuns.

## Fluxo de dados e chamadas à API

Todas as chamadas: base `https://api.themoviedb.org/3`, cabeçalho `Authorization: Bearer <TMDB_TOKEN>`, `language=pt-BR`.

### Lista de streamings — `getProviders()`
`GET /watch/providers/movie?watch_region=BR`
- Ordena por `display_priorities.BR` (crescente) e mantém os 12 primeiros.
- Revalidação: 24h.

### Catálogo — `discoverMovies({ providers, page })`
`GET /discover/movie?watch_region=BR&with_watch_providers=<ids separados por |>&with_watch_monetization_types=flatrate&sort_by=popularity.desc&page=<n>`
- `|` = filme em qualquer um dos streamings selecionados.
- `flatrate` restringe a filmes incluídos em assinatura.
- Sem filtro selecionado: envia os IDs de todos os streamings retornados por `getProviders()`. Durante a implementação, verificar com chamada real se `watch_region` + `flatrate` sem `with_watch_providers` já filtra corretamente; se sim, simplificar para omitir o parâmetro.
- Revalidação: 1h.

### Busca — `searchMovies({ query, page })`
`GET /search/movie?query=<q>&page=<n>&include_adult=false`
- Revalidação: 1h.

### Detalhes — `getMovieDetails(id)`
`GET /movie/<id>?append_to_response=credits,watch/providers`
- Uma chamada traz detalhes, elenco e provedores.
- Onde assistir: `watch/providers.results.BR`, agrupado em **Assinatura** (`flatrate`), **Aluguel** (`rent`) e **Compra** (`buy`), com logos e o `link` do JustWatch.
- Elenco: 10 primeiros de `credits.cast`.
- Revalidação: 1h.

### Validação de parâmetros (`lib/params.ts`)
- `providers`: string separada por vírgula → inteiros; descarta não numéricos e IDs fora da lista de `getProviders()`.
- `page`: inteiro ≥ 1; inválido → 1; limitado a `min(total_pages, 500)`.
- `id` de filme não numérico → `notFound()`.

## Erros, estados vazios e carregamento

### Erros
- `client.ts` lança `TmdbError` com `status` HTTP para respostas não-OK e envolve falhas de rede.
- `TMDB_TOKEN` ausente: erro lançado antes da requisição, com a mensagem "TMDB_TOKEN ausente ou inválido — veja .env.local".
- 401: mesma mensagem registrada no log do servidor.
- 404 em detalhes → `notFound()` → "Filme não encontrado".
- Demais erros (5xx, 429, rede) → `error.tsx` com "Algo deu errado" e botão **Tentar novamente** (`reset()`).

### Estados vazios
| Situação | Exibição |
|---|---|
| Catálogo sem resultados | "Nenhum filme encontrado nesses streamings" + link para limpar filtros |
| `/busca` sem `q` | Convite para digitar um título; nenhuma chamada à API |
| Busca sem resultados | "Nenhum resultado para "<q>"" |
| Filme sem provedores no BR | "Não disponível em streaming no Brasil" |
| Sem pôster | Placeholder neutro |
| Sem sinopse | "Sinopse não disponível" |

### Carregamento
- `loading.tsx`: grade de esqueletos.
- Imagens via `next/image`, com `image.tmdb.org` em `images.remotePatterns`.

### Atribuição
Rodapé com logo/texto do TMDB ("This product uses the TMDB API but is not endorsed or certified by TMDB") e crédito ao JustWatch como fonte dos dados de streaming.

## Testes

1. **Unitários (Vitest, escritos com TDD)**
   - Funções puras: `lib/params.ts`, `lib/tmdb/images.ts`, ordenação/corte de provedores.
   - `lib/tmdb` com MSW simulando o TMDB: endpoint e parâmetros corretos, cabeçalho de autenticação, mapeamento da resposta, `TmdbError` com o status certo, erro de token ausente.
2. **Componentes (Vitest + Testing Library)**
   - `ProviderFilter`: marcar/desmarcar atualiza `providers` na URL e volta para a página 1.
   - `SearchBox`: enviar navega para `/busca?q=...`; termo vazio não navega.
   - `next/navigation` simulado. Server Components assíncronos não são testados nesta camada.
3. **Smoke E2E (Playwright, API real)** — `npm run test:e2e`, pulados sem `TMDB_TOKEN`:
   - Catálogo carrega e exibe pôsteres.
   - Marcar um streaming muda a URL e os resultados.
   - Buscar "Duna" → abrir detalhes → seção "Onde assistir" visível.

Verificações antes de cada commit: `tsc --noEmit`, `eslint` e `vitest run`.
