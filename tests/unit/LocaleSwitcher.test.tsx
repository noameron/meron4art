import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import en from '@/messages/en.json';
import he from '@/messages/he.json';

const replace = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ replace }),
}));

function renderSwitcher(locale: 'en' | 'he') {
  render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === 'en' ? en : he}
    >
      <LocaleSwitcher />
    </NextIntlClientProvider>,
  );
}

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it('offers Hebrew when the current locale is English', () => {
    renderSwitcher('en');
    expect(screen.getByRole('button', { name: 'עברית' })).toBeInTheDocument();
  });

  it('offers English when the current locale is Hebrew', () => {
    renderSwitcher('he');
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
  });

  it('switches en -> he preserving the current path', async () => {
    const user = userEvent.setup();
    renderSwitcher('en');
    await user.click(screen.getByRole('button', { name: 'עברית' }));
    expect(replace).toHaveBeenCalledExactlyOnceWith('/', {
      locale: 'he',
      scroll: false,
    });
  });

  it('switches he -> en preserving the current path', async () => {
    const user = userEvent.setup();
    renderSwitcher('he');
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(replace).toHaveBeenCalledExactlyOnceWith('/', {
      locale: 'en',
      scroll: false,
    });
  });
});
