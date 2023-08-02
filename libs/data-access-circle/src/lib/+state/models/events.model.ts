export interface UpdateIlluminationPoints {
  type:
    | 'UPDATE_ILLUMINATION.*'
    | 'UPDATE_ILLUMINATION.ADD'
    | 'UPDATE_ILLUMINATION.REMOVE'
    | 'UPDATE_ILLUMINATION.OVERRIDE';
  points: number;
}

export type CircleMachineEvents =
  | { type: 'START_ASSIGNMENT' }
  | { type: 'COMPLETE_ASSIGNMENT' }
  | { type: 'NEXT' }
  | UpdateIlluminationPoints;
