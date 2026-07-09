'use client';

import dynamic from 'next/dynamic';
import config from '../../../sanity.config';

// Sanity's compiled internals (react-rx) crash when server-rendered on
// React 19 (`Cannot read properties of null (reading 'useMemoCache')`).
// Studio is browser-only anyway, so skip SSR entirely.
const NextStudio = dynamic(
  () => import('next-sanity/studio').then((mod) => mod.NextStudio),
  { ssr: false }
);

export default function StudioClient() {
  return <NextStudio config={config} />;
}
