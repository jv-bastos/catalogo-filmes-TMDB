'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { markInAppNavigation } from '@/lib/navigation';

export function NavigationTracker() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const location = `${pathname}?${search}`;
  // Guarda o local anterior (não um "já rodei"): o Strict Mode executa o efeito duas vezes no mount.
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (previous.current !== null && previous.current !== location) markInAppNavigation();
    previous.current = location;
  }, [location]);

  return null;
}
