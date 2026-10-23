import { expect, test } from '@playwright/test';

test.skip(!process.env.TMDB_TOKEN, 'TMDB_TOKEN não definido — smoke tests pulados');

test('catálogo carrega pôsteres', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('list', { name: 'Filmes' }).getByRole('listitem').first()).toBeVisible();
});

test('filtrar por Netflix muda a URL e mantém resultados', async ({ page }) => {
  await page.goto('/');
  // Checkbox controlado: o estado só muda após a navegação, então .check() falharia; usamos click.
  await page.getByRole('checkbox', { name: 'Netflix' }).click();
  await expect(page).toHaveURL(/providers=8(&|$)/);
  await expect(page.getByRole('checkbox', { name: 'Netflix' })).toBeChecked();
  await expect(page.getByRole('list', { name: 'Filmes' }).getByRole('listitem').first()).toBeVisible();
});

test('buscar Duna e abrir detalhes mostra Onde assistir', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar filme' }).fill('Duna');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/busca\?q=Duna/);
  await page.getByRole('list', { name: 'Filmes' }).getByRole('link').first().click();
  await expect(page.getByRole('heading', { name: 'Onde assistir' })).toBeVisible();
});
