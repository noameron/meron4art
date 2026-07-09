'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { urlFor } from '@/sanity/lib/image';
import type { SiteSettings } from '@/sanity/lib/types';

const AUTOPLAY_MS = 10000;
const SWIPE_THRESHOLD_PX = 40;
// used when a photo's dimensions aren't available (the legacy single-image
// fallback doesn't carry them) or before any photo has loaded
const DEFAULT_ASPECT_RATIO = 4 / 5;
// cap on how tall the banner can get, expressed as vh — a landscape photo
// at full viewport width can otherwise dwarf a short/wide browser window
// and push the dots off screen. Capped by shrinking width (and centering),
// never by clamping height directly, or the box would stop matching the
// photo's own ratio and reintroduce the letterbox gaps this is meant to
// avoid.
const MAX_HEIGHT_VH = 70;

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

  // match the frame to the current photo's own aspect ratio so it always
  // fills edge to edge — a fixed ratio left gaps (the container's fallback
  // background showing through) for any photo shaped differently from it.
  const current = images[index];
  const ratio =
    current?.imgWidth && current?.imgHeight
      ? current.imgWidth / current.imgHeight
      : DEFAULT_ASPECT_RATIO;

  return (
    <div
      className="relative mx-auto touch-pan-y overflow-hidden bg-neutral-100 transition-[aspect-ratio,width] duration-700"
      style={{
        aspectRatio: `${ratio}`,
        width: `min(100%, calc(${MAX_HEIGHT_VH}vh * ${ratio}))`,
        minHeight: '220px',
      }}
      onPointerDown={(e) => {
        // don't hijack pointer capture from the dot buttons, or their
        // click events get retargeted to this container and never fire
        if ((e.target as HTMLElement).closest('button')) return;
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
          className={`no-save object-contain transition-opacity duration-700 ${
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
