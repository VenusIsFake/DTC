"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Surfaced for the dev in the browser console; the UI stays simple French.
  console.error(error);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-dtc-gold/10 border border-dtc-gold/30 flex items-center justify-center">
        <AlertTriangle className="w-5 h-5 text-dtc-gold" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-heading font-bold text-dtc-ink">Une erreur est survenue</h2>
        <p className="text-xs sm:text-sm text-dtc-inkMuted max-w-sm">
          Cette page n&apos;a pas pu se charger complètement. Réessayez — si le problème persiste,
          le bureau a été prévenu par les journaux.
        </p>
      </div>
      <button
        onClick={reset}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-sm bg-dtc-gold text-dtc-paper hover:brightness-110 transition-all active:scale-95"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Réessayer</span>
      </button>
    </div>
  );
}
