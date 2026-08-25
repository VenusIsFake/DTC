function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl border border-[#385A75]/40 p-4 sm:p-5 space-y-3 animate-pulse">
      <div className="h-3 w-20 rounded bg-[#1B2E4B]" />
      <div className="h-5 w-3/4 rounded bg-[#1B2E4B]" />
      <div className="h-3 w-full rounded bg-[#1B2E4B]/70" />
      <div className="h-3 w-2/3 rounded bg-[#1B2E4B]/70" />
      <div className="h-9 w-36 rounded-full bg-[#1B2E4B]" />
    </div>
  );
}

export default function AnnoncesLoading() {
  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6" aria-label="Chargement des annonces" role="status">
      <div className="space-y-2 animate-pulse">
        <div className="h-8 w-56 rounded bg-[#1B2E4B]" />
        <div className="h-3 w-72 rounded bg-[#1B2E4B]/70" />
      </div>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
