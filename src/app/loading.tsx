export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3" role="status" aria-label="Chargement">
      <div className="w-9 h-9 rounded-full border-2 border-[#8A6D1F]/30 border-t-[#8A6D1F] animate-spin" />
      <p className="text-xs font-semibold text-[#5C6672]">Chargement…</p>
    </div>
  );
}
