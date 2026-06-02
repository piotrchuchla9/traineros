'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from './ThemeSwitcher'
import { LangSwitcher } from './LangSwitcher'
import { NavigationProgress } from './NavigationProgress'
import { useT } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useT()

  const NAV_ITEMS = [
    { href: '/dashboard', label: t.nav.clients },
    { href: '/exercises', label: t.nav.exercises },
    { href: '/settings', label: t.nav.settings },
  ]

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col bg-background app-bg">
      <NavigationProgress />
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-bold text-foreground">
              TrainerOS
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <LangSwitcher />
            <ThemeSwitcher />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              {t.nav.logout}
            </Button>
          </div>
        </div>
      </header>
      <main
        key={pathname}
        className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        {children}
      </main>
    </div>
  )
}
