"use client";

import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Pin, Upload, X } from "lucide-react";
import type { Announcement } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { useOverlayDialog } from "@/hooks/useOverlayDialog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadClubImage, clubUploadErrorMessage } from "@/lib/mediaUpload";
import { Field, PrimaryButton, GhostButton, inputClass } from "@/components/ui/form";

export interface ComposerForm {
  kind: "atelier" | "annonce";
  title: string;
  body: string;
  poster_url: string;
  event_date: string; // datetime-local value
  location: string;
  is_pinned: boolean;
  status: "draft" | "published" | "archived";
}

const EMPTY_FORM: ComposerForm = {
  kind: "atelier",
  title: "",
  body: "",
  poster_url: "",
  event_date: "",
  location: "",
  is_pinned: false,
  status: "published",
};

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Create / edit an announcement (bureau & admin). Used by the feed and console. */
export default function AnnouncementComposer({
  isOpen,
  editing,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  editing: Announcement | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const dialogRef = useOverlayDialog<HTMLDivElement>(isOpen, onClose);
  const { user } = useAuth();
  const [form, setForm] = useState<ComposerForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setForm(
      editing
        ? {
            kind: editing.kind,
            title: editing.title,
            body: editing.body,
            poster_url: editing.poster_url ?? "",
            event_date: toLocalInputValue(editing.event_date),
            location: editing.location,
            is_pinned: editing.is_pinned,
            status: editing.status,
          }
        : EMPTY_FORM
    );
  }, [isOpen, editing]);

  const update = <K extends keyof ComposerForm>(key: K, value: ComposerForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const uploadPoster = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadClubImage(file, "posters");
      update("poster_url", url);
    } catch (err) {
      setError(clubUploadErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (form.title.trim().length < 3) {
      setError("Le titre doit contenir au moins 3 caractères.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true);
    try {
      const payload = {
        kind: form.kind,
        title: form.title.trim(),
        body: form.body.trim(),
        poster_url: form.poster_url.trim(),
        event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
        location: form.location.trim(),
        is_pinned: form.is_pinned,
        status: form.status,
        // RLS requires author_id = auth.uid() on insert.
        author_id: user?.id ?? null,
      };
      const { error: dbError } = editing
        ? await supabase.from("announcements").update(payload).eq("id", editing.id)
        : await supabase.from("announcements").insert(payload);
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
      aria-label={editing ? "Modifier l'annonce" : "Nouvelle annonce"}
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fadeIn"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg max-h-[92dvh] overflow-y-auto glass-card rounded-lg border border-[#DCD7CB]/50 p-5 sm:p-7 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-bold text-[#16233A]">
            {editing ? "Modifier l'annonce" : "Nouvelle annonce"}
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" htmlFor="ann-kind">
              <select
                id="ann-kind"
                value={form.kind}
                onChange={(e) => update("kind", e.target.value as ComposerForm["kind"])}
                className={inputClass}
              >
                <option value="atelier">Atelier</option>
                <option value="annonce">Annonce</option>
              </select>
            </Field>
            <Field label="Statut" htmlFor="ann-status">
              <select
                id="ann-status"
                value={form.status}
                onChange={(e) => update("status", e.target.value as ComposerForm["status"])}
                className={inputClass}
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publiée</option>
                <option value="archived">Archivée</option>
              </select>
            </Field>
          </div>

          <Field label="Titre" htmlFor="ann-title">
            <input
              id="ann-title"
              type="text"
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className={inputClass}
              placeholder="ex : Atelier Débat — Salle Vésale"
            />
          </Field>

          <Field label="Message" htmlFor="ann-body" hint="Visible par tous les visiteurs une fois publiée.">
            <textarea
              id="ann-body"
              rows={5}
              value={form.body}
              onChange={(e) => update("body", e.target.value)}
              className={`${inputClass} resize-y`}
              placeholder="Décrivez l'atelier ou l'information à annoncer…"
            />
          </Field>

          <Field
            label="Affiche / poster (optionnel)"
            htmlFor="ann-poster"
            hint="Affiche de l'atelier — importez une image (Supabase) ou collez une URL /media/…"
          >
            <div className="flex gap-2">
              <input
                id="ann-poster"
                type="text"
                value={form.poster_url}
                onChange={(e) => update("poster_url", e.target.value)}
                className={inputClass}
                placeholder="https://…supabase.co/storage/v1/object/public/club-media/posters/…"
              />
              <GhostButton
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="!px-3 shrink-0"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span className="hidden sm:inline">Importer</span>
              </GhostButton>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPoster(file);
                  e.target.value = "";
                }}
              />
            </div>
          </Field>

          {form.poster_url && (
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-[#DCD7CB]/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.poster_url} alt="Aperçu de l'affiche" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => update("poster_url", "")}
                aria-label="Retirer l'affiche"
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-500/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Date & heure" htmlFor="ann-date">
              <input
                id="ann-date"
                type="datetime-local"
                value={form.event_date}
                onChange={(e) => update("event_date", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Lieu" htmlFor="ann-location">
              <input
                id="ann-location"
                type="text"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className={inputClass}
                placeholder="Amphithéâtre, salle…"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2.5 text-xs text-[#3D4A58] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_pinned}
              onChange={(e) => update("is_pinned", e.target.checked)}
              className="w-4 h-4 accent-[#755B18]"
            />
            <Pin className="w-3.5 h-3.5 text-[#755B18]" />
            <span>Épingler en haut du fil</span>
          </label>

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
              {saving ? "Enregistrement…" : editing ? "Mettre à jour" : "Publier"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
