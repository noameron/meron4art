'use client';

import { useTranslations } from 'next-intl';

// ponytail: no backend — submit opens the visitor's mail app pre-filled via
// mailto:. Swap for a form service (Formspree/Resend) if real in-site
// sending is ever needed.
export function buildMailto(to: string, data: FormData): string {
  const subject = `Message from ${data.get('name')}`;
  const body = `${data.get('name')} (${data.get('email')}${
    data.get('phone') ? `, ${data.get('phone')}` : ''
  })\n\n${data.get('message')}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const inputClass =
  'w-full border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400';

export default function ContactForm({ to }: { to: string }) {
  const t = useTranslations('Contact');

  return (
    <form
      className="flex w-full max-w-xl flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = buildMailto(to, new FormData(e.currentTarget));
      }}
    >
      <label className="flex flex-col gap-1 text-sm text-neutral-600">
        {t('name')}
        <input name="name" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-neutral-600">
        {t('email')}
        <input name="email" type="email" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-neutral-600">
        {t('phone')}
        <input name="phone" type="tel" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-neutral-600">
        {t('message')}
        <textarea name="message" required rows={5} className={inputClass} />
      </label>
      <button
        type="submit"
        className="self-end border border-neutral-900 px-6 py-2 text-sm tracking-wide text-neutral-900 uppercase transition-colors hover:bg-neutral-900 hover:text-white"
      >
        {t('send')}
      </button>
    </form>
  );
}
