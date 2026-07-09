import { createElement } from 'react';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { icons } from '@sanity/icons';
import { dataset, projectId } from './sanity/env';
import { schemaTypes } from './sanity/schemaTypes';
import { structure } from './sanity/structure';
import { ReorderTool } from './sanity/tools/ReorderTool';
import { BulkUploadTool } from './sanity/tools/BulkUploadTool';

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure })],
  tools: (prev) => [
    ...prev,
    {
      name: 'bulk-upload',
      title: 'Bulk Upload',
      icon: () => createElement(icons.upload),
      component: BulkUploadTool,
    },
    {
      name: 'reorder',
      title: 'Reorder Portfolio',
      icon: () => createElement(icons.sort),
      component: ReorderTool,
    },
  ],
  document: {
    // Site Settings is a fixed singleton (edited via the structure item
    // above) — hide it from the "create new document" menu.
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter((template) => template.templateId !== 'siteSettings')
        : prev,
  },
});
