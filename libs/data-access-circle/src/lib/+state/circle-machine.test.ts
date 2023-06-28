import { afterEach, beforeAll, beforeEach } from 'vitest';
import { interpret, InterpreterFrom } from 'xstate';
import circleMachine from './circle-machine';

let testActor: InterpreterFrom<typeof circleMachine>;

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

  it('should work', () => {
    let { value } = testActor.getSnapshot()
    expect(value).toEqual('idle');
  });
});
