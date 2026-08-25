export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3" role="status" aria-label="Chargement">
      <div className="w-9 h-9 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
      <p className="text-xs font-semibold text-[#94A3B8]">Chargement…</p>
    </div>
  );
}
