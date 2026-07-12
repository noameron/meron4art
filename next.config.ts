import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  devIndicators: false,
  // the sculptures tab used to live at /3d-art; keep old links working
  redirects: async () => [
    {
      source: '/:locale(en|he)/3d-art',
      destination: '/:locale/sculptures',
      permanent: true,
    },
  ],
  // Sanity Studio (via `sanity`) pulls in `swr`, whose RSC-conditional
  // export breaks when Next bundles it into the server-component graph.
  // Excluding it forces plain Node resolution instead.
  serverExternalPackages: ['sanity'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

export default withNextIntl(nextConfig);
