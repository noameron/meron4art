'use client';

import { useTranslations } from 'next-intl';

// Catches render errors below the locale layout (e.g. a Sanity fetch failing
// on a network blip) and offers a retry instead of the default 500 page.
export default function LocaleError({ reset }: { reset: () => void }) {
  const t = useTranslations('Error');

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-2xl font-medium text-neutral-900">{t('title')}</h1>
      <p className="max-w-md text-sm text-neutral-600">{t('description')}</p>
      <button
        onClick={reset}
        className="border border-neutral-900 px-6 py-2 text-sm tracking-wide text-neutral-900 uppercase transition-colors hover:bg-neutral-900 hover:text-white"
      >
        {t('retry')}
      </button>
    </main>
  );
}
