import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Metadata } from 'next'
import { posts } from '@/lib/blog/posts'

export const metadata: Metadata = {
  title: 'Blog',
  alternates: { canonical: '/blog' },
}

export default async function BlogIndexPage() {
  const jar = await cookies()
  const locale = jar.get('lang')?.value === 'pl' ? 'pl' : 'en'

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← {locale === 'pl' ? 'Strona główna' : 'Home'}
        </Link>

        <h1 className="text-3xl font-bold text-foreground mt-8 mb-10">Blog</h1>

        <div className="space-y-8">
          {posts.map((post) => {
            const content = post[locale]
            return (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {content.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{post.date}</p>
                <p className="text-muted-foreground mt-2">{content.description}</p>
              </Link>
            )
          })}
        </div>
      </div>

      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <p><a href="mailto:contact@traineros.live" className="hover:text-foreground transition-colors">contact@traineros.live</a></p>
      </footer>
    </div>
  )
}
