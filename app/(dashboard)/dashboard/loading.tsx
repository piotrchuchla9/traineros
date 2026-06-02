import { Skeleton } from '@/components/ui/skeleton'
import { AppLayout } from '@/components/shared/AppLayout'

export default function DashboardLoading() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[68px] w-full rounded-lg" />
        ))}
      </div>
    </AppLayout>
  )
}
