'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { urlFor } from '@/sanity/lib/image';
import type {
  FilterValue,
  PortfolioItem,
  SizedImage,
} from '@/sanity/lib/types';
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
    {dir === 'left' ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
  </svg>
);
const FirstPageIcon = () => (
  <svg {...iconProps}>
    <path d="M18 5v14M13 5l-7 7 7 7" />
  </svg>
);
const LastPageIcon = () => (
  <svg {...iconProps}>
    <path d="M6 5v14M11 5l7 7-7 7" />
  </svg>
);

const PAGE_SIZE = 10;
const LIGHTBOX_SWIPE_THRESHOLD_PX = 40;

// Artist name caption shown inside the lightbox.
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
  banner,
  aboutImage,
}: {
  items: PortfolioItem[];
  active: FilterValue;
  banner?: React.ReactNode;
  aboutImage?: SizedImage;
}) {
  // index of the image open in the lightbox (null = closed)
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  // current page (0-indexed) within the active category, and whether the
  // image list is mid-crossfade between pages
  const [page, setPage] = useState(0);
  const [fading, setFading] = useState(false);
  // pan container/image + transient pan state, kept in refs and applied via
  // GPU transform imperatively so dragging never triggers a React re-render
  const panRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const pan = useRef({ x: 0, y: 0 });
  const drag = useRef({
    active: false,
    moved: false,
    x: 0,
    y: 0,
    px: 0,
    py: 0,
  });
  // fractional point (0..1) within the image that the next zoom-in should
  // center on; null means center on the image's own center
  const zoomOrigin = useRef<{ fx: number; fy: number } | null>(null);

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

  // zoom out to the fitted 100% view (toolbar button, or a click while zoomed)
  // — resets the imperative pan transform too, so it doesn't carry over and
  // leave the fitted image translated off-screen on the next zoom-in
  const zoomOut = useCallback(() => {
    zoomOrigin.current = null;
    applyPan(0, 0);
    setZoomed(false);
  }, [applyPan]);

  // toolbar zoom button toggles without a click point, so it always
  // zooms in centered
  const toggleZoom = useCallback(() => {
    zoomOrigin.current = null;
    applyPan(0, 0);
    setZoomed((z) => !z);
  }, [applyPan]);

  // zoom in centered on the point the user clicked, in image-local
  // fractional coordinates (0..1), so the clicked spot ends up centered
  const zoomInAt = useCallback((clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (img) {
      const rect = img.getBoundingClientRect();
      zoomOrigin.current = {
        fx: (clientX - rect.left) / rect.width,
        fy: (clientY - rect.top) / rect.height,
      };
    }
    setZoomed(true);
  }, []);

  // once the zoomed (native-size) image has laid out, pan so the clicked
  // point (or the image center, for a toolbar-triggered zoom) is centered
  useEffect(() => {
    if (!zoomed) return;
    const img = imgRef.current;
    const origin = zoomOrigin.current;
    zoomOrigin.current = null;
    if (!img || !origin) {
      applyPan(0, 0);
      return;
    }
    const px = origin.fx * img.naturalWidth;
    const py = origin.fy * img.naturalHeight;
    applyPan(img.naturalWidth / 2 - px, img.naturalHeight / 2 - py);
  }, [zoomed, applyPan]);
  const locale = useLocale() as 'en' | 'he';
  const t = useTranslations('Gallery');
  const tAbout = useTranslations('About');
  const tContact = useTranslations('Contact');

  const contentRef = useRef<HTMLDivElement>(null);

  // the tab content sits below the hero banner, so bring it into view when
  // landing on a category/contact tab — but NOT when the remount was just a
  // language switch (that must preserve the reader's scroll position)
  useEffect(() => {
    // a new category changes which items exist, so pagination and any open
    // lightbox from the previous category no longer make sense
    setPage(0);
    setLightbox(null);
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
      active === 'all' || active === 'about' || active === 'contact'
        ? items
        : items.filter((item) => item.category === active),
    [items, active],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // clamp defensively in case `filtered` shrinks (e.g. items prop changes)
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = useMemo(
    () =>
      filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [filtered, safePage],
  );

  // fade the image list out, swap pages, then fade back in — the open
  // lightbox is closed since its contents are about to change under it
  const goToPage = useCallback(
    (target: number) => {
      const clamped = Math.min(Math.max(target, 0), pageCount - 1);
      if (clamped === safePage) return;
      setLightbox(null);
      setFading(true);
      window.setTimeout(() => {
        setPage(clamped);
        setFading(false);
      }, 350);
    },
    [pageCount, safePage],
  );

  // step through the lightbox, wrapping around the ends of the current page
  const step = useCallback(
    (delta: number) =>
      setLightbox((i) =>
        i === null ? i : (i + delta + pageItems.length) % pageItems.length,
      ),
    [pageItems.length],
  );

  // reset zoom + pan whenever the shown image changes (open, close, or step)
  useEffect(() => {
    setZoomed(false);
    zoomOrigin.current = null;
    applyPan(0, 0);
  }, [lightbox, applyPan]);

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
      <div className="relative z-10 bg-white">
        {/* the hero rotation belongs to the home tab only; category, about
            and contact tabs go straight to their own content */}
        {active === 'all' && <div className="py-4 sm:py-6">{banner}</div>}
        <div ref={contentRef} className="scroll-mt-[4.5rem]">
          {active === 'all' ? null : active === 'about' ? (
            <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center">
              {aboutImage && (
                <Image
                  src={urlFor(aboutImage).width(800).auto('format').url()}
                  alt=""
                  width={aboutImage.imgWidth ?? 800}
                  height={aboutImage.imgHeight ?? 1000}
                  priority
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="no-save mb-10 h-auto max-h-96 w-auto max-w-full border border-neutral-200 bg-white p-1.5 shadow-sm"
                />
              )}
              <p className="text-base leading-relaxed font-light text-neutral-600 sm:text-lg">
                {tAbout('bio')}
              </p>
              <p className="mt-10 text-base leading-relaxed font-light text-neutral-600 sm:text-lg">
                {tAbout.rich('studioCredit', {
                  link: (chunks) => (
                    <a
                      href="https://www.omrimeron.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-neutral-600 no-underline hover:underline"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </div>
          ) : active === 'contact' ? (
            <div className="mx-auto flex max-w-3xl flex-col px-6 py-16">
              <div className="flex flex-col justify-center gap-10 sm:flex-row sm:gap-16">
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
            </div>
          ) : (
            <>
              {/* single centered column; each image is a fixed height and its
                  width follows its aspect ratio, so narrow images leave more
                  blank space at the sides. max-w-full keeps side margins. */}
              <div
                className={`mx-auto flex max-w-4xl flex-col items-center gap-12 px-6 pt-8 pb-16 transition-opacity duration-700 sm:px-12 ${fading ? 'opacity-0' : 'opacity-100'}`}
              >
                {pageItems.map((item, i) => {
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
                        className="inline-block max-w-full cursor-zoom-in"
                      >
                        {/* unframed: capped by max-height (and container
                            width), aspect ratio preserved */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={label ?? ''}
                          width={item.imgWidth ?? 1200}
                          height={item.imgHeight ?? 900}
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                          className="no-save h-auto max-h-80 w-auto max-w-full sm:max-h-128"
                        />
                      </button>
                      {/* artist name below the frame, gallery-plaque style:
                          small, letterspaced caps (uppercase is a no-op for
                          Hebrew), quiet but present */}
                      {label && (
                        <figcaption className="mt-3 text-center text-sm font-medium tracking-widest text-neutral-800 uppercase">
                          {label}
                        </figcaption>
                      )}
                    </figure>
                  );
                })}
              </div>
              {pageCount > 1 && (
                <div className="mt-4 flex items-center justify-center gap-6 pb-4">
                  <button
                    type="button"
                    aria-label={t('pagination.first')}
                    disabled={safePage === 0}
                    onClick={() => goToPage(0)}
                    className="text-neutral-500 transition-colors hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <FirstPageIcon />
                  </button>
                  <button
                    type="button"
                    aria-label={t('pagination.previous')}
                    disabled={safePage === 0}
                    onClick={() => goToPage(safePage - 1)}
                    className="text-neutral-500 transition-colors hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ArrowIcon dir="left" />
                  </button>
                  <span className="text-sm text-neutral-400">
                    {t('pagination.status', {
                      current: safePage + 1,
                      total: pageCount,
                    })}
                  </span>
                  <button
                    type="button"
                    aria-label={t('pagination.next')}
                    disabled={safePage === pageCount - 1}
                    onClick={() => goToPage(safePage + 1)}
                    className="text-neutral-500 transition-colors hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ArrowIcon dir="right" />
                  </button>
                  <button
                    type="button"
                    aria-label={t('pagination.last')}
                    disabled={safePage === pageCount - 1}
                    onClick={() => goToPage(pageCount - 1)}
                    className="text-neutral-500 transition-colors hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <LastPageIcon />
                  </button>
                </div>
              )}
              {filtered.length === 0 && (
                <p className="px-6 py-16 text-center text-sm text-neutral-400 sm:px-12">
                  {t('empty')}
                </p>
              )}
            </>
          )}
        </div>
      </div>
      {lightbox !== null && pageItems[lightbox] && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          onClick={close}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-4"
        >
          {/* counter, top-left */}
          <span className="pointer-events-none absolute top-4 left-4 text-sm text-white/80">
            {lightbox + 1} / {pageItems.length}
          </span>

          {/* toolbar, top-right: zoom, full screen, close */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-5 text-white/80">
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
            className="absolute top-1/2 left-2 z-10 -translate-y-1/2 p-2 text-white/70 transition-colors hover:text-white sm:left-6"
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
            className="absolute top-1/2 right-2 z-10 -translate-y-1/2 p-2 text-white/70 transition-colors hover:text-white sm:right-6"
          >
            <ArrowIcon dir="right" />
          </button>

          {/* image; a plain tap always zooms in (centered on the tapped
              point) or, if already zoomed, zooms back out — prev/next is
              only ever triggered by the arrow buttons or a swipe, never a
              tap on the image. When zoomed, drag pans instead. Either way
              a real drag (past the 3px jitter guard) suppresses the tap
              action.
              flex-1/min-h-0 (instead of a fixed h-full) makes this share
              the dialog's column with the caption row below, so the image
              only ever grows to fill the space left over once the caption's
              own height is reserved — it never overlaps it. */}
          <div
            ref={panRef}
            className={
              zoomed
                ? 'flex w-full min-h-0 flex-1 cursor-grab touch-none items-center justify-center overflow-hidden select-none active:cursor-grabbing'
                : 'flex w-full min-h-0 flex-1 max-w-full touch-pan-y items-center justify-center'
            }
            onClick={(e) => {
              // stop the lightbox backdrop's click-to-close from firing for
              // any click that originates on this container — a drag-end
              // click included, or a real pan/swipe would bubble up and
              // close the lightbox once it no longer stops here first
              e.stopPropagation();
              if (drag.current.moved) return;
              // once zoomed, this container holds pointer capture (set
              // below), so the browser retargets pointerup/click to it
              // instead of the <img> — handle the toggle here, not on
              // the image, or a click-to-zoom-out would never fire
              if (zoomed) {
                zoomOut();
                return;
              }
              // this container now spans the full reactive image area (see
              // above), so a click can land on its own empty letterboxed
              // background rather than the artwork itself — treat that the
              // same as clicking the backdrop (close), only the image
              // itself should zoom in. Checked via the click's actual
              // coordinates against the <img>'s own rect (not e.target):
              // setPointerCapture above retargets every click's target to
              // this container regardless of where the pointer really was.
              const imgRect = imgRef.current?.getBoundingClientRect();
              const onImage =
                imgRect &&
                e.clientX >= imgRect.left &&
                e.clientX <= imgRect.right &&
                e.clientY >= imgRect.top &&
                e.clientY <= imgRect.bottom;
              if (!onImage) {
                close();
                return;
              }
              e.stopPropagation();
              zoomInAt(e.clientX, e.clientY);
            }}
            onPointerDown={(e) => {
              if (!panRef.current) return;
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
              if (Math.abs(dx) > 3 || Math.abs(dy) > 3)
                drag.current.moved = true;
              if (zoomed) applyPan(drag.current.px + dx, drag.current.py + dy);
            }}
            onPointerUp={(e) => {
              if (!zoomed && drag.current.active) {
                const dx = e.clientX - drag.current.x;
                if (Math.abs(dx) >= LIGHTBOX_SWIPE_THRESHOLD_PX) {
                  if (dx < 0) step(1);
                  else step(-1);
                }
              }
              drag.current.active = false;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={pageItems[lightbox].imageUrl}
              alt={pageItems[lightbox].artistName?.[locale] ?? ''}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              className={
                zoomed
                  ? 'no-save w-auto max-w-none will-change-transform'
                  : 'no-save max-h-full max-w-full cursor-zoom-in object-contain'
              }
            />
          </div>

          {/* caption row — a normal-flow sibling of the image (not an
              absolute overlay), so the dialog's column layout always
              reserves real space for it below the image and it can never
              sit on top of the artwork itself */}
          {pageItems[lightbox].artistName && (
            <div className="pointer-events-none flex w-full shrink-0 justify-center px-6 pt-3 pb-2">
              <div className="max-w-xl rounded-full bg-black/60 px-4 py-1.5 text-center text-white backdrop-blur-sm">
                <Caption item={pageItems[lightbox]} locale={locale} />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
