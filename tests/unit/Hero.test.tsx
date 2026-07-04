import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from '@/components/Hero';
import en from '@/messages/en.json';
import type { SiteSettings } from '@/sanity/lib/types';

vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace: string) => {
    const table = en[namespace as keyof typeof en] as Record<string, string>;
    return (key: string) => table[key];
  },
}));

vi.mock('@/sanity/lib/image', () => ({
  urlFor: () => {
    const builder = {
      width: () => builder,
      auto: () => builder,
      url: () => 'https://cdn.example.test/hero.jpg',
    };
    return builder;
  },
}));

async function renderHero(heroImage: SiteSettings['heroImage']) {
  const element = await Hero({ heroImage });
  return render(element);
}

describe('Hero', () => {
  it('renders no banner at all when no image is set', async () => {
    const { container } = await renderHero(undefined);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the photo banner above the intro when an image is set', async () => {
    const { container } = await renderHero({
      _type: 'image',
    } as SiteSettings['heroImage']);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://cdn.example.test/hero.jpg');
    const header = container.querySelector('header')!;
    // banner div comes before the intro text block
    expect(header.firstElementChild).toContainElement(img);
  });

  it('always renders the name and bio from messages', async () => {
    await renderHero(undefined);
    expect(
      screen.getByRole('heading', { level: 1, name: en.Hero.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(en.Hero.bio)).toBeInTheDocument();
  });
});
