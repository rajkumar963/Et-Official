import type { NextConfig } from 'next';

/**
 * Where the Express API runs. The browser calls `/api/v1/*` on this site and Next.js
 * proxies it there, so auth cookies stay first-party (SameSite=Lax works across hosts).
 */
const backendUrl = (process.env.BACKEND_URL || 'https://et-official.onrender.com').replace(/\/+$/, '');

const config: NextConfig = {
  transpilePackages: ['@et-trader/shared'],
  poweredByHeader: false,
  async rewrites() {
    return [{ source: '/api/v1/:path*', destination: `${backendUrl}/api/v1/:path*` }];
  },
  async redirects() {
    return [
      // Legacy URL Google still has indexed (it 404s). A 301 sends visitors and
      // link equity to the homepage and lets Google drop the dead result.
      { source: '/default', destination: '/', permanent: true },
      { source: '/default/:path*', destination: '/', permanent: true },
      { source: '/home', destination: '/', permanent: true },
      { source: '/index', destination: '/', permanent: true },
    ];
  },
};
export default config;
