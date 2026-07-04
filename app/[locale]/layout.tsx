import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Frank_Ruhl_Libre, Assistant } from 'next/font/google';
import { routing } from '@/i18n/routing';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import '../globals.css';

const displayFont = Frank_Ruhl_Libre({
  variable: '--font-display',
  subsets: ['latin', 'hebrew'],
  weight: ['400', '500', '600'],
});

const bodyFont = Assistant({
  variable: '--font-body',
  subsets: ['latin', 'hebrew'],
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Fine-Art Reproduction Photography',
  description:
    'Professional, gallery-grade photography of paintings, sculptures and fine art.',
};

// SSG: pre-render both locales at build time
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this request
  setRequestLocale(locale);

  const dir = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body className="min-h-screen bg-white font-body text-neutral-900 antialiased">
        <NextIntlClientProvider>
          <LocaleSwitcher />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
