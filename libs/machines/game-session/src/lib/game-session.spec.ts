import { describe, expect } from 'vitest';
import { createActor, type Actor } from 'xstate';

import gameSessionMachine from './game-session.machine';

let testActor: Actor<typeof gameSessionMachine>;

describe('Game Session Machine', () => {
  it('should work', () => {
    testActor = createActor(gameSessionMachine);
    testActor.start();

    testActor.send({ type: 'REQUEST_ROLL' });
    testActor.send({ type: 'ROLL_DICE' });

    let current = testActor.getSnapshot();

    expect(current.value).toEqual('Idle');
    expect(current.context.log.length).toEqual(1);

    testActor.stop();
  });
});
