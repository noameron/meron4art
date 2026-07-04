'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
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
  const [open, setOpen] = useState(false);

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
      {open && (
        <div className="flex flex-col items-start gap-4 border-t border-neutral-100 px-6 py-4 sm:hidden">
          {tabLinks}
        </div>
      )}
      {/* desktop: logo + options in one row */}
      <div className="hidden flex-wrap items-center gap-x-6 gap-y-2 px-6 py-6 sm:flex sm:px-12">
        <Link href="/" aria-label="Home" onClick={() => setOpen(false)}>
          <Logo className="h-6 w-auto" />
        </Link>
        {tabLinks}
      </div>
    </nav>
  );
}
