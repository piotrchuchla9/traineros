import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://traineros.live'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/clients/', '/admin/', '/client/', '/api/', '/auth/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
