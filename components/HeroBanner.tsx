'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { urlFor } from '@/sanity/lib/image';
import type { PortfolioItem } from '@/sanity/lib/types';

const DEFAULT_AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD_PX = 40;

// a gallery piece shown in the hero rotation: the photo plus its stored
// upload dimensions (Sanity asset metadata, captured at upload time)
export type HeroSlide = Pick<PortfolioItem, 'image' | 'imgWidth' | 'imgHeight'>;

// separate client component: onContextMenu is a function prop, which can't
// cross the server/client boundary from a plain server component into
// next/image's <Image>
export function HeroBanner({
  heroItems,
  autoplayMs = DEFAULT_AUTOPLAY_MS,
}: {
  heroItems?: HeroSlide[];
  autoplayMs?: number;
}) {
  const images = heroItems ?? [];
  const t = useTranslations('Hero');
  const [index, setIndex] = useState(0);
  const dragStart = useRef<number | null>(null);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );

  // auto-advance; re-running on every index change (including a manual dot
  // click or swipe) restarts the countdown from that point
  useEffect(() => {
    if (images.length < 2) return;
    const id = setTimeout(next, autoplayMs);
    return () => clearTimeout(id);
  }, [index, images.length, next, autoplayMs]);

  if (images.length === 0) return null;

  return (
    <div>
      {/* fixed-height frame: every photo renders at the same height, its
          width following its own aspect ratio (object-contain, uncropped).
          The white background filling the leftover width matches the page,
          so narrower photos still read as one seamless band. */}
      <div
        className="relative h-[45vh] min-h-[220px] w-full touch-pan-y overflow-hidden bg-white sm:h-[55vh]"
        onPointerDown={(e) => {
          dragStart.current = e.clientX;
          e.currentTarget.setPointerCapture?.(e.pointerId);
        }}
        onPointerUp={(e) => {
          if (dragStart.current === null || images.length < 2) return;
          const dx = e.clientX - dragStart.current;
          dragStart.current = null;
          if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
          if (dx < 0) next();
          else prev();
        }}
      >
        {images.map((slide, i) => (
          <Image
            key={i}
            src={urlFor(slide.image).width(2400).auto('format').url()}
            alt=""
            // stored upload dimensions, so the browser knows each photo's
            // aspect ratio up front instead of deriving it after decode
            // (also replaces the fill + sizes="100vw" over-fetch)
            width={slide.imgWidth ?? 2400}
            height={slide.imgHeight ?? 1600}
            priority={i === 0}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className={`no-save absolute inset-0 m-auto h-full w-auto max-w-full object-contain transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          />
        ))}
      </div>

      {/* dots sit below the frame on the page background (not overlaid on
          the photo), so they stay visible whatever the photo's colors */}
      {images.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={t('photo', { number: i + 1 })}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index
                  ? 'bg-neutral-800'
                  : 'bg-neutral-300 hover:bg-neutral-500'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
