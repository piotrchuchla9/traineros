import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { LangSwitcher } from '@/components/shared/LangSwitcher'
import { getServerT } from '@/lib/i18n/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { posts } from '@/lib/blog/posts'

export default async function LandingPage() {
  let authenticated = false
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    authenticated = !!user
  } catch {
    // Show landing page on any auth error
  }
  if (authenticated) redirect('/dashboard')

  const t = await getServerT()
  const l = t.landing
  const jar = await cookies()
  const locale = jar.get('lang')?.value === 'pl' ? 'pl' : 'en'

  return (
    <div className="min-h-screen bg-background app-bg relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute left-1/2 top-[-15%] -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-blue-300/40 dark:bg-blue-500/20 blur-[130px]" />
        <div className="absolute right-[-8%] top-1/4 w-[500px] h-[500px] rounded-full bg-violet-300/25 dark:bg-violet-500/15 blur-[110px]" />
        <div className="absolute left-[-5%] bottom-1/4 w-[420px] h-[420px] rounded-full bg-indigo-200/30 dark:bg-indigo-500/15 blur-[120px]" />
      </div>
      {/* Nav */}
      <nav className="relative z-10 border-b border-border px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-xl font-bold text-foreground">TrainerOS</span>
        <div className="flex items-center gap-2">
          <Link href="/blog" className="px-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Blog
          </Link>
          <LangSwitcher />
          <ThemeSwitcher />
          <Link href="/login" className={cn(buttonVariants({ variant: 'ghost' }))}>
            {l.login}
          </Link>
          <Link href="/register" className={cn(buttonVariants({ variant: 'default' }))}>
            {l.start}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        <Badge className="mb-6">{l.trialBadge}</Badge>
        <h1 className="text-5xl font-bold text-foreground leading-tight mb-6">
          {l.heroTitle}<br />
          <span className="text-primary">{l.heroHighlight}</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          {l.heroDesc}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className={cn(buttonVariants({ size: 'lg' }), 'h-12 px-8 text-base')}>
            {l.heroCta}
          </Link>
          <a href="#cennik" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-12 px-8 text-base')}>
            {l.heroPricing}
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-12">{l.howTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {l.steps.map(({ title, desc }, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{i + 1}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">{l.featuresTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {l.features.map(({ icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-5 space-y-2">
                <div className="text-2xl">{icon}</div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="cennik" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">{l.pricingTitle}</h2>
          <p className="text-muted-foreground mb-12">{l.pricingDesc}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
            <div className="pt-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Trial</CardTitle>
                  <div className="text-3xl font-bold">{l.prices.trial}</div>
                  <div className="text-sm text-muted-foreground">{l.for14days}</div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {l.trialFeatures.map(f => <p key={f}>{f}</p>)}
                </CardContent>
              </Card>
            </div>
            <div className="relative pt-4">
              <Badge className="absolute top-2 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">{l.mostPopular}</Badge>
              <Card className="border-primary border-2 h-full">
                <CardHeader>
                  <CardTitle>Basic</CardTitle>
                  <div className="text-3xl font-bold">{l.prices.basic}</div>
                  <div className="text-sm text-muted-foreground">{l.perMonth}</div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {l.basicFeatures.map(f => <p key={f}>{f}</p>)}
                </CardContent>
              </Card>
            </div>
            <div className="pt-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <div className="text-3xl font-bold">{l.prices.pro}</div>
                  <div className="text-sm text-muted-foreground">{l.perMonth}</div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {l.proFeatures.map(f => <p key={f}>{f}</p>)}
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="mt-10">
            <Link href="/register" className={cn(buttonVariants({ size: 'lg' }), 'h-12 px-10 text-base')}>
              {l.pricingCta}
            </Link>
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            {locale === 'pl' ? 'Z bloga' : 'From the blog'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {posts.map((post) => {
              const content = post[locale]
              return (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-xl border border-border bg-card p-5 space-y-2 hover:border-primary transition-colors">
                  <h3 className="font-semibold text-foreground">{content.title}</h3>
                  <p className="text-sm text-muted-foreground">{content.description}</p>
                </Link>
              )
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/blog" className="text-sm text-primary hover:underline">
              {locale === 'pl' ? 'Zobacz wszystkie artykuły →' : 'See all articles →'}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground space-y-1">
        <p>© {new Date().getFullYear()} TrainerOS. {l.footer}</p>
        <p><a href="mailto:contact@traineros.live" className="hover:text-foreground transition-colors">contact@traineros.live</a></p>
        <p className="flex justify-center gap-4">
          <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        </p>
      </footer>
    </div>
  )
}
