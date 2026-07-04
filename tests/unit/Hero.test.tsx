import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroIntro, HeroBanner } from '@/components/Hero';
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

describe('Hero', () => {
  it('intro renders the name and bio from messages', async () => {
    render(await HeroIntro());
    expect(
      screen.getByRole('heading', { level: 1, name: en.Hero.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(en.Hero.bio)).toBeInTheDocument();
  });

  it('banner renders nothing when no image is set', () => {
    const { container } = render(<HeroBanner heroImage={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('banner renders the photo when an image is set', () => {
    const { container } = render(
      <HeroBanner
        heroImage={{ _type: 'image' } as SiteSettings['heroImage']}
      />,
    );
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn.example.test/hero.jpg',
    );
  });
});
