import { describe, expect, it } from 'vitest';
import { catalogHref, searchHref } from './urls';

describe('catalogHref', () => {
  it('sem filtros e página 1 é a raiz', () => expect(catalogHref([])).toBe('/'));
  it('inclui providers separados por vírgula', () => expect(catalogHref([8, 119])).toBe('/?providers=8%2C119'));
  it('omite page=1 e inclui páginas maiores', () => {
    expect(catalogHref([8], 1)).toBe('/?providers=8');
    expect(catalogHref([8], 2)).toBe('/?providers=8&page=2');
    expect(catalogHref([], 3)).toBe('/?page=3');
  });
});

describe('searchHref', () => {
  it('codifica acentos e símbolos', () => {
    expect(searchHref('O Poderoso Chefão & Cia')).toBe('/busca?q=O+Poderoso+Chef%C3%A3o+%26+Cia');
  });
  it('inclui página maior que 1', () => expect(searchHref('duna', 2)).toBe('/busca?q=duna&page=2'));
});
