import Link from 'next/link';
import { FeaturedCarousel } from '@/components/FeaturedCarousel';
import { MovieGrid } from '@/components/MovieGrid';
import { Pagination } from '@/components/Pagination';
import { ProviderFilter } from '@/components/ProviderFilter';
import { pickFeatured } from '@/lib/featured';
import { parsePage, parseProviders } from '@/lib/params';
import { discoverMovies, getProviders } from '@/lib/tmdb/movies';
import { catalogHref } from '@/lib/urls';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ providers?: string | string[]; page?: string | string[] }>;
}) {
  const sp = await searchParams;
  const providers = await getProviders();
  const allowed = providers.map((p) => p.id);
  const selected = parseProviders(sp.providers, allowed);
  const page = parsePage(sp.page);
  const result = await discoverMovies({ providers: selected.length ? selected : allowed, page });
  const featured = page === 1 ? pickFeatured(result.movies) : [];

  return (
    <div className="flex flex-col gap-8">
      {featured.length > 0 && <FeaturedCarousel movies={featured} />}
      <div className="flex flex-col gap-5">
        <h1 className="title-display text-3xl sm:text-4xl">Filmes em streaming no Brasil</h1>
        <ProviderFilter providers={providers} selected={selected} />
      </div>
      {result.movies.length > 0 ? (
        <MovieGrid movies={result.movies} />
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-linha py-16 text-center">
          <p className="text-lg font-semibold">Nenhum filme encontrado nesses streamings</p>
          <Link href="/" className="btn-ghost">
            Limpar filtros
          </Link>
        </div>
      )}
      <Pagination page={result.page} totalPages={result.totalPages} hrefFor={(p) => catalogHref(selected, p)} />
    </div>
  );
}
