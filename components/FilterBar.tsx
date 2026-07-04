'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { CATEGORY_VALUES, type Category } from '@/sanity/lib/types';

export type FilterValue = Category | 'all' | 'contact';

export const FILTER_VALUES: FilterValue[] = [
  'all',
  ...CATEGORY_VALUES,
  'contact',
];

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

export default function FilterBar({
  active,
  onChange,
}: {
  active: FilterValue;
  onChange: (value: FilterValue) => void;
}) {
  const t = useTranslations('Filters');
  const [open, setOpen] = useState(false);

  const select = (value: FilterValue) => {
    setOpen(false);
    onChange(value);
  };

  const tabButtons = FILTER_VALUES.map((option) => {
    const isActive = option === active;
    return (
      <button
        key={option}
        type="button"
        onClick={() => select(option)}
        aria-pressed={isActive}
        className={`text-sm tracking-wide uppercase transition-colors ${
          isActive
            ? 'text-neutral-900'
            : 'text-neutral-400 hover:text-neutral-700'
        }`}
      >
        {t(option)}
      </button>
    );
  });

  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      {/* mobile: logo + hamburger, options in a collapsible panel */}
      <div className="flex items-center justify-between px-6 py-4 sm:hidden">
        <Logo className="h-6 w-auto" />
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
          {tabButtons}
        </div>
      )}
      {/* desktop: logo + options in one row */}
      <div className="hidden flex-wrap items-center gap-x-6 gap-y-2 px-6 py-6 sm:flex sm:px-12">
        <Logo className="h-6 w-auto" />
        {tabButtons}
      </div>
    </nav>
  );
}
