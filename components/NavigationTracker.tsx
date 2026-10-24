'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { recordLocation } from '@/lib/navigation';

export function NavigationTracker() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const location = search ? `${pathname}?${search}` : pathname;

  // Só o primeiro local registrado vira a entrada; re-execuções (Strict Mode) não mudam nada.
  useEffect(() => {
    recordLocation(location);
  }, [location]);

  return null;
}
