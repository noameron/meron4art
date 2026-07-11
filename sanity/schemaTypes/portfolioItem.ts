import { defineField, defineType } from 'sanity';
// Category labels shown in the Studio dropdown/tabs are sourced from the
// same file as the site's nav headlines, so the two can't drift apart.
import en from '@/messages/en.json';
import { ImageMetaInput } from '../components/ImageMetaInput';

// Reusable localized string: renders as EN / HE tabs in the Studio
export const localizedString = defineType({
  name: 'localizedString',
  title: 'Localized string',
  type: 'object',
  fieldsets: [
    {
      name: 'translations',
      title: 'Translations',
      options: { collapsible: false },
    },
  ],
  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'string',
      fieldset: 'translations',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'he',
      title: 'Hebrew (עברית)',
      type: 'string',
      fieldset: 'translations',
      validation: (rule) => rule.required(),
    }),
  ],
});

export const CATEGORIES = [
  { title: en.Filters.paintings, value: 'paintings' },
  { title: en.Filters['gallery-pictures'], value: 'gallery-pictures' },
  { title: en.Filters['Sculptures & More'], value: 'Sculptures & More' },
] as const;

export const portfolioItem = defineType({
  name: 'portfolioItem',
  title: 'Portfolio Item',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Artwork Photograph',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
      // shows the upload's pixel dimensions and file size below the image
      components: { input: ImageMetaInput },
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [...CATEGORIES],
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'artistName',
      title: 'Artist Name',
      type: 'localizedString',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first in the gallery.',
      initialValue: 100,
    }),
  ],
  preview: {
    select: {
      title: 'artistName.en',
      media: 'image',
    },
  },
});
