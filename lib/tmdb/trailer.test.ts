import { describe, expect, it } from 'vitest';
import { pickTrailer } from './trailer';
import type { RawVideo } from './types';

const video = (over: Partial<RawVideo>): RawVideo => ({
  key: 'k',
  site: 'YouTube',
  type: 'Trailer',
  iso_639_1: 'pt',
  official: true,
  published_at: '2021-01-01T00:00:00.000Z',
  name: 'Trailer',
  ...over,
});

describe('pickTrailer', () => {
  it('trailer em português vence trailer em inglês', () => {
    const t = pickTrailer([video({ key: 'en', iso_639_1: 'en' }), video({ key: 'pt', iso_639_1: 'pt' })]);
    expect(t?.key).toBe('pt');
  });

  it('trailer em inglês vence teaser em português', () => {
    const t = pickTrailer([
      video({ key: 'pt-teaser', type: 'Teaser', iso_639_1: 'pt' }),
      video({ key: 'en-trailer', iso_639_1: 'en' }),
    ]);
    expect(t?.key).toBe('en-trailer');
  });

  it('usa teaser quando não há trailer', () => {
    expect(pickTrailer([video({ key: 'teaser', type: 'Teaser' })])).toEqual({ key: 'teaser', name: 'Trailer' });
  });

  it('ignora Vimeo e tipos como Featurette e Clip', () => {
    const t = pickTrailer([
      video({ key: 'vimeo', site: 'Vimeo' }),
      video({ key: 'feat', type: 'Featurette' }),
      video({ key: 'clip', type: 'Clip' }),
      video({ key: 'ok', iso_639_1: 'fr' }),
    ]);
    expect(t?.key).toBe('ok');
  });

  it('oficial vence não oficial no empate', () => {
    const t = pickTrailer([video({ key: 'fan', official: false }), video({ key: 'oficial', official: true })]);
    expect(t?.key).toBe('oficial');
  });

  it('o mais recente vence no empate restante', () => {
    const t = pickTrailer([
      video({ key: 'velho', published_at: '2020-01-01T00:00:00.000Z' }),
      video({ key: 'novo', published_at: '2022-01-01T00:00:00.000Z' }),
    ]);
    expect(t?.key).toBe('novo');
  });

  it('lista vazia ou sem candidatos retorna null', () => {
    expect(pickTrailer([])).toBeNull();
    expect(pickTrailer([video({ site: 'Vimeo' }), video({ type: 'Clip' })])).toBeNull();
  });
});
