import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { Footer } from '@/components/Footer';
import en from '@/messages/en.json';

let mockPathname = '/';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: Record<string, unknown>) =>
    createElement('a', { href, ...props }, children as React.ReactNode),
  usePathname: () => mockPathname,
}));

function renderFooter() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <Footer locale="en" />
    </NextIntlClientProvider>,
  );
}

describe('Footer', () => {
  it('lists all tabs in the sitemap, including About', () => {
    mockPathname = '/';
    renderFooter();
    for (const name of [
      'Home',
      'Paintings & Drawings',
      '3D Art',
      'Shows',
      'About',
      'Contact',
    ]) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
  });

  it('marks the current tab as active with aria-current', () => {
    mockPathname = '/about';
    renderFooter();
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('link', { name: 'Paintings & Drawings' }),
    ).not.toHaveAttribute('aria-current');
  });
});
