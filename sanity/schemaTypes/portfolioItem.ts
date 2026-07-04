import { defineField, defineType } from 'sanity';

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
  { title: 'Pure Paintings', value: 'paintings' },
  { title: 'Pictures from Galleries', value: 'gallery-pictures' },
  { title: '3D Arts, Sculptures etc.', value: '3d-sculpture' },
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
      name: 'title',
      title: 'Artwork Title',
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
      title: 'title.en',
      subtitle: 'artistName.en',
      media: 'image',
    },
  },
});
