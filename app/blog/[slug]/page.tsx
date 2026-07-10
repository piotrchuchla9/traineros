import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { posts, getPost, type BlogBlock } from '@/lib/blog/posts'

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  const jar = await cookies()
  const locale = jar.get('lang')?.value === 'pl' ? 'pl' : 'en'
  const content = post[locale]
  return {
    title: content.title,
    description: content.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: 'article', title: content.title, description: content.description },
  }
}

function Block({ block }: { block: BlogBlock }) {
  if (block.type === 'h2') return <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">{block.text}</h2>
  if (block.type === 'ul') {
    return (
      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
        {block.items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    )
  }
  return <p className="text-muted-foreground leading-relaxed">{block.text}</p>
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const jar = await cookies()
  const locale = jar.get('lang')?.value === 'pl' ? 'pl' : 'en'
  const content = post[locale]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Blog
        </Link>

        <article className="mt-8">
          <h1 className="text-3xl font-bold text-foreground">{content.title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{post.date}</p>

          <div className="mt-8 space-y-4">
            {content.blocks.map((block, i) => <Block key={i} block={block} />)}
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <Link href="/register" className="text-primary font-medium hover:underline">
              {locale === 'pl' ? 'Wypróbuj TrainerOS za darmo przez 14 dni →' : 'Try TrainerOS free for 14 days →'}
            </Link>
          </div>
        </article>
      </div>

      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <p><a href="mailto:contact@traineros.live" className="hover:text-foreground transition-colors">contact@traineros.live</a></p>
      </footer>
    </div>
  )
}
