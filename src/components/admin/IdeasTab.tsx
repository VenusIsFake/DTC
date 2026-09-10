"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import type { IdeaBoardItem, IdeaStatus } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatRelative } from "@/lib/format";
import { Badge, inputClass } from "@/components/ui/form";

const STATUS_LABELS: Record<IdeaStatus, { label: string; tone: "blue" | "gold" | "green" | "red" }> = {
  open: { label: "Ouverte", tone: "blue" },
  planned: { label: "Planifiée", tone: "gold" },
  done: { label: "Réalisée", tone: "green" },
  rejected: { label: "Rejetée", tone: "red" },
};

export default function IdeasTab() {
  const [items, setItems] = useState<IdeaBoardItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data, error: loadError } = await supabase
      .from("idea_board")
      .select("*")
      .order("created_at", { ascending: false });
    if (loadError) {
      setError(loadError.message);
      return;
    }
    setError(null);
    setItems((data as IdeaBoardItem[] | null) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (item: IdeaBoardItem, status: IdeaStatus) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: dbError } = await supabase.from("ideas").update({ status }).eq("id", item.id);
    if (dbError) setError(dbError.message);
    load();
  };

  const remove = async (item: IdeaBoardItem) => {
    if (!window.confirm(`Supprimer l'idée « ${item.title} » et tous ses votes/commentaires ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: dbError } = await supabase.from("ideas").delete().eq("id", item.id);
    if (dbError) setError(dbError.message);
    load();
  };

  if (items === null) {
    return (
      <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-8 text-center">
        {error ? (
          <p role="alert" className="text-xs text-red-700 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            Chargement impossible : {error}
          </p>
        ) : (
          <Loader2 className="w-5 h-5 text-[#755B18] animate-spin mx-auto" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <p role="alert" className="text-xs text-red-700 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <p className="text-xs text-[#5C6672]">
        {items.length} idée{items.length > 1 ? "s" : ""} — changement de statut visible publiquement (badges).
      </p>
      {items.map((item) => {
        const status = STATUS_LABELS[item.status];
        return (
          <div
            key={item.id}
            className="glass-card rounded-xl border border-[#DCD7CB]/40 p-3 flex flex-wrap items-center gap-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-[#16233A] truncate">{item.title}</p>
              <p className="text-[10px] text-[#5C6672]">
                {item.author_name ?? "Membre"} · {formatRelative(item.created_at)} · {item.vote_count} votes ·{" "}
                {item.comment_count} commentaires
              </p>
            </div>
            <Badge tone={status.tone}>{status.label}</Badge>
            <label className="sr-only" htmlFor={`admin-status-${item.id}`}>
              Statut
            </label>
            <select
              id={`admin-status-${item.id}`}
              value={item.status}
              onChange={(e) => setStatus(item, e.target.value as IdeaStatus)}
              className={`${inputClass} !w-auto !py-1.5 !px-2 !text-[11px]`}
            >
              <option value="open">Ouverte</option>
              <option value="planned">Planifiée</option>
              <option value="done">Réalisée</option>
              <option value="rejected">Rejetée</option>
            </select>
            <button
              onClick={() => remove(item)}
              aria-label={`Supprimer — ${item.title}`}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-red-700 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
      {items.length === 0 && (
        <p className="text-xs text-[#5C6672] text-center py-6">Aucune idée soumise pour le moment.</p>
      )}
    </div>
  );
}
