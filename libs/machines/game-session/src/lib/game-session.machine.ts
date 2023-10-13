import {
  actionRollMachine,
  type RollResult,
} from '@darrington/machines/action-roll';
import { assign, createMachine, forwardTo, fromCallback, log } from 'xstate';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GameSessionContext {
  log: RollResult[];
  timer: number;
}

export type GameSessionEvents =
  | { type: 'END_SESSION' }
  | { type: 'PAUSE_SESSION' }
  | { type: 'RESUME_SESSION' }
  | { type: 'TICK' }
  | { type: 'ROLL_DICE' }
  | { type: 'REQUEST_ROLL' };

const TIMER_INTERVAL = 1_000;

export const gameSessionMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5RQIYFswFpZ1gSwHsA7AYgFEA5AEQH0BlMuugSQHkKBtABgF1FQADgXwAXQkX4gAHogAsAJgA0IAJ6IAHPIB0srgEYA7Fy7qArGdOyAnAGYAvneWoM2XOK0BBAMZiAbmBIABQ8AVQZuPiQQIVFxSRkEADY9RK0DRNNE+T0TFMtlNQRLPS09K1lExN0reVk9eocndCwcWHxiTx88fxIAJTIARRDGABUaXtYAGUmIyRi8MWJ4xHkDGy0bGz0bdRtZBXSDJVUVmwMtU30rS9N5RIMUg0aQZxa3Du8-AJHmAGEAaVmUXmiwkUQSq1SmS4llklzOMNMBUQegUWnkq2ysnUVi48lM5Wer1cbXcn26YC0vQIABsaQACZhEemBABOBCgrNwJAgxEpeCIvgIAGtKSguv5MOy6UDBMIFnFwStsVpjFYcvIdncyokbMiipl0XdzHDTDYrOocUTmiT2kROl8qbSGUyWezOdyJtMaFQ-mRZdF5aDlggrKk8Xt5OqwwSTEiTgg4esarjzVkDAZbKjrS5WnatIEUABXHAQPqMEIAWX9vDmQcVoASyVS6Uy2VyGVk+oUVjSmfk6hS6kR10SDkcICIBAgcEkxLzDcDsSWSoQmFR+swY4n8-e9vJ-jry7BjcQe31W17Gcq17uB3sO5tC4+EspAHUUAqiFB6QAzAisvS1J0keCorqeiZ6OoOhcFkGIVKiZTqPqpgZloyTqNYtQmIk6gPDmbyki+jrAS6zJshyXJtKBwarpoKGWOiXBnAYtxVPiMIEba7iFiWkA0YuCQGHUME5JUOGyEcXYJrIOyqgOmHWKxBiWnoXHPvavwEGgAg0mAIhgAJ4HSCsXDnHiiRcBUmSSXs8aFIOGwYjUez7PU5RqeOQA */
    id: 'game-session',
    initial: 'Active',
    types: {
      context: {} as GameSessionContext,
      events: {} as GameSessionEvents,
    },
    context: {
      log: [],
      timer: 0,
    },
    on: {
      END_SESSION: 'Complete',
    },
    states: {
      Active: {
        initial: 'Waiting for Roll',
        invoke: {
          id: 'session-timer',
          src: 'sessionTimer',
        },
        on: {
          PAUSE_SESSION: 'Paused',
          REQUEST_ROLL: {
            actions: log('TODO - Hoist action and queue requests'),
          },
          TICK: {
            actions: 'incrementTimer',
          },
        },
        states: {
          'Waiting for Roll': {},
          'Roll In Progress': {
            invoke: {
              id: 'active-roll',
              src: actionRollMachine,
              onDone: {
                target: 'Waiting for Roll',
                actions: assign({
                  log: ({ context, event }) => [event.output, ...context.log],
                }),
              },
            },
            on: {
              ROLL_DICE: {
                // TODO: Create guard so that only roll "owner" can initiate the roll
                actions: forwardTo('active-roll'),
              },
            },
          },
        },
      },
      Paused: {
        on: {
          RESUME_SESSION: 'Active',
        },
      },
      Complete: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      incrementTimer: assign({
        timer: ({ context }) => context.timer + TIMER_INTERVAL,
      }),
    },
    actors: {
      sessionTimer: fromCallback(({ sendBack }) => {
        const interval = setInterval(() => {
          sendBack({ type: 'TICK' });
        }, TIMER_INTERVAL);
        return () => clearInterval(interval);
      }),
    },
  }
);

export default gameSessionMachine;
