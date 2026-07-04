import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import GalleryGrid from '@/components/GalleryGrid';
import type { FilterValue, PortfolioItem } from '@/sanity/lib/types';
import en from '@/messages/en.json';

// FilterBar (rendered inside GalleryGrid) uses next-intl's Link → next/navigation,
// unresolved in jsdom; stub it with a plain <a>.
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: Record<string, unknown>) =>
    createElement('a', { href, ...props }, children as React.ReactNode),
}));

vi.mock('@/sanity/lib/image', () => ({
  urlFor: () => {
    const builder = {
      width: () => builder,
      height: () => builder,
      fit: () => builder,
      auto: () => builder,
      url: () => 'https://cdn.example.test/fake.jpg',
    };
    return builder;
  },
}));

const item = (overrides: Partial<PortfolioItem>): PortfolioItem => ({
  _id: Math.random().toString(36).slice(2),
  category: 'paintings',
  image: { _type: 'image' } as PortfolioItem['image'],
  ...overrides,
});

const items: PortfolioItem[] = [
  item({
    _id: 'p1',
    category: 'paintings',
    title: { en: 'Sunset', he: 'שקיעה' },
    artistName: { en: 'Dana', he: 'דנה' },
  }),
  item({
    _id: 'p2',
    category: 'paintings',
    title: { en: 'Dawn', he: 'זריחה' },
  }),
  item({
    _id: 'g1',
    category: 'gallery-pictures',
    artistName: { en: 'Yoav', he: 'יואב' },
  }),
];

function renderGrid(
  active: FilterValue = 'all',
  list: PortfolioItem[] = items,
) {
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <GalleryGrid items={list} active={active} />
    </NextIntlClientProvider>,
  );
}

describe('GalleryGrid', () => {
  it('shows every item under the default All filter', () => {
    renderGrid('all');
    expect(screen.getAllByRole('figure')).toHaveLength(3);
  });

  it('filters down to the active category', () => {
    renderGrid('paintings');
    expect(screen.getAllByRole('figure')).toHaveLength(2);
    expect(screen.queryByText('Yoav')).not.toBeInTheDocument();
  });

  it('shows a category headline for a non-all tab', () => {
    renderGrid('paintings');
    expect(
      screen.getByRole('heading', { name: 'Pure Paintings' }),
    ).toBeInTheDocument();
  });

  it('shows the empty state when the active category has no items', () => {
    renderGrid('3d-sculpture');
    expect(screen.queryAllByRole('figure')).toHaveLength(0);
    expect(
      screen.getByText('No pieces in this category yet.'),
    ).toBeInTheDocument();
  });

  it('renders the empty state immediately for an empty items array', () => {
    renderGrid('all', []);
    expect(screen.queryAllByRole('figure')).toHaveLength(0);
    expect(
      screen.getByText('No pieces in this category yet.'),
    ).toBeInTheDocument();
  });

  it('renders captions with title only, artist only, or both', () => {
    renderGrid('all');
    expect(screen.getByText('Sunset')).toBeInTheDocument();
    expect(screen.getByText('Dana')).toBeInTheDocument();
    expect(screen.getByText('Dawn')).toBeInTheDocument();
    expect(screen.getByText('Yoav')).toBeInTheDocument();
  });

  it('shows contact details instead of the gallery on the Contact tab', () => {
    renderGrid('contact');

    expect(screen.getByText('Omri Meron')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^mailto:.+@.+/),
    );
    const tel = screen
      .getByRole('link', { name: 'Phone' })
      .getAttribute('href');
    expect(tel).toMatch(/^tel:\+972\d+$/);

    expect(screen.queryAllByRole('figure')).toHaveLength(0);
  });

  it('omits the caption entirely when an item has neither title nor artist', () => {
    renderGrid('all', [item({ _id: 'bare', category: 'paintings' })]);
    const figure = screen.getByRole('figure');
    expect(figure.querySelector('figcaption')).toBeNull();
  });
});
