import { InferSchemaValues } from '@sanity-typed/types';
import { visionTool } from '@sanity/vision';
import type { WorkspaceOptions } from 'sanity';
import { deskTool } from 'sanity/desk';
import { schemaTypes as types } from './schemas';

export const marketingConfig: WorkspaceOptions = {
  name: 'marketing',
  projectId: '',
  dataset: '',
  title: 'Blog',
  subtitle: 'Candela Obscura',
  basePath: '/blog',
  plugins: [deskTool(), visionTool()],
  schema: {
    types,
  },
};

export default marketingConfig;

export type MarketingSchema = InferSchemaValues<typeof marketingConfig>;
