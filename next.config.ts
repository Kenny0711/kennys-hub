import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['react-markdown', 'rehype-highlight'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/Kenny0711.png',
      },
    ],
  },
};

export default nextConfig;
