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
  title?: LocalizedString;
  image: SanityImageSource;
}

export const CATEGORY_VALUES: Category[] = [
  'paintings',
  'gallery-pictures',
  '3d-sculpture',
];

export interface SiteSettings {
  heroImage?: SanityImageSource;
}
