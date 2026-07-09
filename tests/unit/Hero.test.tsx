import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import type { SanityImageSource } from '@sanity/image-url';
import { HeroIntro, HeroBanner } from '@/components/Hero';
import en from '@/messages/en.json';
import type { SiteSettings } from '@/sanity/lib/types';

vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace: string) => {
    const table = en[namespace as keyof typeof en] as Record<string, string>;
    return (key: string) => table[key];
  },
}));

// distinguish images by their (test-only) id so we can assert which one is
// showing after navigation, instead of every image resolving to one URL
vi.mock('@/sanity/lib/image', () => ({
  urlFor: (image: { id: string }) => {
    const builder = {
      width: () => builder,
      auto: () => builder,
      url: () => `https://cdn.example.test/${image.id}.jpg`,
    };
    return builder;
  },
}));

function image(id: string): SanityImageSource {
  return { _type: 'image', id } as unknown as SanityImageSource;
}

function renderBanner(heroImages: SiteSettings['heroImages']) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <HeroBanner heroImages={heroImages} />
    </NextIntlClientProvider>,
  );
}

describe('Hero', () => {
  it('intro renders the bio from messages', async () => {
    render(await HeroIntro());
    expect(screen.getByText(en.Hero.bio)).toBeInTheDocument();
  });

  it('banner renders nothing when there are no images', () => {
    const { container } = renderBanner(undefined);
    expect(container).toBeEmptyDOMElement();
  });

  it('banner renders a single photo with no dots', () => {
    // decorative hero photos use alt="", which is the presentation role,
    // not "img" — query the raw element instead of by accessible role
    const { container } = renderBanner([image('a')]);
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn.example.test/a.jpg',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  describe('with multiple photos', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows one dot per photo and switches on click', async () => {
      const user = userEvent.setup();
      renderBanner([image('a'), image('b'), image('c')]);

      const dots = screen.getAllByRole('button');
      expect(dots).toHaveLength(3);
      expect(dots[0]).toHaveAttribute('aria-current', 'true');

      await user.click(dots[2]);
      expect(dots[2]).toHaveAttribute('aria-current', 'true');
      expect(dots[0]).not.toHaveAttribute('aria-current');
    });

    it('auto-advances after 10 seconds and loops back at the end', () => {
      vi.useFakeTimers();
      renderBanner([image('a'), image('b')]);

      const dots = screen.getAllByRole('button');
      expect(dots[0]).toHaveAttribute('aria-current', 'true');

      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(dots[1]).toHaveAttribute('aria-current', 'true');

      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(dots[0]).toHaveAttribute('aria-current', 'true');
    });

    it('swipes to the next photo past the drag threshold', () => {
      const { container } = renderBanner([image('a'), image('b')]);
      const track = container.querySelector('img')!.parentElement!;

      fireEvent.pointerDown(track, { clientX: 200 });
      fireEvent.pointerUp(track, { clientX: 120 });

      expect(screen.getAllByRole('button')[1]).toHaveAttribute(
        'aria-current',
        'true',
      );
    });
  });
});
