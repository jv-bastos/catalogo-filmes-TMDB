import type { RawVideo, Trailer } from './types';

const TYPE_RANK: Record<string, number> = { Trailer: 0, Teaser: 1 };
const LANGUAGE_RANK: Record<string, number> = { pt: 0, en: 1 };

function time(v: RawVideo): number {
  const t = v.published_at ? Date.parse(v.published_at) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

// Ordem de preferência: tipo (Trailer antes de Teaser), idioma (pt, en, outros),
// oficial, mais recente.
export function pickTrailer(videos: RawVideo[]): Trailer | null {
  const [best] = videos
    .filter((v) => v.site === 'YouTube' && v.type in TYPE_RANK)
    .sort(
      (a, b) =>
        TYPE_RANK[a.type] - TYPE_RANK[b.type] ||
        (LANGUAGE_RANK[a.iso_639_1] ?? 2) - (LANGUAGE_RANK[b.iso_639_1] ?? 2) ||
        Number(b.official) - Number(a.official) ||
        time(b) - time(a),
    );
  return best ? { key: best.key, name: best.name } : null;
}
