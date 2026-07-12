import { revalidatePath } from 'next/cache';

// Called by the Studio tools (bulk upload, reorder) right after a save, so
// content changes go live on the next page load instead of waiting out the
// 60s ISR window.
// ponytail: unauthenticated — the Studio runs in the browser, so any secret
// shipped to it would be public anyway, and the worst an abuser can do is
// bust the page cache. Gate behind a server-checked token if that ever hurts.
export async function POST() {
  revalidatePath('/', 'layout');
  return Response.json({ revalidated: true });
}
