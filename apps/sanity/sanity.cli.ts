import { defineCliConfig } from 'sanity/cli';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_MARKETING_PROJECT_ID!,
    dataset: process.env.SANITY_STUDIO_MARKETING_DATASET!,
  },
  graphql: [
    {
      id: "marketing",
      workspace: "marketing",
    },
    {
      id: "tools",
      workspace: "tools",
    },
  ],
  vite: {
    plugins: [
      viteTsConfigPaths({
        root: '../../',
      }),
    ],
  },
});
