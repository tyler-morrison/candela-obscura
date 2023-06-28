import { createMachine, EventObject } from "xstate";

interface CircleMachineContext {}

interface StartAssignmentEvent extends EventObject {
  type: 'START_ASSIGNMENT'
}
type CircleMachineEvents =
  | StartAssignmentEvent
export const circleMachine = createMachine({
  id: 'circle-machine',
  types: {} as {
    context: CircleMachineContext;
    events: CircleMachineEvents;
  },
  context: {},
  initial: 'idle',
  states: {
    idle: {
      on: {
        START_ASSIGNMENT: 'onAssignment'
      }
    },
    onAssignment: {}
  }
})

export default circleMachine
