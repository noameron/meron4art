import type { StructureResolver } from 'sanity/structure';
import { SITE_SETTINGS_ID } from './schemaTypes/siteSettings';

// Lock the desk down to just what editors need: the portfolio list, and a
// single fixed Site Settings document (no "create new" for the singleton).
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('portfolioItem').title('Portfolio Items'),
      S.listItem()
        .title('Site Settings')
        .child(
          S.document().schemaType('siteSettings').documentId(SITE_SETTINGS_ID),
        ),
    ]);
