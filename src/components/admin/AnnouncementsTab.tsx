"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Mail, Pencil, Pin, PinOff, Plus, Trash2 } from "lucide-react";
import type { Announcement } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatRelative } from "@/lib/format";
import { Badge, GhostButton } from "@/components/ui/form";
import AnnouncementComposer from "@/components/annonces/AnnouncementComposer";

const STATUS_LABELS: Record<string, { label: string; tone: "green" | "gold" | "gray" }> = {
  published: { label: "Publiée", tone: "green" },
  draft: { label: "Brouillon", tone: "gold" },
  archived: { label: "Archivée", tone: "gray" },
};

export default function AnnouncementsTab() {
  const [items, setItems] = useState<Announcement[] | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [emailing, setEmailing] = useState<string | null>(null);

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });
    setItems((data as Announcement[] | null) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  // Broadcast the published announcement to every member email via Resend.
  // Dormant (clear 503 message) until RESEND_API_KEY is configured.
  const broadcast = async (item: Announcement) => {
    if (!window.confirm(`Envoyer « ${item.title} » par email à tous les membres ?`)) return;
    setEmailing(item.id);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/email-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcement_id: item.id }),
      });
      const payload = (await res.json()) as { sent?: number; error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Échec de l'envoi.");
      setNotice(`Email envoyé à ${payload.sent} membre(s) ✓`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Échec de l'envoi.");
    } finally {
      setEmailing(null);
      setTimeout(() => setNotice(null), 6000);
    }
  };

  const togglePin = async (item: Announcement) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("announcements").update({ is_pinned: !item.is_pinned }).eq("id", item.id);
    load();
  };

  const setStatus = async (item: Announcement, status: Announcement["status"]) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("announcements").update({ status }).eq("id", item.id);
    load();
  };

  const remove = async (item: Announcement) => {
    if (!window.confirm(`Supprimer « ${item.title} » ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("announcements").delete().eq("id", item.id);
    load();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2.5">
        <p className="text-xs text-[#5C6672]">Cycle de vie : brouillon → publiée → archivée.</p>
        <button
          onClick={() => {
            setEditing(null);
            setComposerOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold bg-[#8A6D1F] text-[#F7F5F0] hover:brightness-110 shadow-md shadow-[#8A6D1F]/20 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle</span>
        </button>
      </div>

      {items === null && (
        <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-8 text-center">
          <Loader2 className="w-5 h-5 text-[#8A6D1F] animate-spin mx-auto" />
        </div>
      )}

      {notice && (
        <p role="status" className="text-xs text-[#3D4A58] bg-[#EFECE4]/80 border border-[#DCD7CB]/40 rounded-lg px-3 py-2">
          {notice}
        </p>
      )}

      <div className="space-y-2">
        {items?.map((item) => {
          const status = STATUS_LABELS[item.status];
          return (
            <div
              key={item.id}
              className="glass-card rounded-xl border border-[#DCD7CB]/40 p-3 flex flex-wrap items-center gap-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-[#16233A] truncate flex items-center gap-2">
                  {item.is_pinned && <Pin className="w-3 h-3 text-[#8A6D1F] shrink-0" />}
                  {item.title}
                </p>
                <p className="text-[10px] text-[#5C6672]">
                  {item.kind === "atelier" ? "Atelier" : "Annonce"} · {formatRelative(item.created_at)}
                </p>
              </div>
              <Badge tone={status.tone}>{status.label}</Badge>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => broadcast(item)}
                  disabled={item.status !== "published" || emailing === item.id}
                  aria-label="Notifier par email"
                  title={
                    item.status === "published"
                      ? "Envoyer par email à tous les membres"
                      : "Publiez d'abord l'annonce"
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-[#8A6D1F] hover:bg-[#EFECE4] transition-colors disabled:opacity-40 disabled:hover:text-[#5C6672] disabled:hover:bg-transparent"
                >
                  {emailing === item.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Mail className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => togglePin(item)}
                  aria-label={item.is_pinned ? "Désépingler" : "Épingler"}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-[#8A6D1F] hover:bg-[#EFECE4] transition-colors"
                >
                  {item.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setEditing(item);
                    setComposerOpen(true);
                  }}
                  aria-label="Modifier"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-[#8A6D1F] hover:bg-[#EFECE4] transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => remove(item)}
                  aria-label="Supprimer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-red-600 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <GhostButton
                onClick={() =>
                  setStatus(
                    item,
                    item.status === "published" ? "archived" : "published"
                  )
                }
                className="!py-1 !px-2.5 !text-[10px]"
              >
                {item.status === "published"
                  ? "Archiver"
                  : item.status === "draft"
                    ? "Publier"
                    : "Republier"}
              </GhostButton>
            </div>
          );
        })}
        {items?.length === 0 && (
          <p className="text-xs text-[#5C6672] text-center py-6">Aucune annonce — créez la première !</p>
        )}
      </div>

      <AnnouncementComposer
        isOpen={composerOpen}
        editing={editing}
        onClose={() => setComposerOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
