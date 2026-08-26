"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowBigUp, Check, Lightbulb, MessageSquare, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { IdeaBoardItem, IdeaStatus } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatRelative } from "@/lib/format";
import { Badge, inputClass } from "@/components/ui/form";
import UserAvatar from "@/components/UserAvatar";
import PitchModal from "@/components/idees/PitchModal";
import IdeaComments from "@/components/idees/IdeaComments";

const STATUS_META: Record<IdeaStatus, { label: string; tone: "blue" | "gold" | "green" | "red" }> = {
  open: { label: "Ouverte", tone: "blue" },
  planned: { label: "Planifiée", tone: "gold" },
  done: { label: "Réalisée", tone: "green" },
  rejected: { label: "Rejetée", tone: "red" },
};

const WEEK_MS = 7 * 24 * 3600 * 1000;

type SortMode = "top" | "new";

export default function IdeasBoard({ initialItems }: { initialItems: IdeaBoardItem[] }) {
  const { user, isBureau, openAuth } = useAuth();
  const [items, setItems] = useState<IdeaBoardItem[]>(initialItems);
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set());
  const [votePending, setVotePending] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortMode>("top");
  const [weekOnly, setWeekOnly] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pitchOpen, setPitchOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase.from("idea_board").select("*").order("created_at", { ascending: false });
    setItems((data as IdeaBoardItem[] | null) ?? []);
  }, []);

  // Realtime (Supabase): any vote / comment / idea change by any member
  // live-updates counts and statuses for everyone on the page.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const trigger = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => refresh(), 400);
    };
    const channel = supabase
      .channel("idees-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, trigger)
      .on("postgres_changes", { event: "*", schema: "public", table: "ideas" }, trigger)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, trigger)
      .subscribe();
    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  useEffect(() => {
    if (!user) {
      setMyVotes(new Set());
      return;
    }
    let cancelled = false;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("votes")
      .select("idea_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (cancelled) return;
        setMyVotes(new Set((data as { idea_id: string }[] | null)?.map((v) => v.idea_id) ?? []));
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleVote = async (item: IdeaBoardItem) => {
    if (!user) {
      openAuth();
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setVotePending((prev) => new Set(prev).add(item.id));
    const had = myVotes.has(item.id);
    try {
      const { error } = had
        ? await supabase.from("votes").delete().eq("idea_id", item.id).eq("user_id", user.id)
        : await supabase.from("votes").insert({ idea_id: item.id, user_id: user.id });
      if (error) throw error;
      setMyVotes((prev) => {
        const next = new Set(prev);
        if (had) next.delete(item.id);
        else next.add(item.id);
        return next;
      });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, vote_count: Math.max(0, i.vote_count + (had ? -1 : 1)) } : i))
      );
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Vote impossible.");
      setTimeout(() => setNotice(null), 3500);
    } finally {
      setVotePending((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const changeStatus = async (item: IdeaBoardItem, status: IdeaStatus) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase.from("ideas").update({ status }).eq("id", item.id);
    if (error) {
      setNotice(error.message);
      setTimeout(() => setNotice(null), 4000);
      return;
    }
    setNotice(null);
    refresh();
  };

  const removeIdea = async (item: IdeaBoardItem) => {
    if (!window.confirm(`Supprimer l'idée « ${item.title} » ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase.from("ideas").delete().eq("id", item.id);
    if (error) {
      setNotice(error.message);
      setTimeout(() => setNotice(null), 4000);
      return;
    }
    setNotice(null);
    refresh();
  };

  const bumpComments = (id: string, delta: number) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, comment_count: Math.max(0, i.comment_count + delta) } : i)));

  const visible = useMemo(() => {
    let list = [...items];
    if (weekOnly) {
      const cutoff = Date.now() - WEEK_MS;
      list = list.filter((i) => new Date(i.created_at).getTime() >= cutoff);
    }
    if (sort === "top") {
      list.sort((a, b) => b.vote_count - a.vote_count || b.created_at.localeCompare(a.created_at));
    } else {
      list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return list;
  }, [items, sort, weekOnly]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/80 border border-[#DCD7CB]/40">
          {(
            [
              { id: "top", label: "Top votes" },
              { id: "new", label: "Récentes" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              onClick={() => setSort(option.id)}
              aria-pressed={sort === option.id}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                sort === option.id ? "bg-[#EFECE4] text-[#755B18] border border-[#755B18]/30" : "text-[#5C6672] hover:text-[#16233A]"
              }`}
            >
              {option.label}
            </button>
          ))}
          <button
            onClick={() => setWeekOnly((v) => !v)}
            aria-pressed={weekOnly}
            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              weekOnly ? "bg-[#EFECE4] text-[#755B18] border border-[#755B18]/30" : "text-[#5C6672] hover:text-[#16233A]"
            }`}
          >
            Cette semaine
          </button>
        </div>

        {user && (
          <button
            onClick={() => setPitchOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold bg-[#755B18] text-[#F7F5F0] hover:brightness-110 shadow-md shadow-[#755B18]/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Proposer une idée</span>
          </button>
        )}
      </div>

      {notice && (
        <p role="status" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {notice}
        </p>
      )}

      {visible.length === 0 && (
        <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-8 sm:p-12 text-center space-y-2">
          <Lightbulb className="w-8 h-8 text-[#DCD7CB] mx-auto" />
          <p className="text-sm font-semibold text-[#16233A]">
            {weekOnly ? "Aucune idée cette semaine" : "Aucune idée pour le moment"}
          </p>
          <p className="text-xs text-[#5C6672]">
            {user
              ? "Lancez le mouvement : proposez la première idée du club !"
              : "Connectez-vous pour proposer la première idée et voter."}
          </p>
        </div>
      )}

      {visible.map((item) => {
        const voted = myVotes.has(item.id);
        const pending = votePending.has(item.id);
        const meta = STATUS_META[item.status];
        const isExpanded = expanded === item.id;
        return (
          <article key={item.id} className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Vote column */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleVote(item)}
                  disabled={pending}
                  aria-label={voted ? "Retirer mon vote" : "Voter pour cette idée"}
                  aria-pressed={voted}
                  className={`flex flex-col items-center justify-center w-11 h-12 rounded-xl border transition-all active:scale-95 disabled:opacity-60 ${
                    voted
                      ? "bg-[#755B18]/20 border-[#755B18] text-[#755B18]"
                      : "bg-white border-[#DCD7CB]/50 text-[#5C6672] hover:text-[#755B18] hover:border-[#755B18]/50"
                  }`}
                >
                  {voted ? <Check className="w-4 h-4" /> : <ArrowBigUp className="w-4.5 h-4.5 w-5 h-5" />}
                  <span className="text-xs font-semibold leading-none pt-0.5">{item.vote_count}</span>
                </button>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-heading font-bold text-[#16233A] leading-snug">{item.title}</h2>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </div>
                {item.description && (
                  <p className="text-xs sm:text-sm text-[#3D4A58] leading-relaxed whitespace-pre-line line-clamp-4">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-[#5C6672] pt-0.5">
                  <UserAvatar name={item.author_name} src={item.author_avatar} size={20} />
                  <span className="font-medium">{item.author_name ?? "Membre"}</span>
                  <span>· {formatRelative(item.created_at)}</span>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : item.id)}
                    aria-expanded={isExpanded}
                    className="flex items-center gap-1 ml-auto font-semibold text-[#755B18] hover:text-[#755B18] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{item.comment_count}</span>
                    <span className="hidden sm:inline">commentaire{item.comment_count > 1 ? "s" : ""}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {isBureau && (
                    <>
                      <label className="sr-only" htmlFor={`status-${item.id}`}>
                        Statut de l&apos;idée
                      </label>
                      <select
                        id={`status-${item.id}`}
                        value={item.status}
                        onChange={(e) => changeStatus(item, e.target.value as IdeaStatus)}
                        className={`${inputClass} !w-auto !py-1 !px-2 !text-[11px]`}
                      >
                        <option value="open">Ouverte</option>
                        <option value="planned">Planifiée</option>
                        <option value="done">Réalisée</option>
                        <option value="rejected">Rejetée</option>
                      </select>
                      <button
                        onClick={() => removeIdea(item)}
                        aria-label="Supprimer l'idée"
                        className="text-[#5F6774] hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {isExpanded && <IdeaComments ideaId={item.id} onCountChange={(d) => bumpComments(item.id, d)} />}
          </article>
        );
      })}

      {!user && items.length > 0 && (
        <p className="text-center text-xs text-[#5F6774]">
          <button onClick={() => openAuth()} className="text-[#755B18] font-semibold hover:underline underline-offset-2">
            Connectez-vous
          </button>{" "}
          pour voter, commenter et proposer vos idées.
        </p>
      )}

      <PitchModal isOpen={pitchOpen} onClose={() => setPitchOpen(false)} onSaved={refresh} />
    </div>
  );
}
