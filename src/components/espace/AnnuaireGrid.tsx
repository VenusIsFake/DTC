"use client";

import React, { useMemo, useState } from "react";
import { Search, Users, ShieldAlert } from "lucide-react";
import type { DirectoryEntry } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import { inputClass } from "@/components/ui/form";

export default function AnnuaireGrid({
  initialEntries,
  dbError,
}: {
  initialEntries: DirectoryEntry[];
  dbError: boolean;
}) {
  const [entries] = useState(initialEntries);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.full_name.toLowerCase().includes(q) ||
        (e.promo && String(e.promo).includes(q)) ||
        e.committee.toLowerCase().includes(q)
    );
  }, [entries, query]);

  return (
    <div className="pt-16 sm:pt-28 pb-10 sm:pb-20 px-3.5 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-5 sm:space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
          <Users className="w-3.5 h-3.5" />
          <span>Membres du club</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-white">
          Annuaire <span className="gold-gradient-text">DTC</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          {entries.length} membre{entries.length > 1 ? "s" : ""} · visibilité réservée aux comptes connectés.
          Les coordonnées restent accessibles au bureau uniquement.
        </p>
      </div>

      {dbError && (
        <p className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          Impossible de charger l&apos;annuaire pour le moment.
        </p>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B]" aria-hidden="true" />
        <label htmlFor="annuaire-search" className="sr-only">
          Rechercher un membre
        </label>
        <input
          id="annuaire-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom, promo, commission…"
          className={`${inputClass} pl-9`}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl border border-[#385A75]/40 p-8 text-center">
          <Users className="w-8 h-8 text-[#385A75] mx-auto" />
          <p className="text-sm font-semibold text-white mt-2">
            {entries.length === 0 ? "Aucun membre inscrit pour le moment" : "Aucun résultat"}
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">
            {entries.length === 0
              ? "Les membres qui complètent leur profil apparaissent automatiquement ici."
              : "Essayez un autre nom ou une autre promo."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="glass-card rounded-xl sm:rounded-2xl border border-[#385A75]/40 p-3.5 sm:p-4 flex flex-col items-center text-center space-y-2"
            >
              <UserAvatar name={entry.full_name} src={entry.avatar_url} size={56} />
              <div className="space-y-0.5 min-w-0 w-full">
                <p className="text-xs sm:text-sm font-bold text-white truncate">{entry.full_name || "Membre"}</p>
                <p className="text-[10px] text-[#D4AF37] font-semibold truncate">
                  {entry.promo ? `Promo ${entry.promo}` : "Promo —"}
                </p>
                <p className="text-[10px] text-[#94A3B8] truncate">{entry.committee || "Sans commission"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
