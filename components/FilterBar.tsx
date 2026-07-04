'use client';

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

  return (
    <nav className="sticky top-0 z-40 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-neutral-200 bg-white px-6 py-6 pe-24 sm:px-12 sm:pe-24">
      <Logo className="h-6 w-auto" />
      {FILTER_VALUES.map((option) => {
        const isActive = option === active;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
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
      })}
    </nav>
  );
}
