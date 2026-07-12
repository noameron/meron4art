// One-time cleanup, run with:
//   npx sanity exec sanity/migrations/2026-07-12-fix-category-and-hero.ts --with-user-token
//
// 1. While the fix/v4 schema was deployed, re-saved portfolio items got the
//    display label 'Sculptures & More' stored as their category value. The
//    stable internal value is '3d-sculpture' (labels and URL slugs map from
//    it in sanity/lib/types.ts), so this rewrites those documents back.
// 2. siteSettings still carries the removed heroImages field, which makes
//    the Studio warn "Unknown field found"; this unsets it.
import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2024-01-01' });

async function run() {
  const items = await client.fetch<{ _id: string }[]>(
    '*[_type == "portfolioItem" && category == "Sculptures & More"]{_id}',
  );
  for (const item of items) {
    await client.patch(item._id).set({ category: '3d-sculpture' }).commit();
    console.log(`category fixed on ${item._id}`);
  }
  console.log(`${items.length} portfolio item(s) updated`);

  const settingsDocs = await client.fetch<{ _id: string }[]>(
    '*[_id in ["siteSettings", "drafts.siteSettings"] && defined(heroImages)]{_id}',
  );
  for (const doc of settingsDocs) {
    await client.patch(doc._id).unset(['heroImages']).commit();
    console.log(`heroImages removed from ${doc._id}`);
  }
  if (settingsDocs.length === 0) console.log('no stale heroImages found');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
