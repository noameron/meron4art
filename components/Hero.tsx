import { getTranslations } from 'next-intl/server';

export { HeroBanner } from './HeroBanner';

export async function HeroIntro() {
  const t = await getTranslations('Hero');

  return (
    <div className="p-6 sm:p-12">
      <p className="max-w-3xl text-base leading-relaxed font-light text-neutral-600 sm:text-lg">
        {t('bio')}
      </p>
    </div>
  );
}
