import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { pathForFilter } from '@/sanity/lib/types';
import { CONTACT } from './contactInfo';

// Site footer, shown below the page content. Light grey (not dark) so the
// white-background logo blends in.
export async function Footer({ locale }: { locale: 'en' | 'he' }) {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  // same menu options as the nav; 'Projects' intentionally omitted
  const links = [
    { href: '/', label: t('Footer.home') },
    { href: pathForFilter('paintings'), label: t('Filters.paintings') },
    { href: pathForFilter('3d-sculpture'), label: t('Filters.3d-sculpture') },
    {
      href: pathForFilter('gallery-pictures'),
      label: t('Filters.gallery-pictures'),
    },
    { href: pathForFilter('contact'), label: t('Filters.contact') },
  ];

  return (
    <footer className="border-t border-neutral-200 bg-neutral-100 px-6 py-16 text-neutral-600 sm:px-12">
      <div className="mx-auto grid max-w-6xl justify-items-center gap-12 text-start sm:grid-cols-3">
        {/* brand */}
        <div className="flex flex-col items-start gap-4">
          <p className="max-w-xs text-sm leading-relaxed text-neutral-500">
            {t('Footer.tagline')}
          </p>
          <p className="text-xs text-neutral-400">
            © {year} {CONTACT.name[locale]} · {t('Footer.rights')}
          </p>
        </div>

        {/* sitemap */}
        <nav aria-label={t('Footer.sitemap')}>
          <h2 className="text-sm font-bold tracking-widest text-neutral-400 uppercase">
            {t('Footer.sitemap')}
          </h2>
          <ul className="mt-4 flex flex-col items-start gap-3">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-neutral-700 transition-colors hover:text-neutral-900"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* contact */}
        <div>
          <h2 className="text-sm font-bold tracking-widest text-neutral-400 uppercase">
            {t('Footer.contact')}
          </h2>
          <div className="mt-4 flex flex-col items-start gap-2 text-sm">
            <span className="text-neutral-700">{CONTACT.name[locale]}</span>
            <a
              href={`mailto:${CONTACT.email}`}
              className="text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {CONTACT.email}
            </a>
            <a
              href={`tel:${CONTACT.tel}`}
              className="text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {CONTACT.phone}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
