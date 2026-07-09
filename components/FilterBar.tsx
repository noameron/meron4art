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
function BrandName({ as: Tag = 'h1' }: { as?: 'h1' | 'p' }) {
  const t = useTranslations('Hero');
  return (
    <Tag className="font-display text-base leading-tight tracking-tight text-neutral-900 sm:text-lg">
      {/* nowrap so a short phrase never splits mid-word (e.g. "Omri" alone
          on its own line) — the regular part only joins at xl+; the 3-column
          nav (brand | tabs | locale) switches on at lg but doesn't have room
          for the full phrase until xl, or it squeezes into the tabs */}
      <span className="font-bold whitespace-nowrap">{t('nameBold')}</span>
      <span className="ms-2 hidden font-normal whitespace-nowrap xl:inline">
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
        className={`text-sm tracking-wide uppercase transition-colors ${
          isActive
            ? 'font-bold text-neutral-900'
            : 'font-normal text-neutral-400 hover:text-neutral-700'
        }`}
      >
        {t(option)}
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
          className="flex items-center gap-2"
        >
          <Logo className="h-6 w-auto" />
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
            className="flex items-center gap-2"
          >
            <Logo className="h-6 w-auto" />
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
          <BrandName />
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
