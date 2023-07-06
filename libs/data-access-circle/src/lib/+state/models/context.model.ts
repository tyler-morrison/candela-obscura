export interface CircleMachineContext {
  /**
   * Illumination is used to track the collective progress of the circle.
   * Once the track reaches 24 points, the points should be reset and leftover Illumination counts towards the next advancement cycle.
   */
  illumination: number;
}
