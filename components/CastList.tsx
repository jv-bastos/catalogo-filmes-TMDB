import Image from 'next/image';
import { profileUrl } from '@/lib/tmdb/images';
import type { CastMember } from '@/lib/tmdb/types';

function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function CastList({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="title-display text-3xl">Elenco</h2>
      <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        {cast.map((c) => {
          const photo = profileUrl(c.profilePath);
          return (
            <li key={c.id} className="flex w-28 shrink-0 flex-col gap-2 sm:w-32">
              {photo ? (
                <Image
                  src={photo}
                  alt=""
                  width={185}
                  height={278}
                  className="aspect-[3/4] w-full rounded-xl object-cover ring-1 ring-white/10"
                />
              ) : (
                <span
                  aria-hidden
                  className="title-display grid aspect-[3/4] w-full place-items-center rounded-xl bg-palco-alto text-3xl text-suave"
                >
                  {initials(c.name)}
                </span>
              )}
              <div className="text-sm leading-snug">
                <p className="font-semibold">{c.name}</p>
                <p className="text-suave">{c.character}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
