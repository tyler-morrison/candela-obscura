import { createMachine } from 'xstate';

export const gameSessionMachine = createMachine({
  id: 'game-session',
  initial: 'Idle',
  states: {
    Idle: {},
  },
});

export default gameSessionMachine;
