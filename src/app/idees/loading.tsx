function SkeletonCard() {
  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#EFECE4]" />
        <div className="h-3 w-24 rounded bg-[#EFECE4]" />
      </div>
      <div className="h-5 w-2/3 rounded bg-[#EFECE4]" />
      <div className="h-3 w-full rounded bg-[#EFECE4]/70" />
      <div className="flex gap-2 pt-1">
        <div className="h-8 w-16 rounded-full bg-[#EFECE4]" />
        <div className="h-8 w-16 rounded-full bg-[#EFECE4]" />
      </div>
    </div>
  );
}

export default function IdeesLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6" aria-label="Chargement des idées" role="status">
      <div className="space-y-2 animate-pulse">
        <div className="h-8 w-48 rounded bg-[#EFECE4]" />
        <div className="h-3 w-72 rounded bg-[#EFECE4]/70" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
