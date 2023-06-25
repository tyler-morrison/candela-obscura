import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import { interpret, InterpreterFrom } from 'xstate';

import { Scar } from './models';
import characterMachine from './character-machine';

let testActor: InterpreterFrom<typeof characterMachine>;

describe('Character Sheet Machine', () => {
  beforeEach(() => {
    testActor.start();
  });

  afterEach(() => {
    testActor.stop();
  });

  describe('Adding marks', () => {
    beforeAll(() => {
      testActor = interpret(characterMachine);
    });

    test('WHEN a character is created, they should be alive and unscathed', () => {
      let { context, value } = testActor.getSnapshot();

      expect(value).toEqual('alive');
      expect(context.marks).toEqual({
        body: 0,
        brain: 0,
        bleed: 0,
      });
      expect(context.scars).toEqual([]);
    });

    test('WHEN a character takes damage, they should add a mark that matches the nature of the attack', () => {
      testActor.send({ type: 'ADD_MARK', damageType: 'BODY' });
      testActor.send({ type: 'ADD_MARK', damageType: 'BRAIN' });
      testActor.send({ type: 'ADD_MARK', damageType: 'BLEED' });

      let { context } = testActor.getSnapshot();
      expect(context.marks).toEqual({
        body: 1,
        brain: 1,
        bleed: 1,
      });
    });
  });

  describe('Falling unconscious', () => {
    describe('GIVEN a character already has three (3) marks in a track, WHEN they take additional damage', () => {
      beforeAll(() => {
        testActor = interpret(characterMachine, {
          input: {
            marks: {
              body: 3,
              brain: 0,
              bleed: 0,
            },
          },
        });
      });

      test('THEN they should immediately become incapacitated in the scene AND immediately take a scar AND all marks in that track should be reset', () => {
        testActor.send({ type: 'ADD_MARK', damageType: 'BODY' });

        let { value, context } = testActor.getSnapshot();

        expect(value).toEqual({ incapacitated: 'describingScar' });
        expect(context.marks.body).toEqual(0);
      });
    });
  });

  describe('Adding scars', () => {
    beforeAll(() => {
      testActor = interpret(characterMachine);
    });

    describe('GIVEN a character is adding a scar', () => {
      beforeEach(() => {
        testActor.send({ type: 'ADD_SCAR', damageType: 'BODY' });
      });

      test('WHEN the scar prompt opens, THEN its type should match the damage type inflicted', () => {
        console.log('TODO: Match damage type to scar');
      });

      test('WHEN they save the new scar, THEN they should be prompted to shift an action point', () => {
        let scar: Scar = { type: 'BODY', description: 'Limp' };

        testActor.send({
          type: 'SAVE_SCAR',
          scar,
        });

        let { context, value } = testActor.getSnapshot();

        expect(context.scars).toEqual(expect.arrayContaining([scar]));
        expect(value).toEqual({ incapacitated: 'updatingActionPoints' });
      });
    });

    describe('GIVEN a character is updating their action points', () => {
      beforeEach(() => {
        testActor.send({
          type: 'SAVE_SCAR',
          scar: { type: 'BODY', description: 'Limp' },
        });
      });

      test('GIVEN the source action has ZERO point, THEN it should display an error', () => {
        console.log('TODO: Error for no points in source action');
      });

      test('GIVEN the destination action has THREE points, THEN it should display an error', () => {
        console.log('TODO: Error for exceeding points in destination');
      });

      test('WHEN they finish, THEN they should wait for the scene to complete', () => {
        console.log('TODO: Test shifting of points');

        testActor.send({
          type: 'SHIFT_ACTION_POINT',
          from: 'MOVE',
          to: 'READ',
        });

        let { value } = testActor.getSnapshot();

        expect(value).toEqual({ incapacitated: 'unconscious' });
      });
    });

    describe('GIVEN a character is unconscious', () => {
      beforeEach(() => {
        testActor.send({
          type: 'SAVE_SCAR',
          scar: { type: 'BODY', description: 'Limp' },
        });

        testActor.send({
          type: 'SHIFT_ACTION_POINT',
          from: 'MOVE',
          to: 'READ',
        });
      });

      test('WHEN the scene is complete, THEN they should recover', () => {
        testActor.send({ type: 'RECOVER' });

        let { value } = testActor.getSnapshot();

        expect(value).toEqual('alive');
      });
    });
  });

  describe('Permanent death', () => {
    describe('GIVEN a character already has three (3) scars', () => {
      beforeAll(() => {
        testActor = interpret(characterMachine, {
          input: {
            scars: [
              { type: 'BODY', description: 'Limp' },
              { type: 'BRAIN', description: 'Fear of deep water' },
              { type: 'BRAIN', description: 'Jumpy at loud sounds' },
            ],
          },
        });
      });

      test('WHEN they take another scar, THEN they should die', () => {
        testActor.send({ type: 'ADD_SCAR', damageType: 'BODY' });

        let { value } = testActor.getSnapshot();

        expect(value).toEqual('dead');
      });
    });
  });
});
