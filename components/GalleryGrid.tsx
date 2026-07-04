'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { urlFor } from '@/sanity/lib/image';
import type { FilterValue, PortfolioItem } from '@/sanity/lib/types';
import FilterBar from './FilterBar';
import ContactForm from './ContactForm';

const CONTACT = {
  name: 'Omri Meron',
  email: 'meronok@gmail.com',
  phone: '+972-54-299-9663',
  tel: '+972542999663',
};

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

  // arrow keys navigate, Esc closes (a plain overlay, not native <dialog>)
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, step]);

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
                  {CONTACT.name}
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
                        className="inline-block max-w-full cursor-zoom-in border border-neutral-200 bg-white p-1.5 shadow-sm transition-shadow hover:shadow-md"
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
                          className="h-auto max-h-80 w-auto max-w-full sm:max-h-128"
                        />
                      </button>
                      {item.artistName && (
                        <figcaption className="mt-3 text-center text-sm font-medium text-neutral-900">
                          {item.artistName[locale]}
                        </figcaption>
                      )}
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
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-4"
        >
          <div
            className="relative flex max-h-full max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlFor(filtered[lightbox].image)
                .width(2000)
                .auto('format')
                .url()}
              alt={filtered[lightbox].artistName?.[locale] ?? ''}
              className="max-h-[90vh] max-w-full object-contain"
            />
            {/* left/right halves step through the images */}
            <button
              type="button"
              aria-label={t('previous')}
              onClick={() => step(-1)}
              className="absolute inset-y-0 left-0 w-1/2 cursor-w-resize"
            />
            <button
              type="button"
              aria-label={t('next')}
              onClick={() => step(1)}
              className="absolute inset-y-0 right-0 w-1/2 cursor-e-resize"
            />
          </div>
        </div>
      )}
    </section>
  );
}
