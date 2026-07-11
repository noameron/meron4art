import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import GalleryGrid from '@/components/GalleryGrid';
import type { FilterValue, PortfolioItem } from '@/sanity/lib/types';
import en from '@/messages/en.json';

// FilterBar (rendered inside GalleryGrid) uses next-intl's Link → next/navigation,
// unresolved in jsdom; stub it with a plain <a>.
// usePathname/useRouter back FilterBar's embedded LocaleSwitcher.
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: Record<string, unknown>) =>
    createElement('a', { href, ...props }, children as React.ReactNode),
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() }),
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
  imageUrl: 'https://cdn.example.test/fake.jpg',
  ...overrides,
});

const items: PortfolioItem[] = [
  item({
    _id: 'p1',
    category: 'paintings',
    artistName: { en: 'Dana', he: 'דנה' },
  }),
  item({
    _id: 'p2',
    category: 'paintings',
    artistName: { en: 'Roi', he: 'רועי' },
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
  it('shows no gallery on the home (all) view — hero only', () => {
    renderGrid('all');
    expect(screen.queryAllByRole('figure')).toHaveLength(0);
    expect(
      screen.queryByText('No pieces in this category yet.'),
    ).not.toBeInTheDocument();
  });

  it('filters down to the active category', () => {
    renderGrid('paintings');
    expect(screen.getAllByRole('figure')).toHaveLength(2);
    expect(screen.queryByText('Yoav')).not.toBeInTheDocument();
  });

  it('shows the empty state when the active category has no items', () => {
    renderGrid('Sculptures & More');
    expect(screen.queryAllByRole('figure')).toHaveLength(0);
    expect(
      screen.getByText('No pieces in this category yet.'),
    ).toBeInTheDocument();
  });

  it('renders the artist name as a caption under each image', () => {
    renderGrid('paintings');
    // a figcaption in normal flow below the frame, not a hover overlay
    expect(screen.getByText('Dana').closest('figcaption')).not.toBeNull();
    expect(screen.getByText('Roi').closest('figcaption')).not.toBeNull();
  });

  it('shows the bio, centered, on the About tab', () => {
    renderGrid('about');
    const bio = screen.getByText(en.About.bio);
    expect(bio).toBeInTheDocument();
    expect(bio.parentElement).toHaveClass('text-center');
    expect(screen.queryAllByRole('figure')).toHaveLength(0);
  });

  it('shows contact details instead of the gallery on the Contact tab', () => {
    renderGrid('contact');

    // the nav's brand name also renders "Omri Meron" (bold span), so scope
    // to the contact details' own styling to find the right one
    expect(
      screen.getByText('Omri Meron', { selector: '.text-lg' }),
    ).toBeInTheDocument();
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

  it('omits the caption when an item has no artist name', () => {
    renderGrid('paintings', [item({ _id: 'bare', category: 'paintings' })]);
    const figure = screen.getByRole('figure');
    expect(figure.querySelector('figcaption')).toBeNull();
  });
});

describe('GalleryGrid pagination', () => {
  const paintings: PortfolioItem[] = Array.from({ length: 11 }, (_, i) =>
    item({
      _id: `page-${i}`,
      category: 'paintings',
      artistName: { en: `Artist ${i}`, he: `אמן ${i}` },
    }),
  );

  it('shows at most 10 images on the first page', () => {
    renderGrid('paintings', paintings);
    expect(screen.getAllByRole('figure')).toHaveLength(10);
    expect(screen.getByText('Artist 0')).toBeInTheDocument();
    expect(screen.queryByText('Artist 10')).not.toBeInTheDocument();
  });

  it('hides pagination controls when a category has 10 or fewer items', () => {
    renderGrid('paintings');
    expect(
      screen.queryByRole('button', { name: 'Next page' }),
    ).not.toBeInTheDocument();
  });

  it('disables first/previous on the first page, next/last on the last page', () => {
    renderGrid('paintings', paintings);
    expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Previous page' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Next page' }),
    ).not.toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Last page' }),
    ).not.toBeDisabled();
  });

  it('advances to the next page and back after the crossfade', () => {
    vi.useFakeTimers();
    renderGrid('paintings', paintings);

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByText('Artist 10')).toBeInTheDocument();
    expect(screen.queryByText('Artist 0')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'First page' }));
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByText('Artist 0')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('resets to page 1 when the active category changes', () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <GalleryGrid items={paintings} active="paintings" />
      </NextIntlClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Last page' }));
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByText('Artist 10')).toBeInTheDocument();

    rerender(
      <NextIntlClientProvider locale="en" messages={en}>
        <GalleryGrid items={paintings} active="gallery-pictures" />
      </NextIntlClientProvider>,
    );
    rerender(
      <NextIntlClientProvider locale="en" messages={en}>
        <GalleryGrid items={paintings} active="paintings" />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText('Artist 0')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
