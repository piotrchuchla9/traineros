import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { VariantProps } from 'class-variance-authority'

type ButtonLinkProps = React.ComponentPropsWithoutRef<typeof Link> &
  VariantProps<typeof buttonVariants> & {
    disabled?: boolean
  }

export function ButtonLink({ href, variant, size, className, disabled, children, ...props }: ButtonLinkProps) {
  if (disabled) {
    return (
      <span className={cn(buttonVariants({ variant, size, className }), 'pointer-events-none opacity-50')}>
        {children}
      </span>
    )
  }
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </Link>
  )
}
