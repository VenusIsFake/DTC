"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Radio, Sparkles, Trash2, X, Youtube } from "lucide-react";
import type { PodcastEpisodeRow } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useOverlayDialog } from "@/hooks/useOverlayDialog";
import { youtubeWatchUrl } from "@/lib/format";
import { Field, PrimaryButton, GhostButton, Badge, inputClass } from "@/components/ui/form";

interface EpisodeForm {
  id: string | null;
  episode_number: number;
  title: string;
  guest: string;
  role: string;
  release_date: string;
  youtube_id: string;
  duration: string;
  synopsis: string;
  takeaways: string; // one per line
  sponsor: string;
  poster_image: string;
  is_featured: boolean;
  is_published: boolean;
}

const EMPTY_FORM: EpisodeForm = {
  id: null,
  episode_number: 1,
  title: "",
  guest: "",
  role: "",
  release_date: "",
  youtube_id: "",
  duration: "",
  synopsis: "",
  takeaways: "",
  sponsor: "Flex Dental",
  poster_image: "",
  is_featured: false,
  is_published: true,
};

function toForm(row: PodcastEpisodeRow): EpisodeForm {
  return {
    id: row.id,
    episode_number: row.episode_number,
    title: row.title,
    guest: row.guest,
    role: row.role,
    release_date: row.release_date,
    youtube_id: row.youtube_id,
    duration: row.duration,
    synopsis: row.synopsis,
    takeaways: (row.takeaways ?? []).join("\n"),
    sponsor: row.sponsor,
    poster_image: row.poster_image,
    is_featured: row.is_featured,
    is_published: row.is_published,
  };
}

