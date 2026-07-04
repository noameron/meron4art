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
  // intrinsic pixel dimensions, used to render each image at its true
  // aspect ratio (uncropped) within a fixed column width
  imgWidth?: number;
  imgHeight?: number;
}

export const CATEGORY_VALUES: Category[] = [
  'paintings',
  'gallery-pictures',
  '3d-sculpture',
];

export type FilterValue = Category | 'all' | 'contact';

// tab order in the nav; also the set of valid /[locale]/<segment> routes
export const FILTER_VALUES: FilterValue[] = [
  'all',
  ...CATEGORY_VALUES,
  'contact',
];

// 'all' is the bare locale route (/en); others are /en/<value>
export const pathForFilter = (value: FilterValue) =>
  value === 'all' ? '/' : `/${value}`;

export interface SiteSettings {
  heroImage?: SanityImageSource;
}
