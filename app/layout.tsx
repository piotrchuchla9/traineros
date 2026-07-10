import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { LangProvider } from '@/lib/i18n/context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://traineros.live'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TrainerOS — Personal Training Platform',
    template: '%s | TrainerOS',
  },
  description: 'TrainerOS is a SaaS platform for personal trainers. Create structured workout plans and share them with clients via a unique link — no app download required.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'TrainerOS',
    title: 'TrainerOS — Personal Training Platform',
    description: 'TrainerOS is a SaaS platform for personal trainers. Create structured workout plans and share them with clients via a unique link — no app download required.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrainerOS — Personal Training Platform',
    description: 'Create and share workout plans with your clients.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash — runs before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark');})()` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'TrainerOS',
          applicationCategory: 'HealthApplication',
          operatingSystem: 'Web',
          url: siteUrl,
          description: 'SaaS platform for personal trainers to create, manage, and share workout plans with clients via a shareable link.',
          offers: [
            { '@type': 'Offer', name: 'Basic', price: '59', priceCurrency: 'PLN', billingDuration: 'P1M' },
            { '@type': 'Offer', name: 'Pro', price: '99', priceCurrency: 'PLN', billingDuration: 'P1M' },
          ],
          audience: { '@type': 'Audience', audienceType: 'Personal trainers and fitness coaches' },
        }) }} />
      </head>
      <body className={`${inter.className} h-full antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <LangProvider>
          {children}
          </LangProvider>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  )
}
