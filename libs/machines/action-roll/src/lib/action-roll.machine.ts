/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { roll } from '@darrington/util/dice';
import { and, assign, choose, createMachine, not, or, raise } from 'xstate';

export interface CandelaDice {
  result?: number;
  isGilded: boolean;
}

export interface RollResult {
  outcome:
    | 'critical-success'
    | 'success'
    | 'mixed-success'
    | 'failure'
    | 'canceled'
    | 'error';
  rolled: Required<CandelaDice>[];
  selected: number;
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
  | { type: 'ERROR'; message: string }
  | { type: 'ROLL_DICE' }
  | { type: 'ADD_DRIVE' }
  | { type: 'REMOVE_DRIVE' }
  | { type: 'ADD_GILDED' }
  | { type: 'REMOVE_GILDED' }
  | { type: 'SELECT_FINAL_RESULT'; selected: number };

export const actionRollMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QEMDGAXAlgewHYFoAnbAGxIGIBhAQQDlKBRAGQG0AGAXUVAAdtZMWPNxAAPRAE4ATADYAdDJls2ADikqArEq0AaEAE9E+AIzGVctVIDMqqcYkaVAdg1OAvm71ohBYmXIMAEqBAPKB7FxIIHwCPiLiCE6qclYALKnGTs5Jqll6hggmZhZS1mzGjjLWxlIaHl4YOL6kJHIACoRgPMiEmLhQ5NQAIkMA+kOBAJIAagwRIjGCTfFGxmwSqXIaVoprTk4yGhql+Yg7TnJSbFIbxqkSEpmH9SDeTUQt7Z3dvf3kgQwALIhWbjKazeZRRZxKIJfAPKxyO6KVJpDTXRzGU4IRybKxaB4aYzndYqF5vPAfMhfLo9PoDYZjADikyYQwYQ0hvH4S2EsNW60220UdjSEise2x8icGXxUlSTnFqWsLnJjUpflaHVpvwGAOBoJZbI5XOiPJhoDhDwuzgkTgq6KJKjM2Pwzrk6QqG1SMnFKhUVikap8VK13zpf1CTCY40mjFN0OW-MKGnFckeaT2hycVisTldSg99xkyudThuKlUqWD701NJ+9P+IWjsfjxki3NiSctRlTiIzGTYB1cufzBkQdykchz9uL91KpZrGs+2obkebMaGcbmUg7Zq7fJ7KbTA6zI7z2Ks0gs4rYqSH23LSRkS+a1IA6sglv0AAR4H8AMpgCQYDqrg5AAcwDCUAAKqMABiky0NQMYAgBACqTAwQm5rdmIE4SikhxaPsVQ5nYMgFpsyguBId52POaSvqGciUMgJCoAAriQyBYL+IScegqDYAAtmA5A4QeuArDibCIqYEhKIq5aTqk2J3OYOa5leZjWD6UjuJ4rxgSxbEcdxvH0j+AlCaJ4ksO2Cy4Ye+EIAqEiXMc952jYQ47Je6xIuidFrDILjGCWVjMXWZlcTxfFQNZgnCWJEm7k5Ukye5nnyusOY0Xmanjm5JYKIoqYys4+LXC+RkUm+rSxRZCVJbZqUsFYe6Ji5CTZbUuU+QVMpSjYChZPeLhqOUObRZ8TXxVZNkpfZqRdc50nJrlHraHmgamBkGxSkOFjlleEoHNcGweEZuDYBAcAiPVoYZbyG1HkU-pEWk6QqCiiiumkiI3DsxH2AGxLVnVJl1quEZQC9FquUU95fekqS-SW-3FWYHk3KmzoKsFNR1FDIZ1p+36Jf+QEgWBCN4XCdwXIc9w5jIZhKLUVjYhc+ISsolblM6RzGLN1LzZZ-HJXZ9M9YgFFIgG6h8+dGQaOpCqXIGvprKUEhqGLjW9FgqDsYBnGoKgcDwFC60yTIAZIrkxxEr6igqOp1jTlemg7OjDg5qLpO1p8AEW1bsA252r325W072Drwt2vs2LKx6bAaAqbC+ne6Mkw0ZOfICmCiJA5uW9bstva5DvGNORLlvK-r3lixWouY0imGFpjXGoTHB8u1LwV+JCcZ0Vf24qCiBvOVTOqoHvFUomzijc+xXPc9xRQPDVyIELQ-mxuBWyBEAT8mKjXkLxJaASclFQUJgaNOjzqKUViaFvQ6G3IDCEMQhBz5HgdlOX6-pfquEdJRYq+AryXCqj6GU9EtDXTcEAA */
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
    entry: choose([
      {
        guard: ({ context: { baseRating } }) =>
          baseRating < 0 || baseRating > 3,
        actions: raise({
          type: 'ERROR',
          message:
            'Invalid Input (baseRating): Each action can have a rating 0-3.',
        }),
      },
      {
        guard: ({ context: { drive } }) => drive < 0 || drive > 9,
        actions: raise({
          type: 'ERROR',
          message:
            'Invalid Input (drive): Each player can have 0-9 drive points per ability.',
        }),
      },
      {
        guard: ({ context: { gilded } }) => gilded < 0,
        actions: raise({
          type: 'ERROR',
          message:
            'Invalid Input (gilded): The gilded input cannot be negative.',
        }),
      },
    ]),
    initial: 'Preparing',
    on: {
      CANCEL: '.Roll Canceled',
      ERROR: '.Error',
    },
    states: {
      Preparing: {
        description: `Gather your dice pool and wait for any assistance from other players.`,
        entry: ['gatherDice', 'replaceGilded'],
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
          SELECT_FINAL_RESULT: {
            description: `If you choose the result on a gilded die,
              you recover 1 point of the drive associated with the action you rolled.`,
            guard: ({ context, event }) =>
              context.dicePool[event.selected].isGilded,
            target: 'Calculating Outcome',
            actions: [
              assign({ selected: ({ event }) => event.selected }),
              'maybeRecoverDrive',
            ],
          },
        },
      },

      'Calculating Outcome': {
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
            target: undefined,
            actions: raise({
              type: 'ERROR',
              message:
                'There was an issue calculating the outcome of this roll.',
            }),
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

      'Roll Canceled': {
        type: 'final',
        output: 'canceled',
      },

      // TODO: Investigate alternative error handling patterns.
      Error: {
        type: 'final',
        entry: ({ event }) => {
          if (event.type !== 'ERROR') return;
          throw new Error(event.message);
        },
      },
    },
    output: ({ context, event }) =>
      ({
        outcome: event.output,
        rolled: context.dicePool,
        selected: context.selected,
      } as RollResult),
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
      maybeRecoverDrive: undefined,
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
