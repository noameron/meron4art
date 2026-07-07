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
  return (
    <Image
      src="/logo.jpeg"
      alt="Studio Omri Meron"
      width={1600}
      height={878}
      className={className}
    />
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
      {/* mobile: logo + hamburger, options in a collapsible panel */}
      <div className="flex items-center justify-between px-6 py-4 sm:hidden">
        <Link href="/" aria-label="Home" onClick={() => setOpen(false)}>
          <Logo className="h-6 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
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
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 sm:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <div
        // closed drawer is only translated off-screen, so inert keeps its
        // links out of the tab order and the accessibility tree
        inert={!open}
        className={`fixed inset-y-0 z-50 flex w-4/5 max-w-xs flex-col gap-8 bg-white px-6 py-6 shadow-xl transition-transform duration-300 ease-in-out sm:hidden ${
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
          <Link href="/" aria-label="Home" onClick={() => setOpen(false)}>
            <Logo className="h-6 w-auto" />
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
      {/* desktop: logo + options in one row */}
      <div className="hidden flex-wrap items-center gap-x-6 gap-y-2 px-6 py-6 sm:flex sm:px-12">
        <Link href="/" aria-label="Home" onClick={() => setOpen(false)}>
          <Logo className="h-6 w-auto" />
        </Link>
        {tabLinks}
        <div className="ms-auto">
          <LocaleSwitcher />
        </div>
      </div>
    </nav>
  );
}
