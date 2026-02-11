type SkeletonProps = {
  variant?: 'card' | 'line' | 'screen'
}

export default function LoadingSkeleton({ variant = 'card' }: SkeletonProps) {
  if (variant === 'screen') {
    return <div className="h-48 w-48 animate-pulse rounded-3xl bg-white/60 shadow-soft" />
  }

  return (
    <div className="glass-card h-40 w-full animate-pulse">
      <div className="h-full w-full rounded-3xl bg-white/40" />
    </div>
  )
}
