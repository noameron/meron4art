import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import FilterBar from '@/components/FilterBar';
import en from '@/messages/en.json';
import he from '@/messages/he.json';

function renderFilterBar(
  props: Partial<React.ComponentProps<typeof FilterBar>> = {},
  locale: 'en' | 'he' = 'en',
) {
  const onChange = vi.fn();
  const messages = locale === 'en' ? en : he;
  render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <FilterBar active="all" onChange={onChange} {...props} />
    </NextIntlClientProvider>,
  );
  return { onChange };
}

describe('FilterBar', () => {
  it('renders All plus the three category labels in English', () => {
    renderFilterBar();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Pure Paintings' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Pictures from Galleries' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '3D Arts, Sculptures etc.' }),
    ).toBeInTheDocument();
  });

  it('renders Hebrew labels under the he locale', () => {
    renderFilterBar({}, 'he');
    expect(screen.getByRole('button', { name: 'הכול' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ציורים' })).toBeInTheDocument();
  });

  it('marks only the active filter as pressed', () => {
    renderFilterBar({ active: 'paintings' });
    expect(
      screen.getByRole('button', { name: 'Pure Paintings' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('calls onChange with the clicked category value', async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilterBar();
    await user.click(screen.getByRole('button', { name: 'Pure Paintings' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('paintings');
  });

  it('renders a Contact tab and reports it on click', async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilterBar();
    await user.click(screen.getByRole('button', { name: 'Contact' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('contact');
  });

  it('still fires onChange when the already-active filter is clicked', async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilterBar({ active: 'all' });
    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('all');
  });
});
