import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-foreground">
              TrainerOS <span className="text-muted-foreground font-normal text-sm">Admin</span>
            </span>
            <nav className="flex items-center gap-1">
              <Link
                href="/admin/users"
                className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Użytkownicy
              </Link>
              <Link
                href="/admin/promo-codes"
                className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Kody promo
              </Link>
            </nav>
          </div>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Wróć do aplikacji
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
