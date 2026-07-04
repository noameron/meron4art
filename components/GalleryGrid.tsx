'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [lightbox, setLightbox] = useState<string | null>(null);
  const locale = useLocale() as 'en' | 'he';
  const t = useTranslations('Gallery');
  const tFilters = useTranslations('Filters');
  const tContact = useTranslations('Contact');

  const contentRef = useRef<HTMLDivElement>(null);

  // the tab content sits below the hero banner, so bring it into view when
  // landing on any tab other than the default "all"
  useEffect(() => {
    if (active !== 'all') {
      contentRef.current?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [active]);

  // Esc closes the lightbox (native <dialog> would give this free, but we
  // need a plain overlay to click-anywhere-to-close)
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setLightbox(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const filtered = useMemo(
    () =>
      active === 'all' || active === 'contact'
        ? items
        : items.filter((item) => item.category === active),
    [items, active],
  );

  return (
    <section>
      <FilterBar active={active} />
      {/* Intro pins below the sticky tab bar; the banner+gallery block below
          is opaque and stacked higher, so it slides over the text on scroll
          while both stay under the bar. */}
      <div className="sticky top-[4.5rem] z-0">{intro}</div>
      <div className="relative z-10 bg-white">
        {banner}
        <div ref={contentRef} className="scroll-mt-[4.5rem]">
          {active === 'contact' ? (
            <div className="mx-auto flex max-w-3xl flex-col justify-center gap-10 px-6 py-16 sm:flex-row sm:gap-16">
              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-medium tracking-widest text-neutral-400 uppercase">
                  {tContact('details')}
                </h2>
                <span className="text-lg font-medium text-neutral-900">
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
              {active !== 'all' && (
                <h2 className="px-6 pt-12 pb-6 text-center text-2xl font-medium tracking-tight text-neutral-900 sm:text-4xl">
                  {tFilters(active)}
                </h2>
              )}
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 pb-16 sm:grid-cols-2 sm:gap-14 sm:px-12">
                {filtered.map((item) => {
                  const label =
                    item.title?.[locale] ?? item.artistName?.[locale];
                  return (
                    <figure key={item._id} className="flex flex-col">
                      <button
                        type="button"
                        aria-label={label ?? t('view')}
                        onClick={() =>
                          setLightbox(
                            urlFor(item.image).width(2000).auto('format').url(),
                          )
                        }
                        className="block cursor-zoom-in border border-neutral-200 bg-white p-2 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <Image
                          src={urlFor(item.image)
                            .width(1200)
                            .auto('format')
                            .url()}
                          alt={label ?? ''}
                          width={item.imgWidth ?? 1200}
                          height={item.imgHeight ?? 900}
                          sizes="(min-width: 640px) 45vw, 90vw"
                          className="h-auto w-full"
                        />
                      </button>
                      {(item.title || item.artistName) && (
                        <figcaption className="mt-3 flex flex-col gap-0.5 text-center">
                          {item.title && (
                            <span className="text-sm font-medium text-neutral-900">
                              {item.title[locale]}
                            </span>
                          )}
                          {item.artistName && (
                            <span className="text-xs text-neutral-500">
                              {item.artistName[locale]}
                            </span>
                          )}
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
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </section>
  );
}
