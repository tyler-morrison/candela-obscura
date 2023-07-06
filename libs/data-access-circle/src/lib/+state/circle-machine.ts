import { assign, createMachine } from 'xstate';
import {
  CircleMachineContext,
  CircleMachineEvents,
  UpdateIlluminationPoints,
} from './models';
import { MAX_ILLUMINATION_POINTS } from './constants';

export const circleMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QGMCWAnZAbMBaAtgIbIAWqAdmAHSoQ4DEAygCoCCASswPquOMCSAcQByAWQCiw5gG0ADAF1EoAA4B7WKgAuqVeSUgAHogCcVAMyyzAdmMBGM8ePWALAA4ArMYA0IAJ6JcZwAmADYqEJDnd1t3BwizZwBfRJ80TBwCYjJKKl1WWA0ocnwwck16AGEAeVEABQAZcWZxHj4hMUkZBX01DW1dfSMEXFcqSyD7V2cbELNbVxDbH39hoOdbcPcQoKCzD1tbENl55NSMbDwiUgpqCDAAI3RUMAAzCih6CF1qWE1CTWoaQumWuOTuj2eb3IUDkiiQIF6Wh0enhQwOslGris7liZgmrm8fgCZjM7ioUxxTiCVkiBJCpxAQIyV2ytweT1e73oAFVagARVjNLj8er1bmifjCQX8KrCKgAKlhPXUSIGqMQ7gxVFszmOBISsksBxCywCoWc4Txrjm7isVmcESsZgZTMuWRuVHBHKhUCohFgAGt+FgsABXfAUf7IgCKobg-XIsHownEAA0unCVCqE4NELZjGELI5ItNi8ZpqaEAdTLInM4ojZZNtjO4gi7zsz3WD2ZD3lRSGBkEGQ+HIwmANJgXxJlPppXwxE59UIVuY8u2KwHVv1rGV3aycK2Y75jGG6wnFKMjtu0FsiGc6H9kiD4dhiPkKO6SfT5NpmS2TMEWzZFcxXNZtVkTUcQsKwMRpStqzGJw9lsIJDSbTVbHbdIb1ZT0ewfX1YDAHBkG0aFWAgAA3QhyGQMASjKGc-3nLM+hA5cDh1KgHViIJjCmYxZF1KwEPzJCEgbITm1bZJL3IVQ7ngeFXRBVllXYtVQCGXACx46YphpSwoLcStcFmDZSWiKJNWPZxjGw4EWQ9WgcA01UUW0gIHXMNxoPsCxZDWMwzPcZwzHJHEdR1AtjH4qxHM7W9cnIfJCmKUpNHcpcvOGNxzDigT83rdZjFEolhlJUxPC2DFgg3fidUS3CPS9XtoWyjjcsCUZ6ysQyjlJSDTIq3BDjJGwHCcW0GsdZq1NagifT9QNgzfMcYzjX5kWUtiPNA3ADz6gbjOGmxypWMaLX43Va3sI56vs+bnO7e9loHIc1tHD8JynXagM0zzDACI6DOmQaTIxSI9yCsYFkdHcC1rdxnq7O9vT7YjSPIqBKJouiGMy-7Fy64GEBpQtbV1XUBIdIK9wmKh3Hh1xXGEoI2f6ttL1Ul70fa302teCpVHwZQcABTqtLJo9ojGbZXHmWYnGOZwELCKIjjqkkrM1BK5KAA */
    id: 'circle-machine',
    types: {} as {
      context: CircleMachineContext;
      events: CircleMachineEvents;
    },
    context: {
      illumination: 0,
    },
    initial: 'idle',
    states: {
      // TODO: Load circle from database
      // TODO: Circle / character creation
      // TODO: Rename this state to something cooler
      idle: {
        description: 'The circle is waiting on their next assignment.',
        on: {
          START_ASSIGNMENT: 'onAssignment',
        },
      },
      // TODO: Consider launching some kind of session machine which tracks time, game log
      // TODO: Consider allowing GM to pause session if they need to end early
      onAssignment: {
        description: 'The circle is actively investigating some phenomenon.',
        on: {
          COMPLETE_ASSIGNMENT: 'debriefing',
        },
      },
      debriefing: {
        description:
          'The assignment has ended and the Lightkeeper is tallying the group’s advancement.',
        initial: 'askIlluminationQuestions',
        states: {
          askIlluminationQuestions: {
            description:
              'Ask three standard questions at the end of every assignment. For every “yes,” fill in a point on the Illumination track.',
            on: {
              NEXT: 'checkIlluminationKeys',
            },
          },
          checkIlluminationKeys: {
            description:
              'Ask how many of the players fulfilled at least one of their Illumination Keys. If nobody fulfilled any Keys, no Illumination is earned. If only part of the circle fulfilled theirs, the group earns 2 Illumination. If everybody fulfilled at least one Illumination Key, you earn 4 Illumination.',
            // TODO: Notify players last chance to select illumination keys
            // TODO: Calculate bonus illumination
            on: {
              NEXT: [
                {
                  guard: 'hasFullIlluminationTrack',
                  target: 'selectingAdvancements',
                  actions: 'resetIlluminationTrack',
                },
                {
                  target: 'debriefComplete',
                },
              ],
            },
          },
          selectingAdvancements: {
            description:
              'Players then choose two different character advancements individually and the circle chooses one new circle ability together.',
            on: {
              NEXT: 'debriefComplete',
            },
          },
          debriefComplete: {
            type: 'final',
          },
        },
        onDone: 'idle',
        on: {
          'UPDATE_ILLUMINATION.*': {
            target: undefined,
            actions: 'updateIlluminationPoints',
          },
        },
      },
    },
  },
  {
    actions: {
      resetIlluminationTrack: assign({
        illumination: ({ context }) =>
          context.illumination % MAX_ILLUMINATION_POINTS,
      }),
      updateIlluminationPoints: assign({
        illumination: ({ context: { illumination }, event }) => {
          let operator = /(?<=UPDATE_ILLUMINATION\.).*/.exec(event.type);

          if (operator === null) return illumination;

          let { points } = event as UpdateIlluminationPoints;

          switch (operator?.[0]) {
            case 'ADD':
              return illumination + points;
            case 'REMOVE':
              return illumination - points;
            case 'OVERRIDE':
              return points;
            default:
              return illumination;
          }
        },
      }),
    },
    guards: {
      hasFullIlluminationTrack: ({ context: { illumination } }) =>
        illumination >= 24,
    },
  }
);

export default circleMachine;
