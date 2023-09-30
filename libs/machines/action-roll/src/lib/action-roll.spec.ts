import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { createActor, type Actor } from 'xstate';
import actionRollMachine from './action-roll.machine';

let testActor: Actor<typeof actionRollMachine>;

describe('Action Roll Machine', () => {
  test('rolls can be canceled at any time', () => {
    let mockSendOutcomeToGameLog = vi.fn();
    testActor = createActor(
      actionRollMachine.provide({
        actions: {
          sendOutcomeToGameLog: mockSendOutcomeToGameLog,
        },
      }),
      {
        input: { baseRating: 1, drive: 1, gilded: 1 },
      }
    );

    testActor.start();
    expect(testActor.getSnapshot().value).toEqual('Preparing');

    testActor.send({ type: 'ROLL_DICE' });
    expect(testActor.getSnapshot().value).toEqual('Waiting on Selection');

    testActor.send({ type: 'CANCEL' });
    expect(testActor.getSnapshot().value).toEqual('Roll Canceled');
    testActor.stop();
  });

  describe('Machine Inputs', () => {
    test('Rating, drive, and gilded can be customized', () => {
      testActor = createActor(actionRollMachine, {
        input: {
          baseRating: 1,
          drive: 1,
          gilded: 1,
        },
      });

      testActor.start();

      let { baseRating, drive, gilded } = testActor.getSnapshot().context;

      expect(baseRating).toEqual(1);
      expect(drive).toEqual(1);
      expect(gilded).toEqual(1);

      testActor.stop();
    });

    test('If omitted, inputs will default to zero (0)', () => {
      testActor = createActor(actionRollMachine);

      testActor.start();

      let { baseRating, drive, gilded } = testActor.getSnapshot().context;

      expect(baseRating).toEqual(0);
      expect(drive).toEqual(0);
      expect(gilded).toEqual(0);

      testActor.stop();
    });

    test('Each action can have a rating between 0–3', () => {
      let expectedError =
        'Invalid Input (baseRating): Each action can have a rating 0-3.';

      testActor = createActor(actionRollMachine, { input: { baseRating: -1 } });
      expect(() => testActor.start()).toThrowError(expectedError);

      testActor.start();

      let current = testActor.getSnapshot();

      expect(current.value).toEqual('Error');
      expect(current.status).toEqual('done');

      testActor = createActor(actionRollMachine, { input: { baseRating: 4 } });
      expect(() => testActor.start()).toThrowError(expectedError);

      testActor.start();

      current = testActor.getSnapshot();

      expect(current.value).toEqual('Error');
      expect(current.status).toEqual('done');
    });

    test('Each player can have 0-9 drive points', () => {
      let expectedError =
        'Invalid Input (drive): Each player can have 0-9 drive points per ability.';

      testActor = createActor(actionRollMachine, { input: { drive: -1 } });
      expect(() => testActor.start()).toThrowError(expectedError);

      testActor.start();

      let current = testActor.getSnapshot();

      expect(current.value).toEqual('Error');
      expect(current.status).toEqual('done');

      testActor = createActor(actionRollMachine, { input: { drive: 10 } });
      expect(() => testActor.start()).toThrowError(expectedError);

      testActor.start();

      current = testActor.getSnapshot();

      expect(current.value).toEqual('Error');
      expect(current.status).toEqual('done');
    });

    test('Gilded input cannot be negative', () => {
      let expectedError =
        'Invalid Input (gilded): The gilded input cannot be negative.';

      testActor = createActor(actionRollMachine, { input: { gilded: -1 } });
      expect(() => testActor.start()).toThrowError(expectedError);

      testActor.start();

      let current = testActor.getSnapshot();

      expect(current.value).toEqual('Error');
      expect(current.status).toEqual('done');
    });
  });

  describe('Preparing to roll', () => {
    beforeEach(() => {
      testActor = createActor(actionRollMachine, {
        input: {
          baseRating: 2,
          drive: 1,
          gilded: 1,
        },
      });
      testActor.start();
    });

    afterEach(() => {
      testActor.stop();
    });

    test('input values should affect the size of dice pool and number of gilded dice', () => {
      let { value, context } = testActor.getSnapshot();

      expect(value).toEqual('Preparing');

      expect(context.dicePool.length).toEqual(3);
      expect(context.dicePool.filter((die) => die.result).length).toEqual(0);
      expect(context.dicePool.filter((die) => die.isGilded).length).toEqual(1);
    });

    test('adding drive increases the size of the dice pool', () => {
      let dicePool = () => testActor.getSnapshot().context.dicePool;

      expect(dicePool().length).toEqual(3);

      testActor.send({ type: 'ADD_DRIVE' });
      expect(dicePool().length).toEqual(4);

      testActor.send({ type: 'REMOVE_DRIVE' });
      expect(dicePool().length).toEqual(3);
    });

    test('the dice pool can never have more than six (6) dice', () => {
      let dicePool = () => testActor.getSnapshot().context.dicePool;

      expect(dicePool().length).toEqual(3);

      testActor.send({ type: 'ADD_DRIVE' });
      expect(dicePool().length).toEqual(4);

      testActor.send({ type: 'ADD_DRIVE' });
      expect(dicePool().length).toEqual(5);

      testActor.send({ type: 'ADD_DRIVE' });
      expect(dicePool().length).toEqual(6);

      testActor.send({ type: 'ADD_DRIVE' });
      expect(dicePool().length).toEqual(6);
    });

    test('the dice pool can have multiple gilded dice', () => {
      let dicePool = () => testActor.getSnapshot().context.dicePool;
      let gildedDice = () => dicePool().filter((die) => die.isGilded);

      expect(gildedDice().length).toEqual(1);

      testActor.send({ type: 'ADD_GILDED' });
      expect(gildedDice().length).toEqual(2);

      testActor.send({ type: 'REMOVE_GILDED' });
      expect(gildedDice().length).toEqual(1);
    });

    test('the entire dice pool can be gilded', () => {
      let dicePool = () => testActor.getSnapshot().context.dicePool;
      let gildedDice = () => dicePool().filter((die) => die.isGilded);

      expect(dicePool().length).toEqual(3);
      expect(gildedDice().length).toEqual(1);

      testActor.send({ type: 'ADD_GILDED' });
      expect(gildedDice().length).toEqual(2);

      testActor.send({ type: 'ADD_GILDED' });
      expect(gildedDice().length).toEqual(3);

      testActor.send({ type: 'ADD_GILDED' });
      expect(gildedDice().length).toEqual(3);
      expect(testActor.getSnapshot().context.gilded).toEqual(3);
    });
  });

  describe('Standard rolls', () => {
    let STANDARD_CASES = [
      {
        mockRand: [0.99, 0.99],
        expectedResults: [6, 6],
        expectedOutcome: 'critical-success',
      },
      {
        mockRand: [0.01, 0.99],
        expectedResults: [1, 6],
        expectedOutcome: 'success',
      },
      {
        mockRand: [0.01, 0.82],
        expectedResults: [1, 5],
        expectedOutcome: 'mixed-success',
      },
      {
        mockRand: [0.01, 0.65],
        expectedResults: [1, 4],
        expectedOutcome: 'mixed-success',
      },
      {
        mockRand: [0.01, 0.49],
        expectedResults: [1, 3],
        expectedOutcome: 'failure',
      },
      {
        mockRand: [0.01, 0.32],
        expectedResults: [1, 2],
        expectedOutcome: 'failure',
      },
      {
        mockRand: [0.01, 0.01],
        expectedResults: [1, 1],
        expectedOutcome: 'failure',
      },
    ];

    test.each(STANDARD_CASES)(
      'when you roll $expectedResults, the action is a $expectedOutcome',
      ({ mockRand, expectedResults, expectedOutcome }) => {
        let randomSpy = vi.spyOn(global.Math, 'random');
        mockRand.forEach((n) => {
          randomSpy.mockReturnValueOnce(n);
        });

        let mockSendOutcomeToGameLog = vi.fn(({ event }) => event.output);
        testActor = createActor(
          actionRollMachine.provide({
            actions: {
              sendOutcomeToGameLog: mockSendOutcomeToGameLog,
            },
          }),
          {
            input: { baseRating: 1, drive: 1 },
          }
        );

        testActor.start();
        testActor.send({ type: 'ROLL_DICE' });

        let current = testActor.getSnapshot();
        expect(current.context.dicePool.map((die) => die.result)).toEqual(
          expectedResults
        );

        expect(current.status).toEqual('done');
        expect(current.output?.outcome).toEqual(expectedOutcome);
        expect(current.output?.rolled).toEqual(expect.any(Array));
        expect(current.output?.selected).toEqual(expect.any(Number));
        // TODO: Restore or remove when game logging architectures has been settled
        // expect(mockSendOutcomeToGameLog).toHaveReturnedWith(expectedOutcome);

        testActor.stop();
        vi.restoreAllMocks();
      }
    );
  });

  describe('Disadvantage rolls', () => {
    test(`when you roll [6,1] with disadvantage, the action is a 'Failure'`, () => {
      let randomSpy = vi.spyOn(global.Math, 'random');
      [0.99, 0.01].forEach((n) => {
        randomSpy.mockReturnValueOnce(n);
      });

      testActor = createActor(actionRollMachine, {
        input: { baseRating: 0, drive: 0 },
      });

      testActor.start();
      testActor.send({ type: 'ROLL_DICE' });

      let current = testActor.getSnapshot();

      expect(current.status).toEqual('done');
      expect(current.output?.outcome).toEqual('failure');
      expect(current.output?.rolled.map((die) => die.result)).toEqual([6, 1]);
      expect(current.output?.selected).toEqual(1);

      testActor.stop();
      vi.restoreAllMocks();
    });

    test(`the 'Critical Success' outcome is NOT possible, even with [6,6]`, () => {
      let randomSpy = vi.spyOn(global.Math, 'random');
      [0.99, 0.99].forEach((n) => {
        randomSpy.mockReturnValueOnce(n);
      });

      testActor = createActor(actionRollMachine, {
        input: { baseRating: 0, drive: 0 },
      });

      testActor.start();

      testActor.send({ type: 'ROLL_DICE' });

      let current = testActor.getSnapshot();

      expect(current.status).toEqual('done');
      expect(current.output?.outcome).toEqual('success');
      expect(current.output?.rolled.map((die) => die.result)).toEqual([6, 6]);
      expect(current.output?.selected).toEqual(0);

      testActor.stop();
      vi.restoreAllMocks();
    });
  });

  describe('Gilded rolls', () => {
    test('require the player to MANUALLY select their result', () => {
      let randomSpy = vi.spyOn(global.Math, 'random');
      [0.01, 0.99].forEach((n) => {
        randomSpy.mockReturnValueOnce(n);
      });

      testActor = createActor(actionRollMachine, {
        input: { baseRating: 1, drive: 1, gilded: 1 },
      });

      testActor.start();
      testActor.send({ type: 'ROLL_DICE' });

      let current = testActor.getSnapshot();
      expect(current.value).toEqual('Waiting on Selection');
      expect(current.context.dicePool).toEqual([
        {
          isGilded: true,
          result: 1,
        },
        {
          isGilded: false,
          result: 6,
        },
      ]);
    });

    test('if the player selects a gilded die, they recover a drive point', () => {
      let randomSpy = vi.spyOn(global.Math, 'random');
      [0.01, 0.99].forEach((n) => {
        randomSpy.mockReturnValueOnce(n);
      });

      let mockAction = vi.fn();
      testActor = createActor(
        actionRollMachine.provide({
          actions: {
            maybeRecoverDrive: mockAction,
          },
        }),
        {
          input: { baseRating: 1, drive: 1, gilded: 1 },
        }
      );

      testActor.start();
      testActor.send({ type: 'ROLL_DICE' });
      testActor.send({ type: 'SELECT_FINAL_RESULT', selected: 0 });

      let current = testActor.getSnapshot();

      expect(mockAction).toHaveBeenCalledOnce();
      expect(current.status).toEqual('done');
      expect(current.output?.outcome).toEqual('failure');
    });
  });
});
