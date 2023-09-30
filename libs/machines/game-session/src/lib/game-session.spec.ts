import { describe, expect } from 'vitest';
import { createActor, type Actor } from 'xstate';

import gameSessionMachine from './game-session.machine';

let testActor: Actor<typeof gameSessionMachine>;

describe('Game Session Machine', () => {
  it('should work', () => {
    testActor = createActor(gameSessionMachine);

    let current = testActor.getSnapshot();
    expect(current.value).toEqual('Idle');

    testActor.stop();
  });
});
