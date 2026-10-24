'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import { hasInAppHistory } from '@/lib/navigation';
import { ArrowLeftIcon } from './icons';

export function BackButton() {
  const router = useRouter();

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!hasInAppHistory()) return;
    event.preventDefault();
    router.back();
  }

  return (
    <Link href="/" onClick={onClick} className="btn-ghost self-start">
      <ArrowLeftIcon className="size-4" />
      Voltar
    </Link>
  );
}
