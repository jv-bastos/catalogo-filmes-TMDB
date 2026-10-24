# Sessão — Catálogo de Filmes em Streaming (Brasil)

Catálogo de filmes disponíveis em streaming no Brasil, com dados da API do TMDB, onde você descobre **onde assistir** cada título.

## Funcionalidades

- Carrossel com os 5 filmes em alta, que troca sozinho e pode ser arrastado
- Catálogo paginado de filmes disponíveis por assinatura no Brasil, em grade sempre com linhas completas
- Filtro por streaming (os 12 principais provedores no BR), refletido na URL, com a tela bloqueada enquanto carrega
- Busca por título (`/busca?q=`)
- Página de detalhes com sinopse, "Onde assistir" (assinatura, aluguel e compra), trailer (carregado só ao clicar, via YouTube sem cookies) e elenco arrastável
- Interface em português (pt-BR), com estados de erro, vazio e carregamento

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components) e React 19
- TypeScript e Tailwind CSS 4
- Vitest, Testing Library e MSW para testes unitários e de componentes
- Playwright para smoke tests E2E
- [API do TMDB](https://developer.themoviedb.org/)

## Como rodar

Requisito: Node 20.12+ (testado com Node 24).


1. Crie uma conta gratuita no [TMDB](https://www.themoviedb.org/signup) e, em Configurações > API, copie o **API Read Access Token**.
2. Copie o arquivo de exemplo e preencha o token:
   ```bash
   cp .env.example .env.local
   # edite .env.local e defina TMDB_TOKEN=<seu token>
   ```
3. Instale as dependências e inicie:
   ```bash
   npm install
   npm run dev
   ```
4. Abra [http://localhost:3000](http://localhost:3000).

O token fica apenas no servidor (nunca usa o prefixo `NEXT_PUBLIC_`).

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run test` | Testes unitários e de componentes (Vitest) |
| `npm run test:e2e` | Smoke tests E2E (Playwright; exige `TMDB_TOKEN`, senão são pulados) |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`) |
| `npm run lint` | ESLint |

Na primeira execução dos testes E2E, rode `npx playwright install chromium`.

## Como foi construído

Projeto de estudo de desenvolvimento com [Claude Code](https://claude.com/claude-code): brainstorming, depois especificação, plano de implementação e execução por subagentes, com revisão a cada tarefa.

- [Especificação de design](docs/superpowers/specs/2026-10-23-catalogo-filmes-design.md)
- [Plano de implementação](docs/superpowers/plans/2026-10-23-catalogo-filmes.md)

## Atribuição

This product uses the TMDB API but is not endorsed or certified by TMDB.
Dados de streaming fornecidos por JustWatch.
