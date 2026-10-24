'use client';

import { useRef, type PointerEvent, type ReactNode } from 'react';

const DRAG_THRESHOLD = 5;

type DragState = { startX: number; startScrollLeft: number; moved: boolean };

export function DragScroll({
  className = '',
  children,
  'aria-label': ariaLabel,
}: {
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const drag = useRef<DragState | null>(null);

  function onPointerDown(e: PointerEvent<HTMLUListElement>) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !ref.current) return;
    drag.current = { startX: e.clientX, startScrollLeft: ref.current.scrollLeft, moved: false };
    ref.current.setPointerCapture(e.pointerId);
    ref.current.dataset.dragging = 'true';
  }

  function onPointerMove(e: PointerEvent<HTMLUListElement>) {
    const d = drag.current;
    if (!d || e.pointerType !== 'mouse' || !ref.current) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > DRAG_THRESHOLD) d.moved = true;
    ref.current.scrollLeft = d.startScrollLeft - dx;
  }

  function endDrag(e: PointerEvent<HTMLUListElement>) {
    if (!drag.current || e.pointerType !== 'mouse' || !ref.current) return;
    const el = ref.current;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    delete el.dataset.dragging;
    if (drag.current.moved) {
      // Cancela o clique que o navegador dispara logo após o arraste.
      const swallow = (ev: Event) => ev.stopPropagation();
      el.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => el.removeEventListener('click', swallow, { capture: true }), 0);
    }
    drag.current = null;
  }

  return (
    <ul
      ref={ref}
      role="list"
      tabIndex={0}
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`cursor-grab data-[dragging=true]:cursor-grabbing data-[dragging=true]:select-none ${className}`}
    >
      {children}
    </ul>
  );
}
