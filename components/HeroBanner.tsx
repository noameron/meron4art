'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { urlFor } from '@/sanity/lib/image';
import type { SiteSettings } from '@/sanity/lib/types';

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD_PX = 40;

// separate client component: onContextMenu is a function prop, which can't
// cross the server/client boundary from a plain server component into
// next/image's <Image>
export function HeroBanner({
  heroImages,
}: {
  heroImages: SiteSettings['heroImages'];
}) {
  const images = heroImages ?? [];
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

  // auto-advance every 5s; re-running on every index change (including a
  // manual dot click or swipe) restarts the countdown from that point
  useEffect(() => {
    if (images.length < 2) return;
    const id = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, images.length, next]);

  if (images.length === 0) return null;

  return (
    <div
      className={`relative aspect-[4/5] w-full touch-pan-y overflow-hidden bg-neutral-100 sm:aspect-[16/9] ${
        images.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
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
      {images.map((image, i) => (
        <Image
          key={i}
          src={urlFor(image).width(2400).auto('format').url()}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className={`no-save object-cover transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />
      ))}

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={t('photo', { number: i + 1 })}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
