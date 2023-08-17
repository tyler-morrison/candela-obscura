import { InferSchemaValues } from '@sanity-typed/types';
import { visionTool } from '@sanity/vision';
import type { WorkspaceOptions } from 'sanity';
import { deskTool } from 'sanity/desk';
import { schemaTypes as types } from './schemas';

export const webToolsConfig: WorkspaceOptions = {
  name: 'tools',
  projectId: '',
  dataset: '',
  title: 'Web Tools',
  subtitle: 'Candela Obscura',
  basePath: '/tools',
  plugins: [deskTool(), visionTool()],
  schema: {
    types,
  },
};

export default webToolsConfig;

export type WebToolsSchema = InferSchemaValues<typeof webToolsConfig>;
