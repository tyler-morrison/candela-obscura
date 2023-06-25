import { CharacterMachineContext } from '../models';

export function hasThreeScars({
  context: { scars },
}: {
  context: CharacterMachineContext;
}) {
  return scars.length === 3;
}

export default hasThreeScars;
