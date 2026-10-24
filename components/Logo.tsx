// Marca do Sessão: um ingresso de cinema (os recortes nas laterais) com um play no meio.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sessao-gradiente" x1="2" y1="4" x2="38" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset="0.55" stopColor="#ff2d87" />
          <stop offset="1" stopColor="#ffb020" />
        </linearGradient>
        <mask id="sessao-recorte">
          <rect width="40" height="40" fill="#fff" />
          <circle cx="2" cy="20" r="4.5" fill="#000" />
          <circle cx="38" cy="20" r="4.5" fill="#000" />
        </mask>
      </defs>
      <rect x="2" y="5" width="36" height="30" rx="8" fill="url(#sessao-gradiente)" mask="url(#sessao-recorte)" />
      <path d="M16.5 14.2v11.6a1 1 0 0 0 1.52.85l9.3-5.8a1 1 0 0 0 0-1.7l-9.3-5.8a1 1 0 0 0-1.52.85Z" fill="#fff" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className="size-10 shrink-0 sm:size-12" />
      <span className="title-display text-[2rem] leading-none tracking-tight sm:text-[2.6rem]">sessão</span>
    </span>
  );
}
