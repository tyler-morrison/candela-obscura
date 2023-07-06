import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import { InterpreterFrom, interpret } from 'xstate';

import circleMachine from './circle-machine';

let testActor: InterpreterFrom<typeof circleMachine>;

function currentState() {
  return testActor.getSnapshot().value;
}

function currentContext() {
  return testActor.getSnapshot().context;
}

describe('Circle Machine', () => {
  beforeAll(() => {
    testActor = interpret(circleMachine);
  });

  beforeEach(() => {
    testActor.start();
  });

  afterEach(() => {
    testActor.stop();
  });

  // TODO: Stitch, Refresh, Train can only be done in-between assignments
  it('should work', () => {
    expect(currentState()).toEqual('idle');
  });

  describe('Circle Advancement', () => {
    beforeAll(() => {
      testActor = interpret(circleMachine);
    });

    beforeEach(() => {
      testActor.send({ type: 'START_ASSIGNMENT' });
      testActor.send({ type: 'COMPLETE_ASSIGNMENT' });
    });

    test('WHEN the assignment ends, THEN the GM should be able to update the circle’s illumination points', () => {
      let getIllumination = () => currentContext().illumination;

      expect(currentState()).toEqual({
        debriefing: 'askIlluminationQuestions',
      });
      expect(getIllumination()).toEqual(0);

      testActor.send({ type: 'UPDATE_ILLUMINATION.ADD', points: 1 });
      expect(getIllumination()).toEqual(1);

      testActor.send({ type: 'UPDATE_ILLUMINATION.REMOVE', points: 1 });
      expect(getIllumination()).toEqual(0);

      testActor.send({ type: 'UPDATE_ILLUMINATION.OVERRIDE', points: 23 });
      expect(getIllumination()).toEqual(23);
    });

    test('WHEN the illumination track is full, THEN the track is cleared AND charachters advance', () => {
      let getIllumination = () => currentContext().illumination;

      // Start with a mostly full Illumination track
      testActor.send({ type: 'UPDATE_ILLUMINATION.OVERRIDE', points: 23 });
      expect(currentState()).toEqual({
        debriefing: 'askIlluminationQuestions',
      });
      expect(getIllumination()).toEqual(23);

      // The circle answers "Yes" to all Illumination Questions
      testActor.send({ type: 'UPDATE_ILLUMINATION.ADD', points: 3 });
      expect(getIllumination()).toEqual(26);

      // Proceed to Illumination Key prompt
      testActor.send({ type: 'NEXT' });
      expect(currentState()).toEqual({ debriefing: 'checkIlluminationKeys' });

      // Some, but not all, players fulfilled an Illumination Key during the assigment
      testActor.send({ type: 'UPDATE_ILLUMINATION.ADD', points: 2 });
      expect(getIllumination()).toEqual(28);
      testActor.send({ type: 'NEXT' });

      // Leftover Illumination (any points > 24) should be preserved
      expect(getIllumination()).toEqual(4);
      expect(currentState()).toEqual({ debriefing: 'selectingAdvancements' });
    });
  });
});
