import type { CastMember } from '@/lib/tmdb/types';

export function CastList({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2 text-xl font-semibold">Elenco</h2>
      <ul className="space-y-1 text-sm">
        {cast.map((c) => (
          <li key={c.id}>
            {c.name} — {c.character}
          </li>
        ))}
      </ul>
    </section>
  );
}
