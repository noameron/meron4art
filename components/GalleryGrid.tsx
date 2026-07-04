'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { urlFor } from '@/sanity/lib/image';
import type { PortfolioItem } from '@/sanity/lib/types';
import FilterBar, { FILTER_VALUES, type FilterValue } from './FilterBar';
import ContactForm from './ContactForm';

const CONTACT = {
  name: 'Omri Meron',
  email: 'meronok@gmail.com',
  phone: '+972-54-299-9663',
  tel: '+972542999663',
};

export default function GalleryGrid({
  items,
  intro,
  banner,
}: {
  items: PortfolioItem[];
  intro?: React.ReactNode;
  banner?: React.ReactNode;
}) {
  const [active, setActive] = useState<FilterValue>('all');
  const locale = useLocale() as 'en' | 'he';
  const t = useTranslations('Gallery');
  const tContact = useTranslations('Contact');

  // The page is static, so the active tab is mirrored in ?tab= to survive
  // full navigations (e.g. the locale switch). Read it back after mount to
  // avoid a hydration mismatch.
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab && FILTER_VALUES.includes(tab as FilterValue)) {
      setActive(tab as FilterValue);
      scrollToContent();
    }
  }, []);

  const contentRef = useRef<HTMLDivElement>(null);

  // the tab content sits below the hero banner, so bring it into view on
  // every tab selection (but not on a plain first visit)
  const scrollToContent = () =>
    contentRef.current?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    });

  const selectTab = (value: FilterValue) => {
    setActive(value);
    const url = new URL(window.location.href);
    if (value === 'all') url.searchParams.delete('tab');
    else url.searchParams.set('tab', value);
    window.history.replaceState(null, '', url);
    scrollToContent();
  };

  const filtered = useMemo(
    () =>
      active === 'all' || active === 'contact'
        ? items
        : items.filter((item) => item.category === active),
    [items, active],
  );

  return (
    <section>
      <FilterBar active={active} onChange={selectTab} />
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
              <div className="grid grid-cols-1 gap-px bg-neutral-200 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item) => {
                  const label =
                    item.title?.[locale] ?? item.artistName?.[locale];
                  return (
                    <figure
                      key={item._id}
                      className="group relative aspect-square overflow-hidden bg-white"
                    >
                      <Image
                        src={urlFor(item.image)
                          .width(800)
                          .height(800)
                          .fit('crop')
                          .auto('format')
                          .url()}
                        alt={label ?? ''}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      {(item.title || item.artistName) && (
                        <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/60 to-transparent p-4 text-start opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          {item.title && (
                            <span className="text-sm font-medium text-white">
                              {item.title[locale]}
                            </span>
                          )}
                          {item.artistName && (
                            <span className="text-xs text-white/80">
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
    </section>
  );
}
