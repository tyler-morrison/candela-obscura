import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { blogSchemas, toolsSchemas } from './schemas';

export default defineConfig([
  {
    name: 'marketing',
    title: 'Candela Obscura (Marketing)',
    basePath: '/blog',

    projectId: 'jwy2kquj',
    dataset: 'production',

    plugins: [deskTool(), visionTool()],

    schema: {
      types: blogSchemas,
    },
  },
  {
    name: 'tools',
    title: 'Candela Obscura (Tools)',
    basePath: '/tools',

    projectId: '2u5t0kss',
    dataset: 'production',

    plugins: [deskTool(), visionTool()],

    schema: {
      types: toolsSchemas,
    },
  },
]);
