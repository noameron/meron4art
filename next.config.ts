import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  devIndicators: false,
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
