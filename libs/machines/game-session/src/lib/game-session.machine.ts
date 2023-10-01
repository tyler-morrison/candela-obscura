import {
  actionRollMachine,
  type RollResult,
} from '@darrington/machines/action-roll';
import { assign, createMachine, forwardTo, log } from 'xstate';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GameSessionContext {
  log: RollResult[];
}

export type GameSessionEvents =
  | { type: 'ROLL_DICE' }
  | { type: 'REQUEST_ROLL' };

export const gameSessionMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5RQIYFswFpZ1gSwHsA7AOgEkIAbMAYgCUBRARQFUGBlAFQH06B5ADICA2gAYAuolAAHAvgAuhIlJAAPRAEYATAFYSANh0AOIwBZ9+gOw6NOraICcAGhABPREY0Hrly4dOWojqWGhoAvmEuqBjYuEokdASUlAAEZEQpAAoATgRQ2bg0EMRgJHhEAG4EANalKADGihVYuclikkggsgpKKuoI5g4kpgDMpiYaRqJaIxq++i7uCBpBJA5GWqYrG9Y65hGRIEQEEHAq0Vg4sPjEKt14ired-ZgLboivEVHol3HE5FQwHc5A9es9EKYtItNKJTGtPH5tKJLFpLKYHCMviALrFrvFEsk0hkcnkCtdgT0nqB+iNRCNhrpLEYrA5RiEdG8lp5hkYOYiHMjWQ4HFicVcbqQCakAMIENDSajyIGde6PZTghD6UyiYYOfSiIwOYJaCwmaHLWHwub6JEotEYg5hIA */
  id: 'game-session',
  initial: 'Idle',
  types: {
    context: {} as GameSessionContext,
    events: {} as GameSessionEvents,
  },
  context: {
    log: [],
  },
  states: {
    Idle: {
      on: {
        REQUEST_ROLL: {
          target: 'Roll In Progress',
          actions: log('TODO - Hoist action and queue requests'),
        },
      },
    },
    'Roll In Progress': {
      invoke: {
        id: 'active-roll',
        src: actionRollMachine,
        onDone: {
          target: 'Idle',
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
});

export default gameSessionMachine;
