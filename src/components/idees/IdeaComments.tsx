"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare, Send, Trash2, Loader2 } from "lucide-react";
import type { CommentBoardItem } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatRelative } from "@/lib/format";
import UserAvatar from "@/components/UserAvatar";

/** Expandable comment thread for one idea. */
export default function IdeaComments({ ideaId, onCountChange }: { ideaId: string; onCountChange: (delta: number) => void }) {
  const { user, isBureau, openAuth } = useAuth();
  const [comments, setComments] = useState<CommentBoardItem[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setComments([]);
      return;
    }
    const { data } = await supabase
      .from("comment_board")
      .select("*")
      .eq("idea_id", ideaId)
      .order("created_at", { ascending: true });
    setComments((data as CommentBoardItem[] | null) ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      openAuth();
      return;
    }
    const body = draft.trim();
    if (!body) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSending(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from("comments")
        .insert({ idea_id: ideaId, body, author_id: user.id });
      if (dbError) throw dbError;
      setDraft("");
      await load();
      onCountChange(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  const remove = async (comment: CommentBoardItem) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("comments").delete().eq("id", comment.id);
    await load();
    onCountChange(-1);
  };

  return (
    <div className="space-y-3 pt-3 border-t border-[#DCD7CB]/30">
      {comments === null && <p className="text-xs text-[#5C6672]">Chargement des commentaires…</p>}
      {comments !== null && comments.length === 0 && (
        <p className="text-xs text-[#5F6774]">Soyez le premier à commenter cette idée.</p>
      )}

      {comments?.map((comment) => (
        <div key={comment.id} className="flex items-start gap-2.5">
          <UserAvatar name={comment.author_name} src={comment.author_avatar} size={28} />
          <div className="flex-1 min-w-0 p-2.5 rounded-xl bg-[#EFECE4]/50 border border-[#DCD7CB]/25">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-[#16233A] truncate">
                {comment.author_name ?? "Membre"}
              </span>
              <span className="text-[10px] text-[#5F6774]">{formatRelative(comment.created_at)}</span>
              {(isBureau || comment.author_id === user?.id) && (
                <button
                  onClick={() => remove(comment)}
                  aria-label="Supprimer le commentaire"
                  className="ml-auto text-[#5F6774] hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-xs text-[#3D4A58] leading-relaxed mt-0.5 whitespace-pre-line">{comment.body}</p>
          </div>
        </div>
      ))}

      <form onSubmit={submit} className="flex items-center gap-2">
        <label htmlFor={`comment-${ideaId}`} className="sr-only">
          Ajouter un commentaire
        </label>
        <input
          id={`comment-${ideaId}`}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
          placeholder={user ? "Ajouter un commentaire constructif…" : "Se connecter pour commenter…"}
          className="flex-1 px-3 py-2 rounded-full bg-white border border-[#DCD7CB]/50 text-xs text-[#16233A] placeholder:text-[#5F6774] focus:outline-none focus:border-[#755B18]/60"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Envoyer le commentaire"
          className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-[#755B18]/15 border border-[#755B18]/40 text-[#755B18] hover:bg-[#755B18]/25 transition-all active:scale-95 disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </form>
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
