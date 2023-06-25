import {
  CUNNING_ACTION_TYPES,
  DAMAGE_TYPES,
  INTUITION_ACTION_TYPES,
  NERVE_ACTION_TYPES,
} from '../constants';

type NerveActionTypeTuple = typeof NERVE_ACTION_TYPES;
export type NerveActionType = NerveActionTypeTuple[number];

type CunningActionTypeTuple = typeof CUNNING_ACTION_TYPES;
export type CunningActionType = CunningActionTypeTuple[number];

type IntuitionActionTypeTuple = typeof INTUITION_ACTION_TYPES;
export type IntuitionActionType = IntuitionActionTypeTuple[number];

export type AnyActionType =
  | NerveActionType
  | CunningActionType
  | IntuitionActionType;

type MarkTypeTuple = typeof DAMAGE_TYPES;

/**
 * Damage to a character’s health is tracked using marks,
 * which are made up of three different categories.
 */
export type DamageType = MarkTypeTuple[number];

/**
 * There are three available marks in each category.
 */
export type Marks = Record<Lowercase<DamageType>, number>;

/**
 * Scars represent the permanent changes that affect a character.
 */
export interface Scar {
  // Matches the track which caused the scar
  type: DamageType;
  // A description of the narrative change based on the nature of the attack that caused the scar
  description: string;
}
