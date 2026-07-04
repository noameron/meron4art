import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { urlFor } from '@/sanity/lib/image';
import type { SiteSettings } from '@/sanity/lib/types';

export default async function Hero({
  heroImage,
}: {
  heroImage: SiteSettings['heroImage'];
}) {
  const t = await getTranslations('Hero');

  return (
    <header>
      {/* Banner renders only once a hero photo is set in Studio; until then
          the intro section below is the top of the page. */}
      {heroImage && (
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 sm:aspect-[16/9]">
          <Image
            src={urlFor(heroImage).width(2400).auto('format').url()}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="p-6 sm:p-12">
        <h1 className="max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-5xl">
          {t('name')}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
          {t('bio')}
        </p>
      </div>
    </header>
  );
}
