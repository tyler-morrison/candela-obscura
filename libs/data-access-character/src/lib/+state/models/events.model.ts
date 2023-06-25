import { EventObject } from 'xstate';

import { AnyActionType, DamageType, Scar } from './damage.model';

export interface AddMarkEvent extends EventObject {
  type: 'ADD_MARK';
  damageType: DamageType;
}

export interface AddScarEvent extends EventObject {
  type: 'ADD_SCAR';
  damageType: DamageType;
}

export interface SaveScarEvent extends EventObject {
  type: 'SAVE_SCAR';
  scar: Scar;
}

export interface RecoverEvent extends EventObject {
  type: 'RECOVER';
}

export interface ShiftActionPointEvent extends EventObject {
  type: 'SHIFT_ACTION_POINT';
  from: AnyActionType;
  to: AnyActionType;
}

export type CharacterMachineEvents =
  | AddMarkEvent
  | AddScarEvent
  | SaveScarEvent
  | RecoverEvent
  | ShiftActionPointEvent;
