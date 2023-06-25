import { Marks, Scar } from './damage.model';

export interface CharacterMachineContext {
  characterId: string;
  creatorId: string;
  marks: Marks;
  scars: Scar[];
}
