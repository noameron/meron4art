import { setRequestLocale } from 'next-intl/server';
import { client } from '@/sanity/lib/client';
import {
  allPortfolioItemsQuery,
  siteSettingsQuery,
} from '@/sanity/lib/queries';
import type { PortfolioItem, SiteSettings } from '@/sanity/lib/types';
import { HeroIntro, HeroBanner } from '@/components/Hero';
import GalleryGrid from '@/components/GalleryGrid';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [items, settings] = await Promise.all([
    client.fetch<PortfolioItem[]>(allPortfolioItemsQuery),
    client.fetch<SiteSettings | null>(siteSettingsQuery),
  ]);

  return (
    <main>
      <GalleryGrid
        items={items}
        intro={<HeroIntro />}
        banner={<HeroBanner heroImage={settings?.heroImage} />}
      />
    </main>
  );
}
