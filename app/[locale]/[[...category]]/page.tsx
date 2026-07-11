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

const HERO_IMAGE_COUNT = 5;

// Only photos uploaded at least this tall qualify for the hero: a shorter
// photo would have to upscale to fill the frame's height and turn soft.
// 800px covers the frame's rendered height (55vh) on typical desktop
// viewports; taller photos are simply scaled down by the frame, which
// preserves their aspect ratio exactly (object-contain never stretches).
const MIN_HERO_IMAGE_HEIGHT_PX = 800;

// Fisher-Yates shuffle of a copy; used to draw the hero photos. Runs at
// build/ISR revalidation time, so the pick rotates over time (at most once
// a minute), not on every page view.
function randomSample<T>(list: T[], count: number): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

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

  // the hero rotation is drawn from the gallery itself, not a separate
  // Studio-managed photo set; the items carry their stored upload
  // dimensions, so the banner never has to derive them on the fly.
  // Photos below the height cutoff (or missing their stored dimensions)
  // are skipped rather than upscaled; if none qualify, no hero is shown.
  const heroItems = randomSample(
    items.filter(
      (item) => (item.imgHeight ?? 0) >= MIN_HERO_IMAGE_HEIGHT_PX,
    ),
    HERO_IMAGE_COUNT,
  );

  return (
    <main>
      {/* once-per-session animated intro, home tab only */}
      {active === 'all' && <IntroOverlay />}
      <GalleryGrid
        items={items}
        active={active}
        banner={<HeroBanner heroItems={heroItems} />}
        aboutImage={settings?.aboutImage}
      />
    </main>
  );
}
