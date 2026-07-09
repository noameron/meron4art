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
        'Full-bleed image(s) shown at the top of the home page. Add more than one to show an auto-advancing gallery (5s per photo, with dots and swipe to change manually).',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      options: { layout: 'grid' },
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
