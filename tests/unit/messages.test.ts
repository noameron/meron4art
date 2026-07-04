import { describe, expect, it } from 'vitest';
import en from '@/messages/en.json';
import he from '@/messages/he.json';

type Tree = { [key: string]: string | Tree };

function keyPaths(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [path] : keyPaths(value, path);
  });
}

describe('message catalogs', () => {
  it('en and he define exactly the same keys', () => {
    expect(keyPaths(he as Tree).sort()).toEqual(keyPaths(en as Tree).sort());
  });

  it('no message value is empty', () => {
    for (const catalog of [en, he]) {
      for (const path of keyPaths(catalog as Tree)) {
        const value = path
          .split('.')
          .reduce<Tree | string>(
            (node, key) => (node as Tree)[key],
            catalog as Tree,
          );
        expect(value, `empty message at ${path}`).not.toBe('');
      }
    }
  });
});
