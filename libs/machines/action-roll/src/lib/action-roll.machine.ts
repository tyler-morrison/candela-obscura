/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { roll } from '@darrington/util/dice';
import { and, assign, createMachine, not, or } from 'xstate';

export interface CandelaDice {
  result?: number;
  isGilded: boolean;
}

export interface ActionRollContext {
  baseRating: number;
  drive: number;
  gilded: number;
  dicePool: CandelaDice[];
  selected?: number;
}

export type ActionRollInputs = Partial<
  Pick<ActionRollContext, 'baseRating' | 'drive' | 'gilded'>
>;

export type ActionRollEvents =
  | { type: 'CANCEL' }
  | { type: 'ROLL_DICE' }
  | { type: 'ADD_DRIVE' }
  | { type: 'REMOVE_DRIVE' }
  | { type: 'ADD_GILDED' }
  | { type: 'REMOVE_GILDED' }
  | { type: 'SELECT_FINAL_RESULT'; selected: number };

export const actionRollMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QEMDGAXAlgewHYFoAnbAGxIGIBhAQQDlKBRAGQG0AGAXUVAAdtZMWPNxAAPRADYAjGwB0AJgAcATmWK2igKwAWeQGYA7IoA0IAJ6IDsvZr0yNbNlMVTNmqQF8PptEILEyWQAFQjAeZEJMXChyagAROIB9OIAlAEkANQZ2LiQQPgE-EXEEfBllbVlbCWk2AwMJN3l5UwsEPQkreTZ5CqltVSkGzS8fDBx-UhJg0PDI6PIUhgBZAHks5PSsnJECwQnixHxVPVl+mu09bU0ezRdWxDvKmwlVdw6DNjVRkF8JoimMzCESiMXiSQA4mkmHEGHEdnk9kU8iUyl9KtUJPIpFdlHY6g8EBJZAZtDjNPJtAY8bpDCNvL9xngAYEQsD5jElmsNlCYXCEbx+PthCijqorIpqQZXDd3C4TOYji5ZNoyZoKtpXnpFIo9PIfn9mQFpmy5qDFqsmExkmlGAL8kLkaBUerTsocWS6o0DHpDIT8BI5KrlBJdC4DL11IptAamZNWbMQQsUpbrXFbdkpLlBYUDqLSq7ZO6rjJhj6-YqEP15CTDP0QwNmmHY34WSbExyLVabXb5NmHbmRc6joXi56y76DIS9Moayo9GxtHVbBHPhIW-9jUCzQt7Ui88PShJdbI2Jpj51OmpJcpCcofdZ9AZ3M06kuDBujYCAOrIfbRAACPAAIAZTAEgwDjcgQOYBhKAAFUSAAxNJaGoa0lhAgBVJh4L3R0DzERAcSkaxGnVBormPL4p0rANKkcZ8XBnd16hsT942mX9-ygIDcFA8DIL8aDYIQ5DUPQxJMJwvCs12AihyIqttEUM55BqNwzw6JcJD0Ql+k0U8BjsKQpFUAY8XXBlDU42RKGQEhUAAVxIZAsEA1YnPQVBsAAWzAcgIDwMBZFgdA3JCmy2zshznNc9zeM87y-LAfDB1wQ5Sj1ORHDqZQKKcczCQ0tTnykQMQxMjjovsxyXLc0EAKSnz-NkLDcAAa1wbAAHdcHINLhQy-M7mJSNlEK-LtUJa5iUcG4LybMzPGsuMati+qEqaryWpC9qut6-qWDkxEFOGw9zxrS4hkY64ZRaStNAjKpyp9eQV16O5qq3Wq4oajydpStrOu6vqBr7eT0syy6VTsT433cJpip1WRjx0BoKgaSUrLGVsfo2+LGuaoH9tBo69H7fdFJKGHrvh0lEYpQl1FI91zw0d0l3U+lcc3QFfs2onAda0nDoG7RKbOzLrlOX0ahDbENGaHQ71DR9dIjc9VUlD9VrxwEUimAD7NwVBBIgQLgtC8L0Eitat0NshjeQU3zcGp0lLcKxXi9wxpXR2i2nOKoLM6RdMSuLwGW6iA4BEKLjUhobMrKZxVI6K5tYuGp-XkaUixlG488aIZ+m+wFTSTKAk491FTKXMjM5U7OJH0lQFHytR+mfL4pHe8vAm4rbgLAiC4xrwi66pVGdHvDpnEDd69MrKwbHxBwnBcNwVt5r9AgFwmAeS-yJ+px5SKGd7zwmrQlGcQli4UbXpWcN73QH6YD-+xLhb2kHDtPudJS9hTw926K4EMmNpy6VrFpaMug85Lh5oyfW+8Cbf22sfEKlBIhYFQA5UCTlUBm1gPAU6UN8yqFkOoL0ft3R50XDNOwp5TJPTvlGM8MY9Z8zQXVQ+P8sGyBAkQkhZCczJ3zCA9694b5sPIsvNoOhiT1D7rpa46kJp6A-jFPhGDiatWWJgUQkBCHELgGIgcEjDwgMuJcGwOlfRUk0MVLERYWLUhcDSPE2iv5bX0SFJCf4SBOVCIAzKVDL5uFeBoCk8pCT1GJDdMy6pyo6k6Nox2JBjZ+R4BBW2YT8z4F6BfIwl5ei9AaJceJagVTlXUjeRcVJFAZKNibM2EEIAFIus+VGKlFwVAmpcfQ+knAkh9O4LEeIjB2GQQnQEDBCDEEIF0pSRTPgqkaViNOvo7B3kUMSPUspvRnjqFHDwQA */
    id: 'action-roll',
    description: `*Candela Obscura* uses the *Illuminated Worlds* d6 dice pool system.
      When there is a question of whether something will happen,
      and there is a potential consequence if it doesn’t,you’ll make a roll using this pool of dice.`,
    types: {
      input: {} as ActionRollInputs,
      context: {} as ActionRollContext,
      events: {} as ActionRollEvents,
    },
    context: ({ input }) => ({
      baseRating: input?.baseRating || 0,
      drive: input?.drive || 0,
      gilded: input?.gilded || 0,
      dicePool: [],
      selected: undefined,
    }),
    initial: 'Preparing',
    on: {
      CANCEL: '.Roll Canceled',
    },
    states: {
      Preparing: {
        description: `Gather your dice pool and wait for any assistance from other players.`,
        entry: ['gatherDice', 'replaceGilded'],
        always: [
          {
            description: `ERROR: Invalid input`,
            guard: or([
              ({ context: { baseRating } }) => baseRating < 0 || baseRating > 3,
              ({ context: { drive } }) => drive < 0 || drive > 9,
              ({ context: { gilded } }) => gilded < 0,
            ]),
            target: 'Error',
          },
        ],
        on: {
          ADD_DRIVE: {
            description: `*Drives* are a resource you may expend and replenish during a session.
              They represent your character’s ability to push themselves past their standard capacity.
              You can spend 1 drive point to add an additional die (+1d) to a roll of an action that drive encompasses.`,
            guard: not('hasSixDice'),
            target: 'Preparing',
            actions: [assign({ drive: ({ context }) => ++context.drive })],
            reenter: true,
          },
          REMOVE_DRIVE: {
            guard: 'hasDrive',
            target: 'Preparing',
            actions: assign({ drive: ({ context }) => --context.drive }),
            reenter: true,
          },
          ADD_GILDED: {
            description: `Gilded dice **replace** the standard dice.
              They represent a character’s ability to recoup themselves after pushing their limits.`,
            target: 'Preparing',
            guard: not('hasGildedAllDice'),
            actions: assign({ gilded: ({ context }) => ++context.gilded }),
            reenter: true,
          },
          REMOVE_GILDED: {
            guard: 'isGilded',
            target: 'Preparing',
            actions: assign({ gilded: ({ context }) => --context.gilded }),
            reenter: true,
          },
          ROLL_DICE: [
            {
              description: `On gilded rolls, you may manually choose the gilded die,
                with the goal of recovering a drive point,
                even if the result is lower than one of the standard dice rolled in your dice pool.`,
              guard: and(['isGilded', not('isDisadvantage')]),
              target: 'Waiting on Selection',
              actions: {
                type: 'rollDice',
              },
            },
            {
              description: `If you have no points in an action and decide not to spend drive to add dice to the roll, you can still attempt the action.
                In that case, roll two dice and take the lower result.
                NOTE: You can’t get a critical success on this kind of roll (even if you roll two 6s).`,
              guard: 'isDisadvantage',
              target: 'Calculating Outcome',
              actions: ['rollDice', 'autoSelectLowestValue'],
            },
            {
              description: `For standard rolls, you take the highest result by default.`,
              target: 'Calculating Outcome',
              actions: ['rollDice', 'autoSelectHighestValue'],
            },
          ],
        },
      },

      'Waiting on Selection': {
        on: {
          SELECT_FINAL_RESULT: [
            {
              description: `If you choose the result on a gilded die,
                you recover 1 point of the drive associated with the action you rolled.`,
              guard: ({ context, event }) =>
                context.dicePool[event.selected].isGilded,
              target: 'Calculating Outcome',
              actions: [
                'sendAddDriveToPlayer',
                assign({ selected: ({ event }) => event.selected }),
              ],
            },
            {
              target: 'Calculating Outcome',
              actions: assign({ selected: ({ event }) => event.selected }),
            },
          ],
        },
      },
      // TODO: Consider hoisting these child states so that all outcomes trigger at same hierarchy
      'Calculating Outcome': {
        initial: 'Unknown',
        onDone: {
          target: 'Roll Complete',
          actions: 'sendOutcomeToGameLog',
        },
        states: {
          Unknown: {
            always: [
              {
                guard: and([
                  { type: 'resultIs', params: { value: 6 } },
                  'resultHasMultipleSixes',
                  not('isDisadvantage'),
                ]),
                target: 'Critical Success',
              },
              {
                guard: { type: 'resultIs', params: { value: 6 } },
                target: 'Success',
              },
              {
                guard: or([
                  { type: 'resultIs', params: { value: 5 } },
                  { type: 'resultIs', params: { value: 4 } },
                ]),
                target: 'Mixed Success',
              },
              {
                guard: or([
                  { type: 'resultIs', params: { value: 3 } },
                  { type: 'resultIs', params: { value: 2 } },
                  { type: 'resultIs', params: { value: 1 } },
                ]),
                target: 'Failure',
              },
              {
                description: `ERROR: There was an issue calculating the outcome of this roll.`,
                target: '#action-roll.Error',
              },
            ],
          },
          'Critical Success': {
            description: `You get what you want, and something extra.`,
            type: 'final',
            output: 'critical-success',
          },
          Success: {
            description: `You get what you want without any major unintended consequences.`,
            type: 'final',
            output: 'success',
          },
          'Mixed Success': {
            description: `You accomplish what you wanted, but it comes at a cost.`,
            type: 'final',
            output: 'mixed-success',
          },
          Failure: {
            description: `You don’t accomplish what you wanted, and there are consequences.`,
            type: 'final',
            output: 'failure',
          },
        },
      },

      'Roll Complete': {
        type: 'final',
      },

      'Roll Canceled': {
        type: 'final',
        output: 'canceled',
      },

      Error: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      autoSelectLowestValue: assign({
        selected: ({ context: { dicePool } }) => {
          let results = dicePool.map((dice) => dice.result || 0);
          return results.indexOf(Math.min(...results));
        },
      }),

      autoSelectHighestValue: assign({
        selected: ({ context: { dicePool } }) => {
          let results = dicePool.map((dice) => dice.result || 0);
          return results.indexOf(Math.max(...results));
        },
      }),

      gatherDice: assign({
        dicePool: ({ context: { baseRating, drive } }) => {
          let dice = baseRating + drive;

          // RULE: Actions with a rating of 0 will roll 2 dice and take lower value
          if (dice <= 0) dice = 2;

          // RULE: Dice pool can never exceed 6
          if (dice > 6) dice = 6;

          return Array<CandelaDice>(dice).fill({
            result: undefined,
            isGilded: false,
          });
        },
      }),

      replaceGilded: assign({
        dicePool: ({ context: { dicePool, gilded } }) =>
          dicePool.map((die, i) => ({ ...die, isGilded: i < gilded })),
      }),

      rollDice: assign({
        dicePool: ({ context }) =>
          context.dicePool.map((die) => ({
            ...die,
            result: roll('d6') as number,
          })),
      }),

      // TODO: Refine output payload for game machine
      sendOutcomeToGameLog: undefined,

      // TODO: Refine output payload for the drive recovery event sent to player machine
      // TODO: Need a way to distinguish which kind of drive to recover
      sendAddDriveToPlayer: undefined,
    },

    guards: {
      hasDrive: ({ context }) => !!context.drive,

      hasGildedAllDice: ({ context: { dicePool, gilded } }) =>
        dicePool.length === gilded,

      hasSixDice: ({ context }) => context.dicePool.length === 6,

      isDisadvantage: ({ context }) => context.baseRating + context.drive === 0,

      isGilded: ({ context }) => !!context.gilded,

      resultIs: ({ context: { dicePool, selected }, guard }) => {
        return (
          selected !== undefined &&
          typeof dicePool[selected] !== undefined &&
          dicePool[selected].result === guard.params!['value']
        );
      },

      resultHasMultipleSixes: ({ context }) =>
        context.dicePool.filter((die) => die.result === 6).length > 1,
    },
  }
);

export default actionRollMachine;
