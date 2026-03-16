const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // Courses/personal pages — NetworkFirst so they work offline after first visit
      {
        urlPattern: /^https:\/\/vibehyr\.com\/(personal|courses)(\/.*)?$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'courses-cache',
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // Static images — long-lived cache
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-images',
          expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // Google Fonts
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
})

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
}

module.exports = withPWA(nextConfig)
