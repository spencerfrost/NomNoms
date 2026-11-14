import type { NextConfig } from 'next';
import { OPTIMIZED_IMAGE_HOSTS } from './lib/image-hosts';

const nextConfig: NextConfig = {
  images: {
    // Only these hosts go through /_next/image. Other remote images are rendered with
    // `unoptimized` (see shouldSkipOptimization) so the optimizer isn't an open proxy.
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map(hostname => ({ protocol: 'https', hostname })),
  },
};

export default nextConfig;
