"use client";

import React, { useEffect, useState } from "react";
import { Pin, X } from "lucide-react";
import type { Announcement } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { useOverlayDialog } from "@/hooks/useOverlayDialog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field, PrimaryButton, GhostButton, inputClass } from "@/components/ui/form";

export interface ComposerForm {
  kind: "atelier" | "annonce";
  title: string;
  body: string;
  event_date: string; // datetime-local value
  location: string;
  is_pinned: boolean;
  status: "draft" | "published" | "archived";
}

const EMPTY_FORM: ComposerForm = {
  kind: "atelier",
  title: "",
  body: "",
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

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setForm(
      editing
        ? {
            kind: editing.kind,
            title: editing.title,
            body: editing.body,
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
      <div className="relative z-10 w-full max-w-lg max-h-[92dvh] overflow-y-auto glass-card rounded-2xl border border-[#385A75]/50 p-5 sm:p-7 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-bold text-white">
            {editing ? "Modifier l'annonce" : "Nouvelle annonce"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1B2E4B]/80 text-[#94A3B8] hover:text-white transition-colors"
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

          <label className="flex items-center gap-2.5 text-xs text-[#CBD5E1] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_pinned}
              onChange={(e) => update("is_pinned", e.target.checked)}
              className="w-4 h-4 accent-[#D4AF37]"
            />
            <Pin className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Épingler en haut du fil</span>
          </label>

          {error && (
            <p role="alert" className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
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
