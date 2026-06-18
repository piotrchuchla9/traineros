import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { LangProvider } from '@/lib/i18n/context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TrainerOS — platforma dla trenerów personalnych',
  description: 'Twórz i udostępniaj plany treningowe swoim klientom bez zakładania konta.',
  icons: {
    icon: '/favicon.svg',
  },
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
