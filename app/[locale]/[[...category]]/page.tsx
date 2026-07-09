import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { client } from '@/sanity/lib/client';
import {
  allPortfolioItemsQuery,
  siteSettingsQuery,
} from '@/sanity/lib/queries';
import {
  FILTER_VALUES,
  type FilterValue,
  type PortfolioItem,
  type SiteSettings,
} from '@/sanity/lib/types';
import { routing } from '@/i18n/routing';
import { HeroIntro, HeroBanner } from '@/components/Hero';
import GalleryGrid from '@/components/GalleryGrid';

// ISR: re-fetch Sanity content at most once a minute so newly published
// artwork appears without a manual redeploy.
export const revalidate = 60;

// Pre-render every locale × tab: /en, /en/paintings, ... /he/contact
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    FILTER_VALUES.map((value) => ({
      locale,
      category: value === 'all' ? [] : [value],
    })),
  );
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string; category?: string[] }>;
}) {
  const { locale, category } = await params;
  setRequestLocale(locale);

  const active = (category?.[0] ?? 'all') as FilterValue;
  if (!FILTER_VALUES.includes(active)) notFound();

  const [items, settings] = await Promise.all([
    client.fetch<PortfolioItem[]>(allPortfolioItemsQuery),
    client.fetch<SiteSettings | null>(siteSettingsQuery),
  ]);

  return (
    <main>
      <GalleryGrid
        items={items}
        active={active}
        intro={<HeroIntro />}
        banner={<HeroBanner heroImages={settings?.heroImages} />}
      />
    </main>
  );
}
