import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['react-markdown', 'rehype-highlight'],
};

export default nextConfig;
