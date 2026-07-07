'use client';

import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import type { SiteSettings } from '@/sanity/lib/types';

// separate client component: onContextMenu is a function prop, which can't
// cross the server/client boundary from a plain server component into
// next/image's <Image>
export function HeroBanner({
  heroImage,
}: {
  heroImage: SiteSettings['heroImage'];
}) {
  if (!heroImage) return null;

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 sm:aspect-[16/9]">
      <Image
        src={urlFor(heroImage).width(2400).auto('format').url()}
        alt=""
        fill
        priority
        sizes="100vw"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        className="no-save object-cover"
      />
    </div>
  );
}
