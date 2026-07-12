import type { SanityImageSource } from '@sanity/image-url';

export type Category = 'paintings' | 'gallery-pictures' | '3d-sculpture';

export interface LocalizedString {
  en: string;
  he: string;
}

export interface PortfolioItem {
  _id: string;
  category: Category;
  artistName?: LocalizedString;
  image: SanityImageSource;
  // raw, untransformed Sanity CDN asset URL (image.asset->url) — the
  // portfolio grid/lightbox render this directly, with no resize/compression
  imageUrl: string;
  // intrinsic pixel dimensions, used to render each image at its true
  // aspect ratio (uncropped) within a fixed column width
  imgWidth?: number;
  imgHeight?: number;
}

export const CATEGORY_VALUES: Category[] = [
  'paintings',
  '3d-sculpture',
  'gallery-pictures',
];

// Public-facing URL slug for each category, kept separate from the Category
// value itself (which is also what's stored in each Sanity document's
// `category` field) — so a headline/URL wording change never requires a
// content migration.
export const CATEGORY_SLUGS: Record<Category, string> = {
  paintings: 'paintings-drawings',
  '3d-sculpture': 'sculptures',
  'gallery-pictures': 'shows',
};

export type FilterValue = Category | 'all' | 'about' | 'contact';

// tab order in the nav; also the set of valid /[locale]/<segment> routes
export const FILTER_VALUES: FilterValue[] = [
  'all',
  ...CATEGORY_VALUES,
  'about',
  'contact',
];

// URL slug for every filter that isn't 'all' (which has no segment of its own)
export const FILTER_SLUGS: Record<Exclude<FilterValue, 'all'>, string> = {
  ...CATEGORY_SLUGS,
  about: 'about',
  contact: 'contact',
};

const SLUG_TO_FILTER: Record<string, FilterValue> = Object.fromEntries(
  (Object.keys(FILTER_SLUGS) as Exclude<FilterValue, 'all'>[]).map((value) => [
    FILTER_SLUGS[value],
    value,
  ]),
);

// 'all' is the bare locale route (/en); others are /en/<slug>
export const pathForFilter = (value: FilterValue) =>
  value === 'all' ? '/' : `/${FILTER_SLUGS[value]}`;

// reverse of pathForFilter: turns a URL segment back into the internal
// filter identifier, or undefined if it doesn't match any known route
export const filterForSlug = (segment: string): FilterValue | undefined =>
  SLUG_TO_FILTER[segment];

// intrinsic pixel dimensions travel with the photo so the layout can render
// it at its true aspect ratio (uncropped)
export type SizedImage = SanityImageSource & {
  imgWidth?: number;
  imgHeight?: number;
};

export interface SiteSettings {
  aboutImage?: SizedImage;
}
