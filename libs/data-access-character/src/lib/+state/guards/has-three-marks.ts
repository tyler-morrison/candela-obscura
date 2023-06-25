import {
  CharacterMachineContext,
  CharacterMachineEvents,
  DamageType,
} from '../models';

export function hasThreeMarks({
  context: { marks },
  event,
}: {
  context: CharacterMachineContext;
  event: CharacterMachineEvents;
}) {
  if (event.type !== 'ADD_MARK') return false;

  let damageType = event.damageType.toLowerCase() as Lowercase<DamageType>;

  return marks[damageType] === 3;
}

export default hasThreeMarks;
