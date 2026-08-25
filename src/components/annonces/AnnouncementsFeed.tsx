"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Pin, PinOff, Pencil, Trash2, Users, X, CalendarDays, MapPin, Plus } from "lucide-react";
import type { Announcement, AnnouncementBoardItem } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { useOverlayDialog } from "@/hooks/useOverlayDialog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDateTime, formatRelative, initials } from "@/lib/format";
import { Badge } from "@/components/ui/form";
import UserAvatar from "@/components/UserAvatar";
import AnnouncementComposer from "@/components/annonces/AnnouncementComposer";

// ---------------------------------------------------------------------------
// Attendees modal (bureau)
// ---------------------------------------------------------------------------

interface Attendee {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  promo: number | null;
}

function AttendeesModal({
  announcement,
  onClose,
}: {
  announcement: AnnouncementBoardItem | null;
  onClose: () => void;
}) {
  const dialogRef = useOverlayDialog<HTMLDivElement>(Boolean(announcement), onClose);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!announcement) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const supabase = getSupabaseBrowserClient();
      try {
        if (supabase) {
          const { data } = await supabase.rpc("announcement_attendees", { a_id: announcement.id });
          if (!cancelled) setAttendees((data as Attendee[] | null) ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [announcement]);

  if (!announcement) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Participants — ${announcement.title}`}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md glass-card rounded-2xl border border-[#385A75]/50 p-5 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-heading font-bold text-white leading-snug">{announcement.title}</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {announcement.rsvp_count} participant{announcement.rsvp_count > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-[#1B2E4B]/80 text-[#94A3B8] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-[55dvh] overflow-y-auto pr-1">
          {loading && <p className="text-xs text-[#94A3B8]">Chargement…</p>}
          {!loading && attendees.length === 0 && (
            <p className="text-xs text-[#94A3B8]">Aucun participant pour le moment.</p>
          )}
          {attendees.map((a) => (
            <div
              key={a.user_id}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1B2E4B]/50 border border-[#385A75]/30"
            >
              <UserAvatar name={a.full_name} src={a.avatar_url} size={34} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{a.full_name || "Membre"}</p>
                {a.promo && <p className="text-[10px] text-[#94A3B8]">Promo {a.promo}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------

const STATUS_TONES: Record<string, "gold" | "green" | "gray"> = {
  published: "green",
  draft: "gold",
  archived: "gray",
};

const STATUS_LABELS: Record<string, string> = {
  published: "Publiée",
  draft: "Brouillon",
  archived: "Archivée",
};

export default function AnnouncementsFeed({ initialItems }: { initialItems: AnnouncementBoardItem[] }) {
  const { user, isBureau, isAdmin, openAuth } = useAuth();
  const [items, setItems] = useState<AnnouncementBoardItem[]>(initialItems);
  const [myRsvps, setMyRsvps] = useState<Set<string>>(new Set());
  const [rsvpPending, setRsvpPending] = useState<Set<string>>(new Set());
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [attendeesFor, setAttendeesFor] = useState<AnnouncementBoardItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Public feed: board view (published only). Bureau: full table + RSVP counts.
  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    if (!isBureau) {
      const { data } = await supabase
        .from("announcement_board")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("event_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      setItems((data as AnnouncementBoardItem[] | null) ?? []);
      return;
    }
    const [annRes, rsvpRes] = await Promise.all([
      supabase
        .from("announcements")
        .select("*, author:profiles(full_name)")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("rsvps").select("announcement_id"),
    ]);
    const rows = (annRes.data ?? []) as unknown as (Announcement & {
      author?: { full_name: string | null };
    })[];
    const counts = new Map<string, number>();
    for (const r of (rsvpRes.data ?? []) as { announcement_id: string }[]) {
      counts.set(r.announcement_id, (counts.get(r.announcement_id) ?? 0) + 1);
    }
    setItems(
      rows.map((row) => ({
        ...row,
        author_name: row.author?.full_name ?? null,
        rsvp_count: counts.get(row.id) ?? 0,
      }))
    );
  }, [isBureau]);

  useEffect(() => {
    if (!isBureau) return;
    refresh();
  }, [isBureau, refresh]);

  // Realtime (Supabase): RSVP headcounts update live — the DB trigger on
  // rsvps bumps announcements.rsvp_count_cache, which re-emits the row.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const trigger = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => refresh(), 400);
    };
    const channel = supabase
      .channel("annonces-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, trigger)
      .subscribe();
    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  // Load my RSVPs
  useEffect(() => {
    if (!user) {
      setMyRsvps(new Set());
      return;
    }
    let cancelled = false;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("rsvps")
      .select("announcement_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (cancelled) return;
        setMyRsvps(
          new Set((data as { announcement_id: string }[] | null)?.map((r) => r.announcement_id) ?? [])
        );
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleRsvp = async (item: AnnouncementBoardItem) => {
    if (!user) {
      openAuth();
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setRsvpPending((prev) => new Set(prev).add(item.id));
    const joined = myRsvps.has(item.id);
    try {
      const { error } = joined
        ? await supabase.from("rsvps").delete().eq("announcement_id", item.id).eq("user_id", user.id)
        : await supabase.from("rsvps").insert({ announcement_id: item.id, user_id: user.id });
      if (error) throw error;
      setMyRsvps((prev) => {
        const next = new Set(prev);
        if (joined) next.delete(item.id);
        else next.add(item.id);
        return next;
      });
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, rsvp_count: Math.max(0, i.rsvp_count + (joined ? -1 : 1)) } : i
        )
      );
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Action impossible.");
      setTimeout(() => setNotice(null), 3500);
    } finally {
      setRsvpPending((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const togglePin = async (item: AnnouncementBoardItem) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase
      .from("announcements")
      .update({ is_pinned: !item.is_pinned })
      .eq("id", item.id);
    if (error) {
      setNotice(error.message);
      setTimeout(() => setNotice(null), 4000);
    } else {
      setNotice(null);
      await refresh();
    }
  };

  const setStatus = async (item: AnnouncementBoardItem, status: Announcement["status"]) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase.from("announcements").update({ status }).eq("id", item.id);
    if (error) {
      setNotice(error.message);
      setTimeout(() => setNotice(null), 4000);
    } else {
      setNotice(null);
      await refresh();
    }
  };

  const remove = async (item: AnnouncementBoardItem) => {
    if (!window.confirm(`Supprimer définitivement « ${item.title} » ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase.from("announcements").delete().eq("id", item.id);
    if (error) {
      setNotice(error.message);
      setTimeout(() => setNotice(null), 4000);
    } else {
      setNotice(null);
      await refresh();
    }
  };

  const openComposer = (item: AnnouncementBoardItem | null) => {
    setEditing(item);
    setComposerOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {isBureau && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[#94A3B8] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            Mode bureau : créez les annonces des prochains ateliers.
          </p>
          <button
            onClick={() => openComposer(null)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#0B132B] hover:brightness-110 shadow-md shadow-[#D4AF37]/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvelle annonce</span>
          </button>
        </div>
      )}

      {notice && (
        <p role="status" className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {notice}
        </p>
      )}

      {items.length === 0 && (        <div className="glass-card rounded-2xl border border-[#385A75]/40 p-8 sm:p-12 text-center space-y-2">
          <CalendarDays className="w-8 h-8 text-[#385A75] mx-auto" />
          <p className="text-sm font-semibold text-white">Aucune annonce pour le moment</p>
          <p className="text-xs text-[#94A3B8]">
            Les ateliers hebdomadaires et informations du club apparaîtront ici en priorité.
          </p>
        </div>
      )}

      {items.map((item) => {
        const joined = myRsvps.has(item.id);
        const pending = rsvpPending.has(item.id);
        const isAtelier = item.kind === "atelier";
        return (
          <article
            key={item.id}
            className={`glass-card rounded-2xl border p-4 sm:p-6 space-y-3 ${
              item.is_pinned ? "border-[#D4AF37]/40" : "border-[#385A75]/40"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={isAtelier ? "gold" : "blue"}>
                  {isAtelier ? <CalendarDays className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                  {isAtelier ? "Atelier" : "Annonce"}
                </Badge>
                {item.is_pinned && (
                  <Badge tone="gold">
                    <Pin className="w-3 h-3" /> Épinglée
                  </Badge>
                )}
                {item.status !== "published" && (
                  <Badge tone={STATUS_TONES[item.status]}>{STATUS_LABELS[item.status]}</Badge>
                )}
              </div>
              {isBureau && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePin(item)}
                    aria-label={item.is_pinned ? "Désépingler" : "Épingler"}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#D4AF37] hover:bg-[#1B2E4B] transition-colors"
                  >
                    {item.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => openComposer(item)}
                    aria-label="Modifier"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#D4AF37] hover:bg-[#1B2E4B] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => remove(item)}
                      aria-label="Supprimer"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-xl font-heading font-bold text-white leading-snug">{item.title}</h3>
              {item.body && (
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-line">{item.body}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs text-[#94A3B8]">
              {item.event_date && (
                <span className="flex items-center gap-1.5 font-medium">
                  <CalendarDays className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {formatDateTime(item.event_date)}
                </span>
              )}
              {item.location && (
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {item.location}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#1B2E4B] border border-[#385A75]/50 inline-flex items-center justify-center text-[9px] font-bold text-[#D4AF37]">
                  {initials(item.author_name)}
                </span>
                {item.author_name ?? "Bureau DTC"} · {formatRelative(item.created_at)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#385A75]/25">
              {isAtelier && item.status === "published" && (
                <button
                  onClick={() => toggleRsvp(item)}
                  disabled={pending}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95 disabled:opacity-60 ${
                    joined
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25"
                      : "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/25"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${joined ? "bg-emerald-400" : "bg-[#D4AF37]"}`} />
                  {joined ? "Je participe ✓" : user ? "Je participe" : "Se connecter pour participer"}
                </button>
              )}
              {isAtelier && (
                <span className="text-[11px] text-[#94A3B8] font-medium px-1">
                  {item.rsvp_count} participant{item.rsvp_count > 1 ? "s" : ""}
                </span>
              )}
              <div className="flex items-center gap-3 ml-auto">
                {isBureau && isAtelier && item.rsvp_count > 0 && (
                  <button
                    onClick={() => setAttendeesFor(item)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#D4AF37] hover:text-[#F59E0B] transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Liste</span>
                  </button>
                )}
                {isBureau && item.status !== "archived" && (
                  <button
                    onClick={() => setStatus(item, "archived")}
                    className="text-[11px] font-medium text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  >
                    Archiver
                  </button>
                )}
                {isBureau && item.status === "archived" && (
                  <button
                    onClick={() => setStatus(item, "published")}
                    className="text-[11px] font-medium text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  >
                    Republier
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}

      <AnnouncementComposer
        isOpen={composerOpen}
        editing={editing}
        onClose={() => setComposerOpen(false)}
        onSaved={refresh}
      />
      <AttendeesModal announcement={attendeesFor} onClose={() => setAttendeesFor(null)} />
    </div>
  );
}
