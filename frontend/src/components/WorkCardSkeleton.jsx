export default function WorkCardSkeleton() {
  return (
    <div className="bg-graphite-soft border border-graphite-line rounded-lg p-4 sm:p-5 animate-pulse">
      <div className="h-3 w-24 bg-graphite-line rounded mb-3" />
      <div className="h-5 w-32 bg-graphite-line rounded mb-4" />
      <div className="h-16 bg-graphite-line/60 rounded" />
    </div>
  )
}
