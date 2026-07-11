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
      // fixed square + flex centering so the emoji flag lines up with the
      // hamburger button next to it in the mobile bar (emoji baselines sit
      // differently from text, so plain items-center on the parent isn't
      // enough)
      className="flex h-8 w-8 items-center justify-center text-lg leading-none opacity-80 transition-opacity hover:opacity-100"
    >
      {/* measured on macOS Chrome: the emoji's ink renders 1px above the
          flex-centered line box, so nudge it down to true center (block,
          because transforms don't apply to plain inline elements) */}
      <span className="block translate-y-[1px]">{target.flag}</span>
    </button>
  );
}
