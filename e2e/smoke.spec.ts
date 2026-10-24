import { expect, test } from '@playwright/test';

test.skip(!process.env.TMDB_TOKEN, 'TMDB_TOKEN não definido — smoke tests pulados');

test('catálogo carrega pôsteres', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('list', { name: 'Filmes' }).getByRole('listitem').first()).toBeVisible();
});

test('filtrar por Netflix muda a URL e mantém resultados', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('checkbox', { name: 'Netflix' }).click();
  await expect(page).toHaveURL(/providers=8(&|$)/);
  await expect(page.getByRole('checkbox', { name: 'Netflix' })).toBeChecked();
  await expect(page.getByRole('list', { name: 'Filmes' }).getByRole('listitem').first()).toBeVisible();
});

test('filtro bloqueia a tela enquanto carrega e acumula seleções', async ({ page }) => {
  // Atrasa a resposta RSC da navegação para observar o estado "carregando".
  await page.route(/_rsc=/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });
  await page.goto('/');
  const netflix = page.getByRole('checkbox', { name: 'Netflix' });
  const prime = page.getByRole('checkbox', { name: 'Amazon Prime Video' });
  const overlay = page.getByText('Carregando filmes…');

  await netflix.click();
  // Antes da navegação terminar: marcado na hora, tela bloqueada, demais desabilitados.
  await expect(netflix).toBeChecked();
  await expect(overlay).toBeVisible();
  await expect(prime).toBeDisabled();

  await expect(overlay).toBeHidden();
  await expect(page).toHaveURL(/providers=8(&|$)/);
  await expect(prime).toBeEnabled();
  await expect(netflix).toBeFocused();

  await prime.click();
  await expect(page).toHaveURL(/providers=8(%2C|,)119(&|$)/);
  await expect(overlay).toBeHidden();
  await expect(netflix).toBeChecked();
  await expect(prime).toBeChecked();
});

test('buscar Duna e abrir detalhes mostra Onde assistir', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar filme' }).fill('Duna');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/busca\?q=Duna/);
  await page.getByRole('list', { name: 'Filmes' }).getByRole('link').first().click();
  await expect(page.getByRole('heading', { name: 'Onde assistir' })).toBeVisible();
});
