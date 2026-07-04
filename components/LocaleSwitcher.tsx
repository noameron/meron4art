'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

const LOCALES = [
  { code: 'en', flag: '🇺🇸', label: 'EN', name: 'English' },
  { code: 'he', flag: '🇮🇱', label: 'עב', name: 'עברית' },
] as const;

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed top-4 end-4 z-50 flex gap-1 rounded-full border border-neutral-200 bg-white/90 p-1 shadow-sm backdrop-blur-sm">
      {LOCALES.map(({ code, flag, label, name }) => (
        <button
          key={code}
          type="button"
          aria-label={name}
          aria-pressed={locale === code}
          onClick={() =>
            // keep query params (e.g. the active ?tab=) across the switch
            router.replace(pathname + window.location.search, { locale: code })
          }
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            locale === code
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          {flag} {label}
        </button>
      ))}
    </div>
  );
}
