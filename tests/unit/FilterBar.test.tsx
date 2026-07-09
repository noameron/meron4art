import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import FilterBar from '@/components/FilterBar';
import type { FilterValue } from '@/sanity/lib/types';
import en from '@/messages/en.json';
import he from '@/messages/he.json';

// next-intl's Link pulls next/navigation, unresolved in jsdom; stub it with a
// plain <a> so we test the relative hrefs FilterBar builds. The /en, /he
// prefixing is next-intl's job and is covered by the e2e suite.
// usePathname/useRouter back the embedded LocaleSwitcher.
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: Record<string, unknown>) =>
    createElement('a', { href, ...props }, children as React.ReactNode),
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() }),
}));

function renderFilterBar(
  active: FilterValue = 'all',
  locale: 'en' | 'he' = 'en',
) {
  render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === 'en' ? en : he}
    >
      <FilterBar active={active} />
    </NextIntlClientProvider>,
  );
}

describe('FilterBar', () => {
  it('renders the categories and Contact as links, but no All tab', () => {
    renderFilterBar();
    for (const name of ['Paintings & Drawings', '3D Art', 'Shows', 'Contact']) {
      expect(screen.getAllByRole('link', { name }).length).toBeGreaterThan(0);
    }
    expect(screen.queryByRole('link', { name: 'All' })).not.toBeInTheDocument();
  });

  it('links each tab to its path, and the logo home', () => {
    renderFilterBar();
    expect(screen.getAllByRole('link', { name: 'Home' })[0]).toHaveAttribute(
      'href',
      '/',
    );
    expect(
      screen.getAllByRole('link', { name: 'Paintings & Drawings' })[0],
    ).toHaveAttribute('href', '/paintings-drawings');
    expect(screen.getAllByRole('link', { name: 'Contact' })[0]).toHaveAttribute(
      'href',
      '/contact',
    );
  });

  it('renders Hebrew category labels under the he locale', () => {
    renderFilterBar('all', 'he');
    expect(
      screen.getAllByRole('link', { name: 'ציורים ותמונות' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('link', { name: 'צור קשר' }).length,
    ).toBeGreaterThan(0);
  });

  it('marks only the active tab with aria-current', () => {
    renderFilterBar('paintings');
    expect(
      screen.getAllByRole('link', { name: 'Paintings & Drawings' })[0],
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getAllByRole('link', { name: 'Shows' })[0],
    ).not.toHaveAttribute('aria-current');
  });

  it('shows the brand name next to the logo as the page heading', () => {
    renderFilterBar();
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]).toHaveTextContent(en.Hero.nameBold);
    expect(headings[0]).toHaveTextContent(en.Hero.nameRegular);
    expect(headings[0].querySelector('.font-bold')).toHaveTextContent(
      en.Hero.nameBold,
    );
  });
});
