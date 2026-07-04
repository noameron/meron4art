import { defineField, defineType } from 'sanity';

export const SITE_SETTINGS_ID = 'siteSettings';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'heroImage',
      title: 'Hero Photograph',
      description: 'Full-bleed image shown at the top of the home page.',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
