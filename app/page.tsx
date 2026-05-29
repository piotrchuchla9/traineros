import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { LangSwitcher } from '@/components/shared/LangSwitcher'
import { getServerT } from '@/lib/i18n/server'
import { cn } from '@/lib/utils'

export default async function LandingPage() {
  const t = await getServerT()
  const l = t.landing

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-xl font-bold text-foreground">TrainerOS</span>
        <div className="flex items-center gap-2">
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
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
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
                  <div className="text-3xl font-bold">0 zł</div>
                  <div className="text-sm text-muted-foreground">{l.for14days}</div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {l.trialFeatures.map(f => <p key={f}>{f}</p>)}
                </CardContent>
              </Card>
            </div>
            <div className="relative pt-4">
              <Badge className="absolute top-0 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">{l.mostPopular}</Badge>
              <Card className="border-primary border-2 h-full">
                <CardHeader>
                  <CardTitle>Basic</CardTitle>
                  <div className="text-3xl font-bold">59 zł</div>
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
                  <div className="text-3xl font-bold">99 zł</div>
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

      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <p>{l.footer}</p>
      </footer>
    </div>
  )
}
