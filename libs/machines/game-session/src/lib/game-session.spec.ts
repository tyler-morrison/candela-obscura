/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { createActor, type Actor } from 'xstate';

import gameSessionMachine from './game-session.machine';

let testActor: Actor<typeof gameSessionMachine>;

describe('Game Session Machine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Session Timer', () => {
    test('active play is tracked in 1 second increments', () => {
      testActor = createActor(gameSessionMachine).start();
      let getSessionTimer = () => testActor.getSnapshot().context.timer;

      vi.advanceTimersByTime(500);
      expect(getSessionTimer()).toEqual(0);

      vi.advanceTimersByTime(500);
      expect(getSessionTimer()).toEqual(1_000);

      testActor.stop();
    });

    test('the timer can be paused', () => {
      testActor = createActor(gameSessionMachine).start();
      let getSessionTimer = () => testActor.getSnapshot().context.timer;

      vi.advanceTimersByTime(1_000);
      expect(getSessionTimer()).toEqual(1_000);

      vi.advanceTimersByTime(500);
      testActor.send({ type: 'PAUSE_SESSION' });
      vi.advanceTimersByTime(3_500);

      expect(getSessionTimer()).toEqual(1_000);

      testActor.stop();
    });
  });

  describe('Active Play', () => {
    test('only ONE roll may be active at a time', () => {
      testActor = createActor(gameSessionMachine).start();
      let getState = () => testActor.getSnapshot().value;
      let getActiveRoll = () => testActor.getSnapshot().context.activeRoll!;
      let getQueuedRolls = () => testActor.getSnapshot().context.queuedRolls;

      // Initial state…
      expect(getActiveRoll()).toBeUndefined();
      expect(getState()).toEqual({
        Active: 'Waiting for Roll',
      });

      // Automatically activate first roll…
      testActor.send({ type: 'REQUEST_ROLL' });

      expect(getActiveRoll()).not.toBeUndefined();
      expect(getState()).toEqual({
        Active: 'Roll In Progress',
      });

      // Queue additional rolls…
      let firstActive = getActiveRoll();
      testActor.send({ type: 'REQUEST_ROLL' });
      testActor.send({ type: 'REQUEST_ROLL' });

      expect(getActiveRoll()).toEqual(firstActive);
      expect(getQueuedRolls().length).toEqual(2);
    });

    test('the roll owner OR game master can cancel they active roll', () => {
      testActor = createActor(gameSessionMachine).start();
      let getState = () => testActor.getSnapshot().value;
      let getActiveRoll = () => testActor.getSnapshot().context.activeRoll!;

      expect(getActiveRoll()).toBeUndefined();
      testActor.send({ type: 'REQUEST_ROLL' });

      expect(getActiveRoll()).not.toBeUndefined();
      expect(getState()).toEqual({
        Active: 'Roll In Progress',
      });

      testActor.send({ type: 'CANCEL_ROLL' });
      expect(getActiveRoll()).toBeUndefined();
      expect(getState()).toEqual({
        Active: 'Waiting for Roll',
      });
    });
  });
});
