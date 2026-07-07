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

  // show only the language you can switch to, not the current one
  const target = LOCALES.find(({ code }) => code !== locale) ?? LOCALES[0];

  return (
    <button
      type="button"
      aria-label={target.name}
      onClick={() => {
        // flag so the gallery skips its scroll-to-content on the remount,
        // and scroll:false keeps the reader exactly where they were
        sessionStorage.setItem('localeSwitch', '1');
        // pathname is locale-stripped, so this keeps the active tab
        // (e.g. /paintings) and just swaps the locale prefix
        router.replace(pathname, { locale: target.code, scroll: false });
      }}
      className="text-lg leading-none opacity-80 transition-opacity hover:opacity-100"
    >
      {target.flag}
    </button>
  );
}
