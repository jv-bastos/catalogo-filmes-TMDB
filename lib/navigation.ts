'use client';

// Contador em memória de navegações feitas dentro do app (zera a cada carga completa da página).
let inAppNavigations = 0;

export function markInAppNavigation(): void {
  inAppNavigations += 1;
}

export function hasInAppHistory(): boolean {
  return inAppNavigations > 0;
}
