"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Lightbulb, ArrowBigUp, Loader2, Activity, ShieldCheck } from "lucide-react";
import type { AnnouncementBoardItem, IdeaBoardItem } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDateTime, formatRelative } from "@/lib/format";
import { Badge } from "@/components/ui/form";

interface MyActivity {
  ideas: IdeaBoardItem[];
  votedIdeas: { id: string; title: string; status: IdeaBoardItem["status"]; vote_count: number }[];
  rsvps: { id: string; title: string; event_date: string | null; location: string }[];
}

const EMPTY: MyActivity = { ideas: [], votedIdeas: [], rsvps: [] };

export default function ActivitiesPanel() {
  const { user, isAdmin } = useAuth();
  const [activity, setActivity] = useState<MyActivity | null>(null);
  const [stats, setStats] = useState<{ members: number; openIdeas: number; nextAtelier: AnnouncementBoardItem | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    (async () => {
      try {
        const [ideasRes, votesRes, rsvpsRes] = await Promise.all([
        supabase.from("idea_board").select("*").order("created_at", { ascending: false }),
        supabase.from("votes").select("idea_id").eq("user_id", user.id),
        supabase.from("rsvps").select("announcement_id").eq("user_id", user.id),
      ]);
      if (cancelled) return;

      const ideas = (ideasRes.data ?? []) as IdeaBoardItem[];
      const myIdeaIds = new Set(votesRes.data?.map((v) => (v as { idea_id: string }).idea_id) ?? []);
      const myAnnouncementIds = new Set(
        rsvpsRes.data?.map((r) => (r as { announcement_id: string }).announcement_id) ?? []
      );

      let rsvpAnnouncements: MyActivity["rsvps"] = [];
      if (myAnnouncementIds.size > 0) {
        const { data: anns } = await supabase
          .from("announcement_board")
          .select("*")
          .in("id", Array.from(myAnnouncementIds));
        rsvpAnnouncements = ((anns ?? []) as AnnouncementBoardItem[]).map((a) => ({
          id: a.id,
          title: a.title,
          event_date: a.event_date,
          location: a.location,
        }));
      }

      setActivity({
        ideas: ideas.filter((i) => i.author_id === user.id),
        votedIdeas: ideas
          .filter((i) => myIdeaIds.has(i.id))
          .map((i) => ({ id: i.id, title: i.title, status: i.status, vote_count: i.vote_count })),
        rsvps: rsvpAnnouncements,
      });

      if (isAdmin) {
        const [membersRes, openIdeasRes, nextRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("ideas").select("id", { count: "exact", head: true }).eq("status", "open"),
          supabase
            .from("announcement_board")
            .select("*")
            .eq("kind", "atelier")
            .gte("event_date", new Date().toISOString())
            .order("event_date", { ascending: true })
            .limit(1),
        ]);
        if (!cancelled) {
          setStats({
            members: membersRes.count ?? 0,
            openIdeas: openIdeasRes.count ?? 0,
            nextAtelier: ((nextRes.data ?? []) as AnnouncementBoardItem[])[0] ?? null,
          });
        }
      }
      } catch {
        // DB unreachable: show empty history instead of an endless spinner.
        if (!cancelled) setActivity(EMPTY);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isAdmin]);

  if (!activity) {
    return (
      <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-8 text-center">
        <Loader2 className="w-5 h-5 text-[#8A6D1F] animate-spin mx-auto" />
        <p className="text-xs text-[#5C6672] mt-2">Chargement de vos activités…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Admin quick panel */}
      {isAdmin && stats && (
        <div className="glass-card rounded-lg border border-[#8A6D1F]/40 p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-1.5 text-sm font-heading font-bold text-[#16233A]">
              <ShieldCheck className="w-4 h-4 text-[#8A6D1F]" />
              Panneau administrateur
            </h3>
            <Link
              href="/admin"
              className="text-[11px] font-bold text-[#8A6D1F] hover:text-[#8A6D1F] transition-colors"
            >
              Ouvrir la console →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-[#EFECE4]/50 border border-[#DCD7CB]/30 space-y-0.5">
              <span className="text-[10px] text-[#5C6672] block">Comptes membres</span>
              <span className="text-lg font-semibold text-[#16233A]">{stats.members}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#EFECE4]/50 border border-[#DCD7CB]/30 space-y-0.5">
              <span className="text-[10px] text-[#5C6672] block">Idées ouvertes</span>
              <span className="text-lg font-semibold text-[#16233A]">{stats.openIdeas}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#EFECE4]/50 border border-[#DCD7CB]/30 space-y-0.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-[#5C6672] block">Prochain atelier</span>
              <span className="text-xs font-bold text-[#16233A] leading-tight block truncate">
                {stats.nextAtelier ? stats.nextAtelier.title : "Aucun planifié"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* My ideas */}
      <section className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-6 space-y-3">
        <h3 className="flex items-center gap-1.5 text-sm font-heading font-bold text-[#16233A]">
          <Lightbulb className="w-4 h-4 text-[#8A6D1F]" />
          Mes idées ({activity.ideas.length})
        </h3>
        {activity.ideas.length === 0 && (
          <p className="text-xs text-[#5C6672]">
            Aucune idée proposée.{" "}
            <Link href="/idees" className="text-[#8A6D1F] font-semibold hover:underline underline-offset-2">
              Pitcher ma première idée
            </Link>
          </p>
        )}
        <ul className="space-y-2">
          {activity.ideas.map((idea) => (
            <li key={idea.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#EFECE4]/40 border border-[#DCD7CB]/25">
              <span className="text-xs font-semibold text-[#16233A] truncate">{idea.title}</span>
              <span className="flex items-center gap-2 shrink-0">
                <Badge tone="gold">{idea.vote_count} vote{idea.vote_count > 1 ? "s" : ""}</Badge>
                <span className="text-[10px] text-[#7A828D]">{formatRelative(idea.created_at)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* My votes */}
      <section className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-6 space-y-3">
        <h3 className="flex items-center gap-1.5 text-sm font-heading font-bold text-[#16233A]">
          <ArrowBigUp className="w-4 h-4 text-[#8A6D1F]" />
          Mes votes ({activity.votedIdeas.length})
        </h3>
        {activity.votedIdeas.length === 0 && (
          <p className="text-xs text-[#5C6672]">
            Aucun vote pour l&apos;instant.{" "}
            <Link href="/idees" className="text-[#8A6D1F] font-semibold hover:underline underline-offset-2">
              Découvrir les idées du club
            </Link>
          </p>
        )}
        <ul className="space-y-2">
          {activity.votedIdeas.map((idea) => (
            <li key={idea.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#EFECE4]/40 border border-[#DCD7CB]/25">
              <span className="text-xs font-semibold text-[#16233A] truncate">{idea.title}</span>
              <span className="text-[10px] text-[#7A828D] shrink-0">{idea.vote_count} votes</span>
            </li>
          ))}
        </ul>
      </section>

      {/* My RSVPs */}
      <section className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-6 space-y-3">
        <h3 className="flex items-center gap-1.5 text-sm font-heading font-bold text-[#16233A]">
          <CalendarDays className="w-4 h-4 text-[#8A6D1F]" />
          Mes participations ({activity.rsvps.length})
        </h3>
        {activity.rsvps.length === 0 && (
          <p className="text-xs text-[#5C6672]">
            Aucune participation confirmée.{" "}
            <Link href="/annonces" className="text-[#8A6D1F] font-semibold hover:underline underline-offset-2">
              Voir les prochains ateliers
            </Link>
          </p>
        )}
        <ul className="space-y-2">
          {activity.rsvps.map((rsvp) => (
            <li key={rsvp.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#EFECE4]/40 border border-[#DCD7CB]/25">
              <span className="text-xs font-semibold text-[#16233A] truncate">{rsvp.title}</span>
              <span className="text-[10px] text-[#5C6672] shrink-0">{formatDateTime(rsvp.event_date) || "—"}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A828D]">
        <Activity className="w-3.5 h-3.5" />
        Votre historique personnel — visible uniquement par vous.
      </p>
    </div>
  );
}
