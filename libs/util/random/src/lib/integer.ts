export function randomInteger(max: number): number;
export function randomInteger(min: number, max: number): number;
export function randomInteger(minOrMaxArg: number, maxArg?: number) {
  let min, max;

  if (maxArg === undefined) {
    max = minOrMaxArg;
    min = 0;
  } else {
    max = maxArg;
    min = minOrMaxArg;
  }

  return Math.floor(Math.random() * (max - min + 1)) + Math.floor(min);
}

export default randomInteger;
