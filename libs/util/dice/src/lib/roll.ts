import { randomInteger } from '@darrington/util/random';

function roll(diceNotation: string) {
  let parsedNotation = new RegExp(/(?<quantity>\d*)?(?:d)(?<faces>\d*)/).exec(
    diceNotation
  )?.groups;

  if (!parsedNotation) {
    throw new Error(
      'Invalid dice notation. Please use the standard `AdX` format.'
    );
  }

  let [quantity, faces] = Object.values(parsedNotation).map((str) =>
    str ? parseInt(str) : 1
  );

  let result = () => randomInteger(1, faces);

  if (quantity === 1) return result();

  return Array(quantity).fill(undefined).map(result);
}

export default roll;
