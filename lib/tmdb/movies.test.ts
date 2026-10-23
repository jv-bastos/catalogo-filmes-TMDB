import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../test/msw-server";
import { TMDB_BASE_URL } from "./client";
import {
  discoverMovies,
  getMovieDetails,
  getProviders,
  searchMovies,
} from "./movies";

function capture(path: string, body: unknown) {
  const captured: { url: URL } = { url: new URL(TMDB_BASE_URL) };
  server.use(
    http.get(`${TMDB_BASE_URL}${path}`, ({ request }) => {
      captured.url = new URL(request.url);
      return HttpResponse.json(body as Record<string, unknown>);
    }),
  );
  return captured;
}

const SEM_BR_ID = 999;

describe("getProviders", () => {
  it("ordena por prioridade no BR e mantém 12", async () => {
    const priorities = [5, 14, 3, 9, 1, 12, 7, 2, 13, 4, 11, 6, 8];
    const results: {
      provider_id: number;
      provider_name: string;
      logo_path: string;
      display_priorities: Record<string, number>;
    }[] = priorities.map((p, i) => ({
      provider_id: i === 4 ? 8 : 100 + i,
      provider_name: i === 4 ? "Netflix" : `P${i}`,
      logo_path: i === 4 ? "/netflix.png" : `/p${i}.png`,
      display_priorities: { BR: p, US: 1 },
    }));
    results.push({
      provider_id: SEM_BR_ID,
      provider_name: "SemBR",
      logo_path: "/x.png",
      display_priorities: { US: 1 },
    });
    const captured = capture("/watch/providers/movie", { results });
    const providers = await getProviders();
    expect(captured.url.searchParams.get("watch_region")).toBe("BR");
    expect(providers).toHaveLength(12);
    expect(providers[0]).toEqual({
      id: 8,
      name: "Netflix",
      logoPath: "/netflix.png",
    });
    expect(providers.map((p) => p.id)).not.toContain(SEM_BR_ID);
  });
});

const page = {
  page: 2,
  total_pages: 9000,
  total_results: 180000,
  results: [
    {
      id: 1,
      title: "Duna",
      poster_path: "/duna.jpg",
      release_date: "2021-10-22",
    },
    { id: 2, title: "Sem data", poster_path: null, release_date: "" },
  ],
};

describe("discoverMovies", () => {
  it("envia filtros de região, assinatura e provedores com |", async () => {
    const captured = capture("/discover/movie", page);
    const result = await discoverMovies({ providers: [8, 119], page: 2 });
    const sp = captured.url.searchParams;
    expect(sp.get("watch_region")).toBe("BR");
    expect(sp.get("with_watch_monetization_types")).toBe("flatrate");
    expect(sp.get("sort_by")).toBe("popularity.desc");
    expect(sp.get("with_watch_providers")).toBe("8|119");
    expect(sp.get("page")).toBe("2");
    expect(result.movies[0]).toEqual({
      id: 1,
      title: "Duna",
      posterPath: "/duna.jpg",
      releaseYear: "2021",
    });
  });

  it("omite with_watch_providers quando a lista é vazia", async () => {
    const captured = capture("/discover/movie", page);
    await discoverMovies({ providers: [], page: 1 });
    expect(captured.url.searchParams.has("with_watch_providers")).toBe(false);
  });

  it("limita totalPages a 500 e trata release_date vazio", async () => {
    capture("/discover/movie", page);
    const result = await discoverMovies({ providers: [], page: 2 });
    expect(result.totalPages).toBe(500);
    expect(result.page).toBe(2);
    expect(result.movies[1]).toMatchObject({
      releaseYear: null,
      posterPath: null,
    });
  });
});

describe("searchMovies", () => {
  it("envia a busca com acentos e include_adult=false", async () => {
    const captured = capture("/search/movie", page);
    await searchMovies({ query: "O Poderoso Chefão & Cia", page: 1 });
    expect(captured.url.searchParams.get("query")).toBe(
      "O Poderoso Chefão & Cia",
    );
    expect(captured.url.searchParams.get("include_adult")).toBe("false");
    expect(captured.url.searchParams.get("page")).toBe("1");
  });
});

describe("getMovieDetails", () => {
  it("pede credits e watch/providers numa única chamada e mapeia tudo", async () => {
    const captured = capture("/movie/438631", {
      id: 438631,
      title: "Duna",
      poster_path: "/duna.jpg",
      release_date: "2021-10-22",
      overview: "Uma sinopse.",
      runtime: 155,
      genres: [
        { id: 878, name: "Ficção científica" },
        { id: 12, name: "Aventura" },
      ],
      credits: {
        cast: Array.from({ length: 15 }, (_, i) => ({
          id: i,
          name: `Ator ${i}`,
          character: `Personagem ${i}`,
        })),
      },
      "watch/providers": {
        results: {
          BR: {
            link: "https://www.themoviedb.org/movie/438631/watch?locale=BR",
            flatrate: [
              {
                provider_id: 337,
                provider_name: "Disney Plus",
                logo_path: "/d.png",
                display_priority: 1,
              },
            ],
          },
        },
      },
    });
    const d = await getMovieDetails(438631);
    expect(captured.url.pathname).toBe("/3/movie/438631");
    expect(captured.url.searchParams.get("append_to_response")).toBe(
      "credits,watch/providers",
    );
    expect(d!.cast).toHaveLength(10);
    expect(d!.cast[0]).toEqual({
      id: 0,
      name: "Ator 0",
      character: "Personagem 0",
    });
    expect(d!.watch).toEqual({
      link: "https://www.themoviedb.org/movie/438631/watch?locale=BR",
      flatrate: [{ id: 337, name: "Disney Plus", logoPath: "/d.png" }],
      rent: [],
      buy: [],
    });
    expect(d!.genres).toEqual(["Ficção científica", "Aventura"]);
    expect(d).toMatchObject({
      overview: "Uma sinopse.",
      runtime: 155,
      releaseYear: "2021",
    });
  });

  it("dados faltando: sinopse vazia, runtime 0, sem BR, sem elenco", async () => {
    capture("/movie/5", {
      id: 5,
      title: "Obscuro",
      poster_path: null,
      release_date: "",
      overview: "",
      runtime: 0,
      genres: [],
      "watch/providers": { results: { US: { flatrate: [] } } },
    });
    const d = await getMovieDetails(5);
    expect(d).toMatchObject({
      overview: null,
      runtime: null,
      watch: null,
      cast: [],
      posterPath: null,
      releaseYear: null,
    });
  });

  it("retorna null em 404", async () => {
    server.use(
      http.get(
        `${TMDB_BASE_URL}/movie/404`,
        () => new HttpResponse(null, { status: 404 }),
      ),
    );
    expect(await getMovieDetails(404)).toBeNull();
  });

  it("propaga TmdbError 500", async () => {
    server.use(
      http.get(
        `${TMDB_BASE_URL}/movie/1`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    await expect(getMovieDetails(1)).rejects.toMatchObject({ status: 500 });
  });
});
