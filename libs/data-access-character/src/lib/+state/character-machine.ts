import { assign, createMachine, log, raise } from 'xstate';

import { canAddMark, hasThreeScars } from './guards';
import {
  AddScarEvent,
  CharacterMachineContext,
  CharacterMachineEvents,
  DamageType,
} from './models';

export const characterMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QGMAWBDATu5AXMmAtALY6oCWAdmAHToA25AbmAMQCCAIpwPoCy7AEoBpANoAGALqJQABwD2scrnLzKMkAA9EhAMwAmACw1DAVkMA2XYd2mA7AEYHuh6YA0IAJ47bpmgA5TC3FAx1MHAE5dOwBfGI80LBx8IlI0KloGZjYuXgERUQdpJBAFJRU1DW0EPSMTcysbeycXdy8dfQdjLsMHO11-TocLft04hIxsPAISMgy6RhYObh4AZQBhIQliuUVlVXUS6trjM0trW0dnVw9vBEsaV0iI-10o0319W3GQRKmU2bpag0KjIdCyHDKdD4CCsbYaMr7SpHRAOcQRCw0YJRQbiSLiYIWW4+fR+Ul2CKmKL9QxRSw-P7JGZpCjA0HgyG4aGQOgQCBUKCrMGYVirdgANQAomtNoJ4SVERVDqBqg5-A4aPoRgNxKZxF8tXY7MSaoNNYY7J9DOJooYzJ8GZMmak5mzKGCIcgoTCaABXWQQaEC9h4A4ABXkVFwsFFAAkAJIAMQAKjwwwB5eMAOWTq3lu3KByqiCsuhoLhG4kslgiRgiJqcmN0FgsXxcNqcVcdSWmLqBtHZnu9PN97rUsC98l9McEkvW6alcqkCL2SuLCAumtr-TsFleFkMRl0JsIpiCNDshlx9kGunE6Li8RAlHkEDgGkZvcBrLAK8LyJVHQbHEepqypDEq30E8LD1R59EtS9KVpcQKW7f5mVdTJFl-BVVyLFEagGfRQIPcDgkPE8gmI1sEK1A9-EPfQ0Odb95kHTluQgP8kWVLREDsMltQsCJdxcBighPHUsW3fw7AJbV5OYr8WTY90OS9LkfXQPkBSFLBuLXAingvAT9HRPUvhgkYTzMiJpPg-wq0c5xbAsJSARUt0PQ4n1-UDFRKCgEMlQjKN4Fw-9eNVL5NSEkSrDVMwiXaBAHDMgJIgGIIPmsat3Iw-sQTUodNJHMdKAnVRpwM-DAIQGDiKpN57DtawIkME81TsExDwEtV9Hipz8r7H8aDfbSaoAviEH8SksRysyjV8UxjxSpw7KCak8REqJvkfIA */
    id: 'character-machine',
    types: {} as {
      input: Partial<Pick<CharacterMachineContext, 'marks' | 'scars'>>;
      context: CharacterMachineContext;
      events: CharacterMachineEvents;
    },
    meta: {
      gitHubUrl: {
        type: 'string',
        value:
          'https://github.com/tyler-morrison/candela-obscura/blob/main/libs/data-access-character/src/lib/+state/character-machine.ts',
      },
    },
    context: ({ input }) => ({
      // TODO: Convert to input and auto-generate on spawn
      characterId: '2grqaXH0T_MDLRYGK0',
      // TODO: Convert to input and decide how to display user profile
      creatorId: 'E120FzM3clhouK98nx',
      marks: input?.marks || {
        body: 0,
        brain: 0,
        bleed: 0,
      },
      scars: input?.scars || [],
    }),
    initial: 'alive',
    states: {
      alive: {
        id: 'alive',
        description:
          '🧐 Each day you rise, determined to learn more about the secrets of your world. You may be weary or bruised, but you know the answer you seek is just around the next corner.',
        on: {
          ADD_MARK: [
            {
              description:
                'When your character takes damage it is tracked by adding a mark.',
              guard: 'canAddMark',
              actions: 'addMarkToDamageType',
            },
            {
              description:
                'If you should ever need to take a mark and can’t because that track is full, immediately take a scar.',
              actions: 'raiseAddScarEvent',
            },
          ],
          ADD_SCAR: {
            description:
              'Erase all the marks in that track and become incapacitated in the scene.',
            target: 'incapacitated',
            actions: 'eraseAllMarks',
          },
        },
      },
      incapacitated: {
        description:
          '🤕 As the light fades from your eyes, so many questions swirl in about your mind. How did I get here? What might I have done differently? …inky blackness overtakes you.',
        initial: 'addingScar',
        states: {
          addingScar: {
            description:
              'Scars represent the permanent changes that affect a character.',
            tags: ['pause'],
            on: {
              SAVE_SCAR: {
                description:
                  'When you take a scar, you’ll write down a narrative change based on the nature of the attack that caused the scar.',
                target: 'updatingActionPoints',
                actions: 'updateScars',
              },
            },
          },
          updatingActionPoints: {
            description:
              'We encourage the player to look deeply at their character, and consider the way they might change throughout the campaign.',
            tags: ['pause'],
            on: {
              SHIFT_POINTS: {
                target: 'unconscious',
                actions: ['removeActionPoint', 'addActionPoint'],
              },
            },
          },
          unconscious: {
            on: {
              RECOVER: {
                description:
                  'You can return to the game once your circle gets you to somewhere safe.',
                target: '#alive',
              },
            },
          },
        },
        always: [
          {
            guard: 'hasThreeScars',
            target: 'dead',
          },
        ],
      },
      dead: {
        type: 'final',

        description:
          '💀 Death comes to all. But great achievements build a monument which shall endure until the sun grows cold. Rest in peace.',
      },
    },
  },
  {
    actions: {
      addMarkToDamageType: assign(({ context: { marks }, event }) => {
        if (event.type !== 'ADD_MARK') return { marks };
        let damageType =
          event.damageType.toLowerCase() as Lowercase<DamageType>;

        return {
          marks: {
            ...marks,
            [damageType]: marks[damageType] + 1,
          },
        };
      }),
      addActionPoint: log(`TODO: Add action point logic`),
      updateScars: assign({
        scars: ({ context: { scars }, event }) =>
          event.type === 'SAVE_SCAR' ? [...scars, event.scar] : scars,
      }),
      removeActionPoint: log(`TODO: Remove action point logic`),
      eraseAllMarks: assign(({ context: { marks }, event }) => {
        if (event.type !== 'ADD_SCAR') return { marks };
        let damageType =
          event.damageType.toLowerCase() as Lowercase<DamageType>;

        return {
          marks: {
            ...marks,
            [damageType]: 0,
          },
        };
      }),
      raiseAddScarEvent: raise(
        ({ event }) =>
          ({
            type: 'ADD_SCAR',
            damageType: 'damageType' in event && event.damageType,
          } as AddScarEvent)
      ),
    },
    guards: {
      canAddMark,
      hasThreeScars,
    },
  }
);

export default characterMachine;
