'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { urlFor } from '@/sanity/lib/image';
import type { FilterValue, PortfolioItem } from '@/sanity/lib/types';
import FilterBar from './FilterBar';
import ContactForm from './ContactForm';
import { CONTACT } from './contactInfo';

// Lightbox toolbar icons — thin line icons drawn in currentColor.
const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};
const ZoomIcon = () => (
  <svg {...iconProps}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
  </svg>
);
const FullscreenIcon = () => (
  <svg {...iconProps}>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </svg>
);
const CloseIcon = () => (
  <svg {...iconProps}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const ArrowIcon = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg {...iconProps} width={28} height={28}>
    {dir === 'left' ? (
      <path d="M15 5l-7 7 7 7" />
    ) : (
      <path d="M9 5l7 7-7 7" />
    )}
  </svg>
);

// Artist name caption, shared by the grid hover overlay and the lightbox.
function Caption({
  item,
  locale,
}: {
  item: PortfolioItem;
  locale: 'en' | 'he';
}) {
  if (!item.artistName) return null;
  return (
    <span className="block text-sm font-medium">{item.artistName[locale]}</span>
  );
}

export default function GalleryGrid({
  items,
  active,
  intro,
  banner,
}: {
  items: PortfolioItem[];
  active: FilterValue;
  intro?: React.ReactNode;
  banner?: React.ReactNode;
}) {
  // index of the image open in the lightbox (null = closed)
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  // pan container/image + transient pan state, kept in refs and applied via
  // GPU transform imperatively so dragging never triggers a React re-render
  const panRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const pan = useRef({ x: 0, y: 0 });
  const drag = useRef({ active: false, moved: false, x: 0, y: 0, px: 0, py: 0 });

  // move the image to (x,y), clamped so it can't be dragged past its edges
  const applyPan = useCallback((x: number, y: number) => {
    const el = panRef.current;
    const img = imgRef.current;
    if (!el || !img) return;
    const maxX = Math.max(0, (img.offsetWidth - el.clientWidth) / 2);
    const maxY = Math.max(0, (img.offsetHeight - el.clientHeight) / 2);
    const cx = Math.min(maxX, Math.max(-maxX, x));
    const cy = Math.min(maxY, Math.max(-maxY, y));
    pan.current = { x: cx, y: cy };
    img.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
  }, []);

  const toggleZoom = useCallback(() => {
    pan.current = { x: 0, y: 0 };
    setZoomed((z) => !z);
  }, []);
  const locale = useLocale() as 'en' | 'he';
  const t = useTranslations('Gallery');
  const tContact = useTranslations('Contact');

  const contentRef = useRef<HTMLDivElement>(null);

  // the tab content sits below the hero banner, so bring it into view when
  // landing on a category/contact tab — but NOT when the remount was just a
  // language switch (that must preserve the reader's scroll position)
  useEffect(() => {
    if (active === 'all') return;
    if (sessionStorage.getItem('localeSwitch')) {
      sessionStorage.removeItem('localeSwitch');
      return;
    }
    contentRef.current?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    });
  }, [active]);

  const filtered = useMemo(
    () =>
      active === 'all' || active === 'contact'
        ? items
        : items.filter((item) => item.category === active),
    [items, active],
  );

  // step through the lightbox, wrapping around the ends
  const step = useCallback(
    (delta: number) =>
      setLightbox((i) =>
        i === null ? i : (i + delta + filtered.length) % filtered.length,
      ),
    [filtered.length],
  );

  // reset zoom + pan whenever the shown image changes (open, close, or step)
  useEffect(() => {
    setZoomed(false);
    pan.current = { x: 0, y: 0 };
  }, [lightbox]);

  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    // drop focus from the trigger so its focus-visible ring (painted after a
    // keyboard Esc) doesn't linger as a line over the frame
    (document.activeElement as HTMLElement | null)?.blur();
    setLightbox(null);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else lightboxRef.current?.requestFullscreen().catch(() => {});
  }, []);

  // arrow keys navigate, Esc closes (a plain overlay, not native <dialog>)
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, step, close]);

  return (
    <section>
      <FilterBar active={active} />
      {/* Intro pins below the sticky tab bar; the banner+gallery block below
          is opaque and stacked higher, so it slides over the text on scroll
          while both stay under the bar. */}
      <div className="sticky top-[4.5rem] z-0">{intro}</div>
      <div className="relative z-10 bg-white">
        {banner}
        {/* modest blank gap that separates the hero from the content below */}
        {active !== 'all' && <div aria-hidden className="h-[25vh]" />}
        <div ref={contentRef} className="scroll-mt-[4.5rem]">
          {active === 'all' ? null : active === 'contact' ? (
            <div className="mx-auto flex max-w-3xl flex-col justify-center gap-10 px-6 py-16 sm:flex-row sm:gap-16">
              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-bold tracking-widest text-neutral-400 uppercase">
                  {tContact('details')}
                </h2>
                <span className="text-lg font-bold text-neutral-900">
                  {CONTACT.name[locale]}
                </span>
                <a
                  href={`mailto:${CONTACT.email}`}
                  aria-label={tContact('email')}
                  className="text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  {CONTACT.email}
                </a>
                <a
                  href={`tel:${CONTACT.tel}`}
                  aria-label={tContact('phone')}
                  className="text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  {CONTACT.phone}
                </a>
              </div>
              <div className="flex-1">
                <ContactForm to={CONTACT.email} />
              </div>
            </div>
          ) : (
            <>
              {/* single centered column; each image is a fixed height and its
                  width follows its aspect ratio, so narrow images leave more
                  blank space at the sides. max-w-full keeps side margins. */}
              <div className="mx-auto flex max-w-4xl flex-col items-center gap-12 px-6 pt-8 pb-16 sm:px-12">
                {filtered.map((item, i) => {
                  const label = item.artistName?.[locale];
                  return (
                    <figure
                      key={item._id}
                      className="flex flex-col items-center"
                    >
                      <button
                        type="button"
                        aria-label={label ?? t('view')}
                        onClick={() => setLightbox(i)}
                        className="group relative inline-block max-w-full cursor-zoom-in overflow-hidden border border-neutral-200 bg-white p-1.5 shadow-sm transition-shadow hover:shadow-md"
                      >
                        {/* thin uniform white line (p-1.5) that hugs the
                            image exactly: capped by max-height (and container
                            width), aspect ratio preserved, no letterboxing so
                            the frame is the same width on every image */}
                        <Image
                          src={urlFor(item.image)
                            .height(1200)
                            .auto('format')
                            .url()}
                          alt={label ?? ''}
                          width={item.imgWidth ?? 1200}
                          height={item.imgHeight ?? 900}
                          sizes="90vw"
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                          className="no-save h-auto max-h-80 w-auto max-w-full sm:max-h-128"
                        />
                        {/* hover: blur the image behind a white wash and reveal
                            the caption pinned to the bottom */}
                        {item.artistName && (
                          <span className="pointer-events-none absolute inset-0 flex transform-gpu items-end justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                            <span className="absolute inset-0 bg-white/80 backdrop-blur-md" />
                            <span className="relative p-4 text-center text-neutral-700">
                              <Caption item={item} locale={locale} />
                            </span>
                          </span>
                        )}
                      </button>
                    </figure>
                  );
                })}
              </div>
              {filtered.length === 0 && (
                <p className="px-6 py-16 text-center text-sm text-neutral-400 sm:px-12">
                  {t('empty')}
                </p>
              )}
            </>
          )}
        </div>
      </div>
      {lightbox !== null && filtered[lightbox] && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
        >
          {/* counter, top-left */}
          <span className="pointer-events-none absolute top-4 left-4 text-sm text-white/80">
            {lightbox + 1} / {filtered.length}
          </span>

          {/* toolbar, top-right: zoom, full screen, close */}
          <div className="absolute top-3 right-3 flex items-center gap-5 text-white/80">
            <button
              type="button"
              aria-label={t('zoom')}
              onClick={(e) => {
                e.stopPropagation();
                toggleZoom();
              }}
              className="transition-colors hover:text-white"
            >
              <ZoomIcon />
            </button>
            <button
              type="button"
              aria-label={t('fullscreen')}
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="transition-colors hover:text-white"
            >
              <FullscreenIcon />
            </button>
            <button
              type="button"
              aria-label={t('close')}
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              className="transition-colors hover:text-white"
            >
              <CloseIcon />
            </button>
          </div>

          {/* prev / next arrows on the sides */}
          <button
            type="button"
            aria-label={t('previous')}
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute top-1/2 left-2 -translate-y-1/2 p-2 text-white/70 transition-colors hover:text-white sm:left-6"
          >
            <ArrowIcon dir="left" />
          </button>
          <button
            type="button"
            aria-label={t('next')}
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute top-1/2 right-2 -translate-y-1/2 p-2 text-white/70 transition-colors hover:text-white sm:right-6"
          >
            <ArrowIcon dir="right" />
          </button>

          {/* image; click toggles zoom, drag the grab-hand to pan when zoomed */}
          <div
            ref={panRef}
            className={
              zoomed
                ? 'flex h-full w-full cursor-grab touch-none items-center justify-center overflow-hidden select-none active:cursor-grabbing'
                : 'flex max-h-full max-w-full items-center justify-center'
            }
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => {
              if (!zoomed || !panRef.current) return;
              drag.current = {
                active: true,
                moved: false,
                x: e.clientX,
                y: e.clientY,
                px: pan.current.x,
                py: pan.current.y,
              };
              panRef.current.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!drag.current.active) return;
              const dx = e.clientX - drag.current.x;
              const dy = e.clientY - drag.current.y;
              if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.current.moved = true;
              applyPan(drag.current.px + dx, drag.current.py + dy);
            }}
            onPointerUp={() => {
              drag.current.active = false;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={urlFor(filtered[lightbox].image)
                .width(2000)
                .auto('format')
                .url()}
              alt={filtered[lightbox].artistName?.[locale] ?? ''}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onClick={() => {
                // ignore the click that ends a pan drag
                if (drag.current.moved) return;
                toggleZoom();
              }}
              className={
                zoomed
                  ? 'no-save w-auto max-w-none will-change-transform'
                  : 'no-save max-h-[90vh] max-w-full cursor-zoom-in object-contain'
              }
            />
          </div>

          {/* caption always visible at the bottom while maximized */}
          {filtered[lightbox].artistName && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-6">
              <div className="max-w-xl text-center text-white">
                <Caption item={filtered[lightbox]} locale={locale} />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
