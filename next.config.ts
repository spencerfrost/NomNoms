import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Common recipe image sources
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.marthastewart.com',
      },
      {
        protocol: 'https',
        hostname: 'www.foodnetwork.com',
      },
      {
        protocol: 'https',
        hostname: 'www.allrecipes.com',
      },
      {
        protocol: 'https',
        hostname: 'www.tasteofhome.com',
      },
      {
        protocol: 'https',
        hostname: 'www.epicurious.com',
      },
      {
        protocol: 'https',
        hostname: 'www.bonappetit.com',
      },
      {
        protocol: 'https',
        hostname: 'www.seriouseats.com',
      },
      {
        protocol: 'https',
        hostname: 'www.kingarthurbaking.com',
      },
      {
        protocol: 'https',
        hostname: 'www.foodandwine.com',
      },
      // Generic CDN patterns
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      // Allow any for development - comment out for production
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
