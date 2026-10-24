const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export function posterUrl(path: string | null, size: 'w342' | 'w500' = 'w342'): string | null {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

export function logoUrl(path: string | null): string | null {
  return path ? `${IMAGE_BASE_URL}/w92${path}` : null;
}

export function backdropUrl(path: string | null): string | null {
  return path ? `${IMAGE_BASE_URL}/w1280${path}` : null;
}

export function profileUrl(path: string | null): string | null {
  return path ? `${IMAGE_BASE_URL}/w185${path}` : null;
}
