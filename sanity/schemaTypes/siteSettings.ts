import { defineField, defineType } from 'sanity';
import { ImageMetaInput } from '../components/ImageMetaInput';

export const SITE_SETTINGS_ID = 'siteSettings';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // the home-page hero rotation is drawn automatically from the portfolio
  // items now, so there is no hero photo field to edit here anymore; only
  // its pace is configurable below
  fields: [
    defineField({
      name: 'heroIntervalSeconds',
      title: 'Hero Rotation Interval (seconds)',
      description:
        'How long each home-page hero photo is shown before advancing to the next.',
      type: 'number',
      initialValue: 5,
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'aboutImage',
      title: 'About Photo',
      description: 'Portrait photo shown alongside the bio on the About tab.',
      type: 'image',
      options: { hotspot: true },
      // shows the upload's pixel dimensions and file size below the image
      components: { input: ImageMetaInput },
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
