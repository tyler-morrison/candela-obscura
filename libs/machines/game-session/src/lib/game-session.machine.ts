import {
  actionRollMachine,
  type RollResult,
} from '@darrington/machines/action-roll';
import { nanoid } from 'nanoid';
import { and, assign, createMachine, forwardTo, fromCallback } from 'xstate';

export interface RollRequest {
  id: string;
}

export interface GameSessionContext {
  activeRoll?: RollRequest;
  log: RollResult[];
  queuedRolls: RollRequest[];
  timer: number;
}

export type GameSessionEvents =
  | { type: 'END_SESSION' }
  | { type: 'PAUSE_SESSION' }
  | { type: 'RESUME_SESSION' }
  | { type: 'TICK' }
  | { type: 'ROLL_DICE' }
  | { type: 'CANCEL_ROLL' }
  | { type: 'REQUEST_ROLL' };

const TIMER_INTERVAL = 1_000;

export const gameSessionMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5RQIYFswFpZ1gSwHsA7AYgFEA5AEQH0BlMuugSQHkKBtABgF1FQADgXwAXQkX4gAHogCM8gHQB2ABxL1ANhUAmWQFZte2QBYANCACecrsYVc9xkxt0GdATg0BfT+dQZsuOIKAIIAxmIAbmAkAArBAKoM9Iws7Nx8SCBCouKSMggaxtoKshpusioaeiqybjZK5lYIeloKLQDMbkpcWkqdStrevuhYOLD4xCHheFEkAEpkAIrxjAAqNHOsADJb6ZLZeGLEeYga7SoKajUqXBX27e16jYjafSV6birVasbqxipDEB+UaBSZhSLRVbMADCAGk9pkDkcJJl8ph5EplF8bNouNovrIuO1nggagptO1DBU1EoDO0lF4fECRgFxkFwTMwAoAOooQ54IhQAAEADMCAAnIVzAgAGxlJARgmE-OOqMQNwUnSMGhMXE+tWMT0siCKxQpbg8enapQ0SnKgOBrImRCmEIU0rlQuYRCFMXFBCg4twJAgxC5AoiBAA1lyUNMoph-XLFVllciTghtGc7Hr7nbOmptCSHJj2sYuHjDb9KkYHSyxs7XZz3bKZV6fX6A0HxiRocEKNCyFsNttdrx9mncmrM9n-kVyu0NESzkamnp7Aozm5Xp8Hr9-nX-A32fGuR6297ff7A8HNjsaFQYWQU0ip6A0QzN0oKpTCnPzg0xrNIalydIuBhWo8+KHiCbKTDEKAAK44BA8yMPEACyZDJEwbCcOOiKTqq76nI8bRqPoDhGIaPQksYxjtAoxhbq8xjbm4HzeEyRAEBAcCSI6x7EamOTCWisgDF+P5ZvRKgMWoJKYBodh1OcHE2tUPTGDBTonhCE6iSiJEIOi2i2La0l-nJAEkribjKHackmNoZnfu0OlCS6HJRDyfJiIKooSlKrYGSqRnSOqjGUnOlEOIuXAqCSZaMW4lIVPR7S3HJZweaCXmni2nqXp2N7jKF6bTmSFrVTVNVmEBVqyJctS4hU2gcR8AJMoJeUKAhyGQOVb4RQU6htJ8ck1HULllsWG6ZQMegDF0Kg0oywxHr10IEGgAgymAIhgENYkvJ+NTnNamlnLUJKEsUXRWkoRSyNa6iGFxnhAA */
    id: 'game-session',
    initial: 'Active',
    types: {
      context: {} as GameSessionContext,
      events: {} as GameSessionEvents,
    },
    context: {
      activeRoll: undefined,
      log: [],
      queuedRolls: [],
      timer: 0,
    },
    on: {
      END_SESSION: '.Complete',
    },
    states: {
      // TODO: Initialize session by loading player states and spawning
      Active: {
        initial: 'Waiting for Roll',
        invoke: {
          id: 'session-timer',
          src: 'sessionTimer',
        },
        on: {
          PAUSE_SESSION: 'Paused',
          REQUEST_ROLL: {
            actions: 'addRollToQueue',
          },
          TICK: {
            actions: 'incrementTimer',
          },
        },
        states: {
          'Waiting for Roll': {
            always: [
              {
                guard: and(['hasQueuedRolls', 'noActiveRoll']),
                target: 'Roll In Progress',
                actions: 'activateNextRoll',
              },
            ],
          },
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
              CANCEL_ROLL: 'Waiting for Roll',
              ROLL_DICE: {
                // TODO: Create guard so that only roll "owner" can initiate the roll
                actions: forwardTo('active-roll'),
              },
            },
            exit: assign({
              activeRoll: undefined,
            }),
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
      activateNextRoll: assign(({ context }) => {
        let [next, ...queued] = context.queuedRolls;
        return {
          queuedRolls: queued,
          activeRoll: next,
        };
      }),
      addRollToQueue: assign({
        queuedRolls: ({ context }) => [
          ...context.queuedRolls,
          { id: nanoid() },
        ],
      }),
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
    guards: {
      hasQueuedRolls: ({ context }) => !!context.queuedRolls.length,
      noActiveRoll: ({ context }) => context.activeRoll === undefined,
    },
  }
);

export default gameSessionMachine;
