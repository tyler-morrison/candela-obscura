import { afterEach, assert, beforeEach, describe, test, vi } from "vitest";
import { interpret } from "xstate";
import { characterMachine } from './character-machine';

// TODO: Mock services here…
const someActionCounter = vi.fn()

describe('Character Sheet Machine', () => {
  const testMachine = characterMachine.provide({
    // TODO: Pass mocks here…
    // actions: {
    //   /* ...action overrides */
    // },
    // guards: {
    //   /* ...guard overrides */
    // },
    // actors: {
    //   /* ...actor overrides */
    // },
    // ...
  })

  describe('happy path', () => {
    test('check initial state', () => {
      const testActor = interpret(testMachine, {
        input: {
          characterId: 'foo'
        }
      }).start()

      assert(testActor.getSnapshot().value === 'ready')

      testActor.stop()
    })
  })
});
