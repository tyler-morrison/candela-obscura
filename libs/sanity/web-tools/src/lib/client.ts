import { createClient } from '@sanity-typed/client';
import { WebToolsSchema } from './sanity.config';

declare global {
  interface Window {
    ENV: {
      SANITY_PROJECT_ID: string;
      SANITY_DATASET: string;
      SANITY_USE_CDN: boolean;
    };
  }
}

const { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_USE_CDN } =
  typeof document === 'undefined' ? process.env : window.ENV;

if (!SANITY_PROJECT_ID || !SANITY_DATASET) {
  throw new Error('Did you forget to run sanity init --env?');
}

export const client = createClient<WebToolsSchema>()({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  useCdn: SANITY_USE_CDN === 'true',
  apiVersion: '2023-08-16',
});

export default client;
