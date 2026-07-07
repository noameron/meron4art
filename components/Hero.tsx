import { getTranslations } from 'next-intl/server';

export { HeroBanner } from './HeroBanner';

export async function HeroIntro() {
  const t = await getTranslations('Hero');

  return (
    <div className="p-6 sm:p-12">
      <h1 className="max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-5xl">
        {t('name')}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed font-light text-neutral-600 sm:text-lg">
        {t('bio')}
      </p>
    </div>
  );
}
