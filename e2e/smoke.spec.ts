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

test('grade ocupa 4 linhas completas de 5 filmes no desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const items = page.getByRole('list', { name: 'Filmes' }).getByRole('listitem');
  await expect(items).toHaveCount(20);
  const ys: number[] = [];
  for (const item of await items.all()) {
    const box = await item.boundingBox();
    ys.push(Math.round(box!.y));
  }
  const rows = new Map<number, number>();
  for (const y of ys) rows.set(y, (rows.get(y) ?? 0) + 1);
  expect([...rows.values()]).toEqual([5, 5, 5, 5]);
});

test('carrossel de destaques troca sozinho e aceita arrastar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Destaques' });
  await expect(carousel).toBeVisible();
  const dots = carousel.getByRole('button', { name: /Ir para o destaque/ });
  await expect(dots).toHaveCount(5);
  const dot = (n: number) => carousel.getByRole('button', { name: `Ir para o destaque ${n}` });

  // Troca sozinho (autoplay de 7s). Mouse fora do carrossel para não pausar.
  await page.mouse.move(0, 0);
  await expect(dot(2)).toHaveAttribute('aria-current', 'true', { timeout: 10_000 });

  // Arrasta da direita para a esquerda.
  const activeIndex = async () => {
    for (let n = 1; n <= 5; n++) {
      if ((await dot(n).getAttribute('aria-current')) === 'true') return n;
    }
    return 0;
  };
  const before = await activeIndex();
  const box = (await carousel.boundingBox())!;
  const y = box.y + box.height / 2;
  const startX = box.x + box.width * 0.8;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(startX - (box.width * 0.6 * i) / steps, y);
  }
  await page.mouse.up();
  await expect.poll(activeIndex).not.toBe(before);

  // Clique numa bolinha.
  await dot(4).click();
  await expect(dot(4)).toHaveAttribute('aria-current', 'true');
});
