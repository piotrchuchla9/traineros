import { Skeleton } from '@/components/ui/skeleton'
import { AppLayout } from '@/components/shared/AppLayout'

export default function SettingsLoading() {
  return (
    <AppLayout>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-52 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </AppLayout>
  )
}
