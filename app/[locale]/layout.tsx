import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Rubik } from 'next/font/google';
import { routing } from '@/i18n/routing';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { Footer } from '@/components/Footer';
import '../globals.css';

// Rubik across the whole site: light / regular / medium / bold / black.
// Bound to both display and body vars so headings and text share it.
const rubik = Rubik({
  variable: '--font-rubik',
  subsets: ['latin', 'hebrew'],
  weight: ['300', '400', '500', '700', '900'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.meron4art.co.il'),
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
      className={rubik.variable}
    >
      <body className="min-h-screen bg-white font-body text-neutral-900 antialiased">
        <NextIntlClientProvider>
          <LocaleSwitcher />
          {children}
          <Footer locale={locale as 'en' | 'he'} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
