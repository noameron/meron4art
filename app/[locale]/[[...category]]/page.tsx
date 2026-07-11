import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { client } from '@/sanity/lib/client';
import {
  allPortfolioItemsQuery,
  siteSettingsQuery,
} from '@/sanity/lib/queries';
import {
  FILTER_SLUGS,
  FILTER_VALUES,
  filterForSlug,
  type PortfolioItem,
  type SiteSettings,
} from '@/sanity/lib/types';
import { routing } from '@/i18n/routing';
import { HeroBanner } from '@/components/Hero';
import GalleryGrid from '@/components/GalleryGrid';
import IntroOverlay from '@/components/IntroOverlay';

// ISR: re-fetch Sanity content at most once a minute so newly published
// artwork appears without a manual redeploy.
export const revalidate = 60;

// Pre-render every locale × tab: /en, /en/paintings-drawings, ... /he/contact
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    FILTER_VALUES.map((value) => ({
      locale,
      category: value === 'all' ? [] : [FILTER_SLUGS[value]],
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

  const segment = category?.[0];
  const active = segment === undefined ? 'all' : filterForSlug(segment);
  if (!active) notFound();

  const [items, settings] = await Promise.all([
    client.fetch<PortfolioItem[]>(allPortfolioItemsQuery),
    client.fetch<SiteSettings | null>(siteSettingsQuery),
  ]);

  return (
    <main>
      {/* once-per-session animated intro, home tab only */}
      {active === 'all' && <IntroOverlay />}
      <GalleryGrid
        items={items}
        active={active}
        banner={<HeroBanner heroImages={settings?.heroImages} />}
        aboutImage={settings?.aboutImage}
      />
    </main>
  );
}
