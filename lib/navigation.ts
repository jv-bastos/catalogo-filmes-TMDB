'use client';

// Local de entrada: a primeira página que o app viu nesta carga completa (pathname + search).
// Voltar só pode usar o histórico se o usuário estiver em outro local; na página de entrada,
// o histórico anterior pode ser de fora do app (ou da própria sessão, via botão voltar do navegador).
let entryLocation: string | null = null;

export function recordLocation(location: string): void {
  // Idempotente: só o primeiro valor conta (seguro com o efeito duplo do Strict Mode).
  if (entryLocation === null) entryLocation = location;
}

export function hasInAppHistory(): boolean {
  if (entryLocation === null) return false;
  return `${window.location.pathname}${window.location.search}` !== entryLocation;
}
