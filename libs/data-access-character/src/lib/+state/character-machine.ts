import { createMachine } from "xstate";

export const characterMachine = createMachine({
  id: 'character-machine',
  types: {} as {
    input: {
      characterId: string
    },
    context: {
      characterId: string
    }
  },
  context: ({ input }) => ({
    characterId: input.characterId
  }),
  initial: "ready",
  states: {
    ready: {}
  }
})
