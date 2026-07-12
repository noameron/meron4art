import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // ISR already caches rendered pages; reading through Sanity's CDN would
  // stack its own ~60s staleness on top, so a revalidation could bake in
  // data that is already out of date. Fetch fresh from the API instead.
  useCdn: false,
});
