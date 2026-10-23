export const MAX_PAGES = 500;

function first(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

export function parseProviders(raw: string | string[] | undefined, allowedIds: number[]): number[] {
  const value = first(raw);
  if (!value) return [];
  const ids = value
    .split(',')
    .filter((part) => /^\d+$/.test(part))
    .map(Number)
    .filter((id) => allowedIds.includes(id));
  return [...new Set(ids)].sort((a, b) => a - b);
}

export function parsePage(raw: string | string[] | undefined): number {
  const value = first(raw);
  if (!value || !/^\d+$/.test(value)) return 1;
  const page = Number(value);
  if (page < 1) return 1;
  return Math.min(page, MAX_PAGES);
}

export function parseMovieId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
