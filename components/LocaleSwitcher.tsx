'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

const LOCALES = [
  { code: 'he', label: 'He', name: 'עברית' },
  { code: 'en', label: 'En', name: 'English' },
] as const;

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // the whole button switches to the other language; the accessible name is
  // that target language, matching what a click actually does
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
      // dir="ltr" pins the visual order to "He / En" in both languages;
      // h-8 keeps it aligned with the hamburger button in the mobile bar
      dir="ltr"
      className="group flex h-8 items-center text-sm tracking-wide"
    >
      {LOCALES.map(({ code, label }, i) => (
        <span key={code} className="flex items-center">
          {i > 0 && <span className="mx-1 font-light text-neutral-300">/</span>}
          <span
            className={
              code === locale
                ? 'font-bold text-neutral-900'
                : 'font-normal text-neutral-400 transition-colors group-hover:text-neutral-700'
            }
          >
            {label}
          </span>
        </span>
      ))}
    </button>
  );
}
