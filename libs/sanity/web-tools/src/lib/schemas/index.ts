import type { SchemaTypeDefinition } from '@sanity/types';

import ability from './ability';
import action from "./action";
import drive from "./drive";
import role from "./role";
import specialty from "./specialty";

export const schemaTypes: SchemaTypeDefinition[] = [role, specialty, action, ability, drive];
