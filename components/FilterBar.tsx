'use client';

import { useTranslations } from 'next-intl';
import { CATEGORY_VALUES, type Category } from '@/sanity/lib/types';

export type FilterValue = Category | 'all' | 'contact';

export default function FilterBar({
  active,
  onChange,
}: {
  active: FilterValue;
  onChange: (value: FilterValue) => void;
}) {
  const t = useTranslations('Filters');

  const options: FilterValue[] = ['all', ...CATEGORY_VALUES, 'contact'];

  return (
    <nav className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-neutral-200 px-6 py-6 sm:px-12">
      {options.map((option) => {
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
