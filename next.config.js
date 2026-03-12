/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'vibehyr.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      { source: '/courses/:path*',   destination: '/personal/:path*',  permanent: true },
      { source: '/education/:path*', destination: '/educators/:path*', permanent: true },
      { source: '/workplace/:path*', destination: '/business/:path*',  permanent: true },
    ]
  },
};

module.exports = nextConfig;
