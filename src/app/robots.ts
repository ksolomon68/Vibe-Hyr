import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/account', '/auth/callback', '/auth/setup'],
      },
    ],
    sitemap: 'https://vibehyr.com/sitemap.xml',
    host: 'https://vibehyr.com',
  }
}
