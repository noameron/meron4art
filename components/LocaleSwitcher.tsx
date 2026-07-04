'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

const LOCALES = [
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'he', flag: '🇮🇱', name: 'עברית' },
] as const;

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    // physical right-4 (not end-4): the toggle must stay in the same corner
    // in both languages, and top-20 keeps it clear of the sticky tab bar
    <div className="fixed top-20 right-4 z-50 flex gap-1 rounded-full border border-neutral-200 bg-white/90 p-1 shadow-sm backdrop-blur-sm">
      {LOCALES.map(({ code, flag, name }) => (
        <button
          key={code}
          type="button"
          aria-label={name}
          aria-pressed={locale === code}
          onClick={() =>
            // pathname is locale-stripped, so this keeps the active tab
            // (e.g. /paintings) and just swaps the locale prefix
            router.replace(pathname, { locale: code })
          }
          className={`rounded-full px-2.5 py-1.5 text-sm transition-colors ${
            locale === code ? 'bg-neutral-900' : 'opacity-50 hover:opacity-100'
          }`}
        >
          {flag}
        </button>
      ))}
    </div>
  );
}
