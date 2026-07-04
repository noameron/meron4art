import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { createElement } from 'react';

// RTL's auto-cleanup only registers when test globals are enabled; with
// explicit vitest imports we have to wire it up ourselves.
afterEach(cleanup);

// Render next/image as a plain <img> so tests don't need the Next.js
// image-optimization pipeline. Non-<img> props (fill, priority, sizes)
// are dropped to avoid React unknown-attribute warnings.
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, sizes, ...imgProps } = props;
    void fill;
    void priority;
    void sizes;
    return createElement('img', imgProps);
  },
}));
