import { afterAll, describe, expect, test } from 'vitest';

import roll from './roll';

let randomSpy = vi.spyOn(global.Math, 'random');

describe('Simulate six-sided dice rolls', () => {
  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('accepts standard notation (i.e. `AdX`)', () => {
    expect(roll('d20')).to.be.a('number');
    expect(roll('2d20')).to.be.an('array');
  });

  test('invalid notation strings will throw an error', () => {
    expect(() => roll('foo')).to.throw(
      'Invalid dice notation. Please use the standard `AdX` format.'
    );
  });

  test('the lowest value is ALWAYS 1', () => {
    randomSpy.mockReturnValueOnce(0.01);

    expect(roll('d6')).to.eq(1);
  });

  test('the highest value matches the number of faces', () => {
    randomSpy.mockReturnValue(0.99);

    expect(roll('d6')).to.eq(6);
    expect(roll('d20')).to.eq(20);
  });
});
