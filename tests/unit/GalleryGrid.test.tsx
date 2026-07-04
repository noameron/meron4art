import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import GalleryGrid from '@/components/GalleryGrid';
import type { PortfolioItem } from '@/sanity/lib/types';
import en from '@/messages/en.json';

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

function renderGrid(list: PortfolioItem[] = items) {
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <GalleryGrid items={list} />
    </NextIntlClientProvider>,
  );
}

describe('GalleryGrid', () => {
  beforeEach(() => {
    // selectTab mirrors the active tab into ?tab=, which persists on the
    // shared jsdom window — reset so tests stay independent
    window.history.replaceState(null, '', '/');
  });

  it('shows every item under the default All filter', () => {
    renderGrid();
    expect(screen.getAllByRole('figure')).toHaveLength(3);
  });

  it('filters down to the selected category', async () => {
    const user = userEvent.setup();
    renderGrid();
    await user.click(screen.getByRole('button', { name: 'Pure Paintings' }));
    expect(screen.getAllByRole('figure')).toHaveLength(2);
    expect(screen.queryByText('Yoav')).not.toBeInTheDocument();
  });

  it('shows the empty state when the selected category has no items', async () => {
    const user = userEvent.setup();
    renderGrid();
    await user.click(
      screen.getByRole('button', { name: '3D Arts, Sculptures etc.' }),
    );
    expect(screen.queryAllByRole('figure')).toHaveLength(0);
    expect(
      screen.getByText('No pieces in this category yet.'),
    ).toBeInTheDocument();
  });

  it('returns to the full list when All is re-selected', async () => {
    const user = userEvent.setup();
    renderGrid();
    await user.click(
      screen.getByRole('button', { name: 'Pictures from Galleries' }),
    );
    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getAllByRole('figure')).toHaveLength(3);
  });

  it('renders the empty state immediately for an empty items array', () => {
    renderGrid([]);
    expect(screen.queryAllByRole('figure')).toHaveLength(0);
    expect(
      screen.getByText('No pieces in this category yet.'),
    ).toBeInTheDocument();
  });

  it('renders captions with title only, artist only, or both', () => {
    renderGrid();
    // both
    expect(screen.getByText('Sunset')).toBeInTheDocument();
    expect(screen.getByText('Dana')).toBeInTheDocument();
    // title only
    expect(screen.getByText('Dawn')).toBeInTheDocument();
    // artist only
    expect(screen.getByText('Yoav')).toBeInTheDocument();
  });

  it('shows contact details instead of the gallery on the Contact tab', async () => {
    const user = userEvent.setup();
    renderGrid();
    await user.click(screen.getByRole('button', { name: 'Contact' }));

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
    expect(
      screen.queryByText('No pieces in this category yet.'),
    ).not.toBeInTheDocument();
  });

  it('omits the caption entirely when an item has neither title nor artist', () => {
    renderGrid([item({ _id: 'bare', category: 'paintings' })]);
    const figure = screen.getByRole('figure');
    expect(figure.querySelector('figcaption')).toBeNull();
  });
});
