import { afterAll, describe, expect, test, vi } from 'vitest';

import randomInteger from './integer';

let randomSpy = vi.spyOn(global.Math, 'random');

describe('Generate a Random Integer', () => {
  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('exclusively returns integers', () => {
    randomSpy.mockReturnValueOnce(0.99);

    let output = randomInteger(0.5, 7.5);

    expect(Number.isInteger(output)).to.be.true;
  });

  test('supports negative integer ranges', () => {
    randomSpy.mockReturnValueOnce(0.01);

    let output = randomInteger(-10, -1);

    expect(output).to.eq(-10);
  });

  describe('Given a single argument has been passed', () => {
    test('the argument configures the MAX value', () => {
      randomSpy.mockReturnValueOnce(0.99);

      let output = randomInteger(6);

      expect(output).to.eq(6);
    });

    test('and the MIN value is automatically set to 0', () => {
      randomSpy.mockReturnValueOnce(0.01);

      let output = randomInteger(6);

      expect(output).to.eq(0);
    });
  });
});