function EditorModal({
  isOpen,
  form,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  form: EpisodeForm | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const dialogRef = useOverlayDialog<HTMLDivElement>(isOpen, onClose);
  const [draft, setDraft] = useState<EpisodeForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && form) {
      setDraft(form);
      setError(null);
    }
  }, [isOpen, form]);

  const update = <K extends keyof EpisodeForm>(key: K, value: EpisodeForm[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    if (!draft.youtube_id.trim() || !draft.guest.trim()) {
      setError("Invité et ID YouTube sont requis.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        episode_number: Number(draft.episode_number) || 1,
        title: draft.title.trim() || draft.guest.trim(),
        guest: draft.guest.trim(),
        role: draft.role.trim(),
        release_date: draft.release_date.trim(),
        youtube_id: draft.youtube_id.trim(),
        duration: draft.duration.trim(),
        synopsis: draft.synopsis.trim(),
        takeaways: draft.takeaways
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
        sponsor: draft.sponsor.trim() || "Flex Dental",
        poster_image: draft.poster_image.trim(),
        is_featured: draft.is_featured,
        is_published: draft.is_published,
      };
      const { error: dbError } = draft.id
        ? await supabase.from("podcast_episodes").update(payload).eq("id", draft.id)
        : await supabase.from("podcast_episodes").insert(payload);
      if (dbError) throw dbError;
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Éditeur d'épisode podcast"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fadeIn"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-2xl max-h-[92dvh] overflow-y-auto glass-card rounded-lg border border-[#DCD7CB]/50 p-5 sm:p-7 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-heading font-bold text-[#16233A]">
            <Radio className="w-5 h-5 text-[#8A6D1F]" />
            {draft.id ? "Modifier l'épisode" : "Nouvel épisode"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#EFECE4]/80 text-[#5C6672] hover:text-[#16233A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="N° d'épisode" htmlFor="ep-number">
              <input
                id="ep-number"
                type="number"
                min={1}
                value={draft.episode_number}
                onChange={(e) => update("episode_number", Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="Durée (mm:ss)" htmlFor="ep-duration">
              <input
                id="ep-duration"
                type="text"
                value={draft.duration}
                onChange={(e) => update("duration", e.target.value)}
                className={inputClass}
                placeholder="42:30"
              />
            </Field>
            <Field label="Date de sortie" htmlFor="ep-release">
              <input
                id="ep-release"
                type="text"
                value={draft.release_date}
                onChange={(e) => update("release_date", e.target.value)}
                className={inputClass}
                placeholder="Novembre 2025"
              />
            </Field>
          </div>

          <Field label="Invité" htmlFor="ep-guest">
            <input
              id="ep-guest"
              type="text"
              required
              value={draft.guest}
              onChange={(e) => update("guest", e.target.value)}
              className={inputClass}
              placeholder="Professeur …"
            />
          </Field>

          <Field label="Titre / fonction de l'invité" htmlFor="ep-role">
            <input
              id="ep-role"
              type="text"
              value={draft.role}
              onChange={(e) => update("role", e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="ID YouTube" htmlFor="ep-ytid" hint="Les 11 caractères après watch?v=">
              <input
                id="ep-ytid"
                type="text"
                required
                value={draft.youtube_id}
                onChange={(e) => update("youtube_id", e.target.value)}
                className={inputClass}
                placeholder="JoMwnQbmKm0"
              />
            </Field>
            <Field label="Sponsor" htmlFor="ep-sponsor">
              <input
                id="ep-sponsor"
                type="text"
                value={draft.sponsor}
                onChange={(e) => update("sponsor", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field
            label="Poster (URL)"
            htmlFor="ep-poster"
            hint="Collez l'URL d'une image ( miniature YouTube importée ou /media/… )."
          >
            <input
              id="ep-poster"
              type="text"
              value={draft.poster_image}
              onChange={(e) => update("poster_image", e.target.value)}
              className={inputClass}
              placeholder="/media/podcasts/… ou https://i.ytimg.com/…"
            />
          </Field>

          <Field label="Synopsis" htmlFor="ep-synopsis">
            <textarea
              id="ep-synopsis"
              rows={3}
              value={draft.synopsis}
              onChange={(e) => update("synopsis", e.target.value)}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <Field label="Points clés (une ligne = un point)" htmlFor="ep-takeaways">
            <textarea
              id="ep-takeaways"
              rows={4}
              value={draft.takeaways}
              onChange={(e) => update("takeaways", e.target.value)}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-xs text-[#3D4A58] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={draft.is_published}
                onChange={(e) => update("is_published", e.target.checked)}
                className="w-4 h-4 accent-[#8A6D1F]"
              />
              <span>Publié</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-[#3D4A58] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={draft.is_featured}
                onChange={(e) => update("is_featured", e.target.checked)}
                className="w-4 h-4 accent-[#8A6D1F]"
              />
              <Sparkles className="w-3.5 h-3.5 text-[#8A6D1F]" />
              <span>À la une</span>
            </label>
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <GhostButton type="button" onClick={onClose}>
              Annuler
            </GhostButton>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : draft.id ? "Mettre à jour" : "Enregistrer"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PodcastTab() {
  const [episodes, setEpisodes] = useState<PodcastEpisodeRow[] | null>(null);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorForm, setEditorForm] = useState<EpisodeForm | null>(null);

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase
      .from("podcast_episodes")
      .select("*")
      .order("episode_number", { ascending: false });
    setEpisodes((data as PodcastEpisodeRow[] | null) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const runImport = async (event: React.FormEvent) => {
    event.preventDefault();
    setImportError(null);
    setImporting(true);
    try {
      const response = await fetch("/api/admin/youtube-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl }),
      });
      const payload = (await response.json()) as {
        youtube_id?: string;
        title?: string;
        description?: string;
        thumbnail?: string;
        duration?: string;
        release_date?: string;
        error?: string;
      };
      if (!response.ok || !payload.youtube_id) {
        throw new Error(payload.error ?? "Import impossible.");
      }
      const nextNumber = (episodes?.[0]?.episode_number ?? 0) + 1;
      setEditorForm({
        ...EMPTY_FORM,
        episode_number: nextNumber,
        youtube_id: payload.youtube_id,
        // YouTube title usually contains the guest/topic — keep it as synopsis seed.
        synopsis: `${payload.title ?? ""}\n\n${payload.description ?? ""}`.trim().slice(0, 1000),
        duration: payload.duration ?? "",
        release_date: payload.release_date ?? "",
        poster_image: payload.thumbnail ?? "",
        is_published: false,
      });
      setEditorOpen(true);
      setImportUrl("");
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import impossible.");
    } finally {
      setImporting(false);
    }
  };

  const togglePublished = async (row: PodcastEpisodeRow) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("podcast_episodes").update({ is_published: !row.is_published }).eq("id", row.id);
    load();
  };

  const remove = async (row: PodcastEpisodeRow) => {
    if (!window.confirm(`Supprimer l'épisode ${row.episode_number} (${row.guest}) ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("podcast_episodes").delete().eq("id", row.id);
    load();
  };

  return (
    <div className="space-y-4">
      {/* Import box */}
      <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-3">
        <h3 className="flex items-center gap-1.5 text-sm font-heading font-bold text-[#16233A]">
          <Youtube className="w-4 h-4 text-red-600" />
          Importer depuis YouTube
        </h3>
        <p className="text-[11px] text-[#5C6672] leading-relaxed">
          Collez l&apos;URL de la vidéo : titre, miniature, durée et date sont récupérés automatiquement,
          vous n&apos;avez plus qu&apos;à ajuster et publier.
        </p>
        <form onSubmit={runImport} className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="yt-import" className="sr-only">
            URL YouTube
          </label>
          <input
            id="yt-import"
            type="url"
            required
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            className={`${inputClass} flex-1`}
          />
          <PrimaryButton type="submit" disabled={importing} className="shrink-0">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{importing ? "Import…" : "Importer"}</span>
          </PrimaryButton>
        </form>
        {importError && (
          <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {importError}
          </p>
        )}
      </div>

      {/* Episode list */}
      {episodes === null ? (
        <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-8 text-center">
          <Loader2 className="w-5 h-5 text-[#8A6D1F] animate-spin mx-auto" />
        </div>
      ) : (
        <div className="space-y-2">
          {episodes.map((row) => (
            <div
              key={row.id}
              className="glass-card rounded-xl border border-[#DCD7CB]/40 p-3 flex flex-wrap items-center gap-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-[#16233A] truncate">
                  ÉP. {row.episode_number} — {row.guest}
                  {row.is_featured && <Badge tone="gold" className="ml-2">À la une</Badge>}
                  {!row.is_published && <Badge tone="gray" className="ml-2">Brouillon</Badge>}
                </p>
                <a
                  href={youtubeWatchUrl(row.youtube_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[#5C6672] hover:text-[#8A6D1F] truncate block"
                >
                  {row.release_date || "—"} · {row.duration || "—"} · youtube.com/watch?v={row.youtube_id}
                </a>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditorForm(toForm(row));
                    setEditorOpen(true);
                  }}
                  aria-label="Modifier"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-[#8A6D1F] hover:bg-[#EFECE4] transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => togglePublished(row)}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-[#DCD7CB]/60 text-[#3D4A58] hover:border-[#8A6D1F]/50 hover:text-[#8A6D1F] transition-all"
                >
                  {row.is_published ? "Dépublier" : "Publier"}
                </button>
                <button
                  onClick={() => remove(row)}
                  aria-label="Supprimer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-red-600 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {episodes.length === 0 && (
            <p className="text-xs text-[#5C6672] text-center py-6">
              Aucun épisode en base — importez le premier depuis YouTube.
            </p>
          )}
        </div>
      )}

      <EditorModal
        isOpen={editorOpen}
        form={editorForm}
        onClose={() => setEditorOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
