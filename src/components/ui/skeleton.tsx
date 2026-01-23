import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-shimmer', className)}
      {...props}
    />
  )
}

export function GameCardSkeleton() {
  return (
    <div className="scoreboard-panel p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      {/* Teams */}
      <div className="space-y-2">
        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="score-led-amber opacity-30">
            <Skeleton className="h-7 w-12" />
          </div>
        </div>
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="score-led-amber opacity-30">
            <Skeleton className="h-7 w-12" />
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="h-8 w-8 shrink-0" />
      <div className="flex-1">
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-3/4" />
      </div>
    </div>
  )
}
