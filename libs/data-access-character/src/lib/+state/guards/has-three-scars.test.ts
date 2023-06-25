import { describe, expect, test } from 'vitest';

import { CharacterMachineContext } from '../models';

import hasThreeScars from './has-three-scars';

describe('Guard – Has Three Scars', () => {
  test('returns TRUE when all of a character’s scars are filled', () => {
    let context = {
      scars: [
        { type: 'BODY', description: 'Limp' },
        { type: 'BRAIN', description: 'Fear of deep water' },
        { type: 'BRAIN', description: 'Jumpy at loud sounds' },
      ],
    } as CharacterMachineContext;

    expect(hasThreeScars({ context })).toEqual(true);
  });

  test('returns FALSE when character can add more scars', () => {
    let context = {
      scars: [
        { type: 'BODY', description: 'Limp' },
        { type: 'BRAIN', description: 'Fear of deep water' },
      ],
    } as CharacterMachineContext;

    expect(hasThreeScars({ context })).toEqual(false);
  });
});
