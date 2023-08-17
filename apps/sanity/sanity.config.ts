import { marketingConfig } from '@darrington/sanity/marketing';
import { webToolsConfig } from '@darrington/sanity/web-tools';
import { defineConfig } from 'sanity';

export default defineConfig([
  {
    ...marketingConfig,
    projectId: process.env.SANITY_STUDIO_MARKETING_PROJECT_ID!,
    dataset: process.env.SANITY_STUDIO_MARKETING_DATASET!,
  },
  {
    ...webToolsConfig,
    projectId: process.env.SANITY_STUDIO_TOOLS_PROJECT_ID!,
    dataset: process.env.SANITY_STUDIO_TOOLS_DATASET!,
  },
]);
