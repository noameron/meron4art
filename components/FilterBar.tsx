'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LocaleSwitcher from './LocaleSwitcher';
import {
  FILTER_VALUES,
  pathForFilter,
  type FilterValue,
} from '@/sanity/lib/types';

export function Logo({ className }: { className: string }) {
  const locale = useLocale();
  return locale === 'he' ? (
    <Image
      src="/heb_logo-v2.jpeg"
      alt="Studio Omri Meron"
      width={646}
      height={358}
      className={className}
    />
  ) : (
    <Image
      src="/english_logo-v2.jpeg"
      alt="Studio Omri Meron"
      width={755}
      height={341}
      className={className}
    />
  );
}

// site name next to the logo — the page's only heading now that the hero
// no longer carries one, so it's an h1 in the nav rows (mobile bar / desktop
// bar are mutually exclusive via breakpoint, never both visible at once).
// The drawer repeats the same text as plain copy, not another h1, since it
// can be open at the same time as the mobile bar.
function BrandName({
  as: Tag = 'h1',
  compact = false,
}: {
  as?: 'h1' | 'p';
  compact?: boolean;
}) {
  const t = useTranslations('Hero');
  return (
    <Tag className="font-display text-base leading-tight tracking-tight text-neutral-900 sm:text-lg">
      {/* nameBold stays nowrap so "Omri"/"Meron" never separate — it's one
          short name. nameRegular is a multi-word phrase and is left free to
          wrap between its own words (default text flow never splits mid-
          word), since forcing it nowrap made it wide enough to collide with
          the drawer's close button on narrow screens. A break is allowed
          between the two spans too — the explicit {' '} matters: two
          adjacent JSX elements with no text between them share no line-break
          opportunity, so without it the pair renders as one unbreakable run
          and overflows instead of wrapping when space is tight (e.g. the
          mobile bar). The regular part only joins at xl+ when compact: the
          desktop 3-column nav (brand | tabs | locale) switches on at lg but
          doesn't have room for the full phrase until xl, or it squeezes into
          the tabs. The mobile bar and drawer have no such neighbor to
          squeeze, so they always show it (wrapping as needed). */}
      <span className="font-bold whitespace-nowrap">{t('nameBold')}</span>{' '}
      <span
        className={`ms-2 font-normal ${compact ? 'hidden xl:inline' : ''}`}
      >
        {t('nameRegular')}
      </span>
    </Tag>
  );
}

export default function FilterBar({ active }: { active: FilterValue }) {
  const t = useTranslations('Filters');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const rtl = locale === 'he';

  // Lock background scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // 'all' is the bare landing route (/), reached via the logo — not a tab
  const tabLinks = FILTER_VALUES.filter((v) => v !== 'all').map((option) => {
    const isActive = option === active;
    return (
      <Link
        key={option}
        href={pathForFilter(option)}
        onClick={() => setOpen(false)}
        aria-current={isActive ? 'page' : undefined}
        className="group relative inline-flex items-center justify-center px-3 py-1"
      >
        {/* sharp (unrounded) square outline that grows and fades into
            place on hover, rather than a solid background fill */}
        <span
          aria-hidden
          className="absolute inset-0 scale-90 border border-neutral-900 opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100"
        />
        <span
          className={`relative text-sm tracking-wide uppercase transition-colors duration-300 group-hover:font-bold group-hover:text-neutral-900 ${
            isActive
              ? 'font-bold text-neutral-900'
              : 'font-normal text-neutral-400'
          }`}
        >
          {t(option)}
        </span>
      </Link>
    );
  });

  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      {/* mobile: logo + hamburger, options in a collapsible panel.
          The toggle+hamburger cluster is pinned to the physical right with
          absolute positioning (not flex start/end) so it stays in the same
          corner in both languages instead of mirroring with dir=rtl; pr-24
          on the row reserves that corner so the logo never grows under it. */}
      <div className="relative flex items-center py-4 pr-24 pl-6 lg:hidden">
        <Link
          href="/"
          aria-label="Home"
          onClick={() => setOpen(false)}
          className="flex min-w-0 items-center gap-2"
        >
          <Logo className="h-6 w-auto shrink-0" />
          <BrandName />
        </Link>
        <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-4">
          <LocaleSwitcher />
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="text-2xl leading-none text-neutral-700"
          >
            ☰
          </button>
        </div>
      </div>
      {/* mobile: full-height drawer sliding in from the trailing edge
          (right for LTR, left for RTL) with the logo at the top */}
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <div
        // closed drawer is only translated off-screen, so inert keeps its
        // links out of the tab order and the accessibility tree
        inert={!open}
        className={`fixed inset-y-0 z-50 flex w-4/5 max-w-xs flex-col gap-8 bg-white px-6 py-6 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          rtl ? 'left-0' : 'right-0'
        } ${
          open
            ? 'translate-x-0'
            : rtl
              ? '-translate-x-full'
              : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="Home"
            onClick={() => setOpen(false)}
            className="flex min-w-0 items-center gap-2"
          >
            <Logo className="h-6 w-auto shrink-0" />
            <BrandName as="p" />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="text-2xl leading-none text-neutral-700"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col items-start gap-5">{tabLinks}</div>
      </div>
      {/* desktop: brand and locale are both taken out of flow (absolute)
          so the tabs can center on the *true* full bar width via a plain
          w-full flex, instead of the space left over after two differently-
          sized, asymmetric siblings — that leftover space isn't symmetric
          (brand's width varies with locale/text length, the locale switcher
          is a fixed small icon), so centering within it was visibly off.
          Both corners use logical `start-*`/`end-*` (not physical left/right)
          so they mirror together with content in Hebrew — brand and locale
          swap sides as a pair, so they never land on the same corner. */}
      <div className="relative hidden items-center py-6 lg:flex">
        <Link
          href="/"
          aria-label="Home"
          onClick={() => setOpen(false)}
          className="absolute top-1/2 start-6 flex -translate-y-1/2 items-center gap-3 lg:start-12"
        >
          <Logo className="h-6 w-auto" />
          <BrandName compact />
        </Link>
        <div className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {tabLinks}
        </div>
        <div className="absolute top-1/2 end-6 -translate-y-1/2 lg:end-12">
          <LocaleSwitcher />
        </div>
      </div>
    </nav>
  );
}
