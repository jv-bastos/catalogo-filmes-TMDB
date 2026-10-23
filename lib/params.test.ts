import { describe, expect, it } from 'vitest';
import { parseMovieId, parsePage, parseProviders } from './params';

describe('parseProviders', () => {
  const allowed = [8, 119, 337];
  it('converte lista separada por vírgula, ordena e remove duplicatas', () => {
    expect(parseProviders('119,8,8', allowed)).toEqual([8, 119]);
  });
  it('descarta valores não numéricos e IDs desconhecidos', () => {
    expect(parseProviders('abc,8,999999', allowed)).toEqual([8]);
  });
  it('retorna vazio para undefined ou string vazia', () => {
    expect(parseProviders(undefined, allowed)).toEqual([]);
    expect(parseProviders('', allowed)).toEqual([]);
  });
  it('usa o primeiro valor quando recebe array', () => {
    expect(parseProviders(['337', '8'], allowed)).toEqual([337]);
  });
});

describe('parsePage', () => {
  it('aceita inteiros positivos', () => expect(parsePage('3')).toBe(3));
  it.each([undefined, '', 'abc', '0', '-3', '2.5'])('valor inválido %s vira 1', (v) => {
    expect(parsePage(v)).toBe(1);
  });
  it('usa o primeiro valor quando recebe array', () => expect(parsePage(['3', '5'])).toBe(3));
  it('limita a MAX_PAGES', () => expect(parsePage('600')).toBe(500));
});

describe('parseMovieId', () => {
  it('aceita só dígitos', () => expect(parseMovieId('438631')).toBe(438631));
  it.each(['abc', '0', '-1', '12abc', '1.5', ''])('rejeita %s', (v) => {
    expect(parseMovieId(v)).toBeNull();
  });
});
