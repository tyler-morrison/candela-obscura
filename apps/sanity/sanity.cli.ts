import { defineCliConfig } from 'sanity/cli';
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineCliConfig({
  api: {
    projectId: 'jwy2kquj',
    dataset: 'production',
  },
  vite: {
    plugins: [
      viteTsConfigPaths({
        root: '../../',
      }),
    ]
  }
});
