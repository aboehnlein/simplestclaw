import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: ['@simplestclaw/ui', '@simplestclaw/openclaw-client'],
};

export default nextConfig;
