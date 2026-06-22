import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
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
  description: 'Create and share workout plans with your clients. Manage clients, exercises, and schedules in one place.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'TrainerOS',
    title: 'TrainerOS — Personal Training Platform',
    description: 'Create and share workout plans with your clients. Manage clients, exercises, and schedules in one place.',
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
      </head>
      <body className={`${inter.className} h-full antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <LangProvider>
          {children}
          </LangProvider>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
