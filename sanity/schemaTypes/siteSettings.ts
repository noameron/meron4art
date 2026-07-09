import { defineField, defineType } from 'sanity';

export const SITE_SETTINGS_ID = 'siteSettings';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'heroImages',
      title: 'Hero Photographs',
      description:
        'Full-bleed image(s) shown at the top of the home page. The frame matches each photo’s own shape without cropping, so use wide/cinematic photos (16:9 or wider) — a standard 3:2 or 4:3 photo will render noticeably smaller and shorter. Add more than one to show an auto-advancing gallery (10s per photo, with dots and swipe to change manually).',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      options: { layout: 'grid' },
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
