import type { SchemaTypeDefinition } from '@sanity/types';

import author from './author';
import blockContent from './blockContent';
import category from './category';
import post from './post';

export const schemaTypes: SchemaTypeDefinition[] = [
  post,
  author,
  category,
  blockContent,
];
