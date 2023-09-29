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
    /** @xstate-layout N4IgpgJg5mDOIC5QEMDGAXAlgewHYFoAnbAGxIGIBhAQQDlKBRAGQG0AGAXUVAAdtZMWPNxAAPRAHYAjAA4AdDICsAJmUAWAJxtVitTIkAaEAE9E+Ccrna1bGcokA2Ng4syAzAF8PRtEILEyOQAFQjAeZEJMXChyagAROIB9OIAlAEkANQZ2LiQQPgE-EXEEfCk2DTU5RTcHB3KJR0UVZSNTBFqJOWVtSqlNDSkmrx8MHH9SEmDQ8Mjo8hSGAFkAeSzk9KyckQLBceKzDQ03OX66tTc1RW1FGSk2xFuqt0UHI8UpToqZEZBfcaIk2mYQiURi8SSAHE0kw4gw4ts8rsinkSmUKlUanVlJ9NG4Gg8EA45BI1J8VGoJMc1Mo3BJFL9-nhAYEQiC5jFFqt1tDYfDEbx+HthKjDhouvpxVJmmwPncZIT8Hc5GoyYpKmo3m4ZO5lIyxsyAlM2bMwQsVkwmMk0owBfkhSjQGj1SdBpcGg5FBI3HTFU4VZoHDS7hYNDJbGp9X4WcaZqD5ikLVa4jbslJcoLCvtRaUXXI3WS2E1vb6TIh+pZvdJA5pVMGowCjcDTQmk9bbcoM-asyKnWY8wWPV6fYYyx0NJYZMc2DZ6XT7M4G4agSb4zE7cjs33SnoSfUpDihrYZEHWmPGhpuhftLVynSHEuJoEAOrIPbRAAEeA-AGUwCQwANXByB-ZgGEoAAVRIADE0loagrUWH8AFUmAgjcHS3MRy3xORamaFxHHsNwcQcP0qjYIt1RnHFa0uR8YzkShkBIVAAFcSGQLBPxWNj0FQbAAFswHIDCe1wA4EGuE4pCkDQnCpCwKzUQl+nkEsfUGOxLgcewGKbZjWI4riwQ-Xj+KEkSWHTHZMN7bCEEpS9lApCpvUo70yLHNwKlOa4tHKFwPiDTxvD+IDGMM9jOO4qAzL4gThNEztbPEySnO6VzxR8os6RUsdNSqOpPXFPRvWuZQHzCpknymKLjNi+KLKSlg3C7Td7JKDKXPUNycqrfL2gcHy5BcGRZ1uHohlC0ZowMljopMniEss0S1HauyJJzbqKV0RxnHpKQvPaCRwysZQwwug8NJ+X5cGwCA4BEGqY1S4Utu3MpZHkWpLlVE8gzqRV7CkfNpVeNwtFsD4vX0lc4w5N7HQcr6bDw4bVT0c4gbHWRnI0dU7kpfyDwZaqIqbV93zi78-wAoCkawtF+i6T1NE82QnBctxCS6F58Uo8M2FkcGpDhwJ6pi0zzMSsBGc6xBSNOXUKjpInKVUyluhIlwLkaO5bAkcW6siLBUBY382NQVA4HgJFNskhx3FOQ2VGC+SndU2kSUhpRaj0AnvTF8m5qBH8rZt2A7czd7HbO6R5K06VxUaQllGdmw9ucLR-rJ2bGyBJZMFESBLet235Y+hyndBw6LHUHUbHuArtXzQ8XFk7RtMjEOC8CaC3xINjQkrx2qVGkja10g2dUJJwqmOC7Gh6TQ8WNuQUkmD9mNwG2AIgUecydqocS7oMyUDs8hpd4bvQnVUz-XhhCGIQhD+3GvqgvyijtVI7RxOo4aoPksbC0aD6PUXgPBAA */
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
            guard: or([
              ({ context: { baseRating } }) => baseRating < 0 || baseRating > 3,
              ({ context: { drive } }) => drive < 0 || drive > 9,
              ({ context: { gilded } }) => gilded < 0,
            ]),
            target: 'Error',
            meta: {
              error: `ERROR: Invalid input`,
            },
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
            target: '#action-roll.Error',
            meta: {
              error: `ERROR: There was an issue calculating the outcome of this roll.`,
            },
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

      Error: {
        type: 'final',
      },
    },
    output: ({ context, event }) => ({
      outcome: event.output,
      rolled: context.dicePool,
      selected: context.selected,
    }),
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
