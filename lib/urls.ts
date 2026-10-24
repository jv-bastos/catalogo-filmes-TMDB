function withQuery(path: string, params: URLSearchParams): string {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function catalogHref(providers: number[], page = 1): string {
  const params = new URLSearchParams();
  if (providers.length > 0) params.set('providers', providers.join(','));
  if (page > 1) params.set('page', String(page));
  return withQuery('/', params);
}

export function searchHref(query: string, page = 1): string {
  const params = new URLSearchParams({ q: query });
  if (page > 1) params.set('page', String(page));
  return withQuery('/busca', params);
}
