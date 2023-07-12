import { describe, expect, test } from 'vitest';

import { CharacterMachineContext, CharacterMachineEvents } from '../models';

import hasThreeMarks from './can-add-mark';

describe('Guard – Can Add Mark', () => {
  test('returns TRUE when a track has less than three (3) marks AND event type matches "ADD_MARK"', () => {
    let context = {
      marks: {
        body: 2,
        brain: 0,
        bleed: 0,
      },
    } as CharacterMachineContext;

    let event: CharacterMachineEvents = {
      type: 'ADD_MARK',
      damageType: 'BODY',
    };

    expect(hasThreeMarks({ context, event })).toEqual(true);
  });

  test('returns FALSE if damageType is full', () => {
    let context = {
      marks: {
        body: 3,
        brain: 0,
        bleed: 0,
      },
    } as CharacterMachineContext;

    let event: CharacterMachineEvents = {
      type: 'ADD_MARK',
      damageType: 'BODY',
    };

    expect(hasThreeMarks({ context, event })).toEqual(false);
  });

  test('returns FALSE if event type is NOT "ADD_MARK"', () => {
    let context = {
      marks: {
        body: 3,
        brain: 0,
        bleed: 0,
      },
    } as CharacterMachineContext;

    let event: CharacterMachineEvents = {
      type: 'ADD_SCAR',
      damageType: 'BODY',
    };

    expect(hasThreeMarks({ context, event })).toEqual(false);
  });
});
