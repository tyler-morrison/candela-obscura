import { assign, createMachine, log, raise } from 'xstate';

import { hasThreeMarks, hasThreeScars } from './guards';
import {
  AddScarEvent,
  CharacterMachineContext,
  CharacterMachineEvents,
  DamageType,
} from './models';

export const characterMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QGMAWBDATu5AXMmAtALY6oCWAdmAHToA25AbmAMQCCAIpwPoCy7AEoBpANoAGALqJQABwD2scrnLzKMkAA9E4gDQgAnogDMARhoBWACzjrADgBsxiwHYrpmwCYAvt-1osHHwiUjQqWgZmNi5eARFRU2kkEAUlFTUNbQRCK0caYwdTCwKrC1NxAE5Kh30jbKK7GjtPF1MHTzsXF2NPJxdffwxsPAISMnC6RhYObh4AZQBhIQkkuUVlVXVkrL1DRE9jRpcHO2MrCuMXFrOrYwGQAOHgsbDqGipkdFkcZXR8CFYKw0qQ2GW2iA8nhoFQszQqnnK4ncF1qiEcVhoDiRvQRlVcV3ujyCo1CFDeHy+P1wf0gNAgcGQmHIACMqFA5p9MKw5uwAGoAUXmS0EQOSIPSW1AWUIJ0sLjstmcZVMVXhqIQDisUPEzTsphVmrKWsJQ2JIXG5Mon2+yF+-xoAFdZBA-mz2HhNgAFeRUXCwbkACQAkgAxAAqPHYCzDQYA8gA5Hie2NB+Nh0VrNKbTKIfE0IrtOydDriXrGdWFpoWdrV4qHFwWHx+B6mkbm160Ck2u20h1WtSwW3yB3+wT8haxgUiqTA9YSnMIMoVJqeTziBwuCrlIvndWEUwFfPiWxFuzFcRmCp2XzNyjyenwZJEtsvMlgWdZsFSxAy6tyhWlKYXTGOI+p7p4VgOPkLRtK4Vi5CcsImoEL6khMkQsB+oKSloP6wjQx7HgeEGNmYRp7kUULOLYVSXHCdgXMhTwkhanZWpStrUv8WHzuC2RYo0rgAWUwGgaY6qlFCFgWBcxggRU8pbq4TFmq+ExdlSNIQHSDJMqylDspyPHZnxhDVuI-5IiJ3RiRWcn5JUNjVqYDFnNezbPs8aGWtamn2k6LoqAZ7oSt6vqPpm2ELme+bVp4CnlCqbSHBWByWDJlzwVu67SSpqGse87Hdlxvb9pQg6qCOxlfrhCAKlCBzwcYMLroBLgVg4FgORcW43N03R5V5BX0ugEDVTh0quNCFRWN0FhIheKoHOqCkWW4thYg23QOBuN7eEAA */
    id: 'character-machine',
    types: {} as {
      input: Partial<Pick<CharacterMachineContext, 'marks' | 'scars'>>;
      context: CharacterMachineContext;
      events: CharacterMachineEvents;
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
                'If you should ever need to take a mark and can’t because that track is full, immediately take a scar.',
              guard: 'hasThreeMarks',
              actions: 'raiseAddScarEvent',
            },
            {
              description:
                'When your character takes damage it is tracked by adding a mark.',
              actions: 'addMarkToDamageType',
            },
          ],
          ADD_SCAR: {
            description:
              'Scars represent the permanent changes that affect a character. Erase all the marks in that track and become incapacitated in the scene.',
            target: 'incapacitated',
            actions: 'resetAllMarksInTrack',
          },
        },
      },
      incapacitated: {
        description:
          '🤕 As the light fades from your eyes, so many questions swirl in about your mind. How did I get here? What might I have done differently? …inky blackness overtakes you.',
        initial: 'describingScar',
        states: {
          describingScar: {
            description:
              'When you take a scar, you’ll write down a narrative change based on the nature of the attack that caused the scar.',
            tags: ['pause'],
            on: {
              SAVE_SCAR: {
                target: 'updatingActionPoints',
                actions: 'updateScars',
              },
            },
          },
          updatingActionPoints: {
            description:
              'Remove a point from an action of your choice, and add a point into a different action to reflect how your character has changed because of the scar they now carry.',
            tags: ['pause'],
            on: {
              SHIFT_ACTION_POINT: {
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
      resetAllMarksInTrack: assign(({ context: { marks }, event }) => {
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
      hasThreeMarks,
      hasThreeScars,
    },
  }
);

export default characterMachine;
