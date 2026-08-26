"use client";

import React, { useEffect, useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { useOverlayDialog } from "@/hooks/useOverlayDialog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Field, PrimaryButton, GhostButton, inputClass } from "@/components/ui/form";

export default function PitchModal({ isOpen, onClose, onSaved }: { isOpen: boolean; onClose: () => void; onSaved: () => void }) {
  const dialogRef = useOverlayDialog<HTMLDivElement>(isOpen, onClose);
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (title.trim().length < 3) {
      setError("Donnez un titre à votre idée (3 caractères minimum).");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true);
    try {
      const { error: dbError } = await supabase
        .from("ideas")
        .insert({ title: title.trim(), description: description.trim(), author_id: user?.id ?? null });
      if (dbError) throw dbError;
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la publication.");
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
      aria-label="Proposer une idée"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fadeIn"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg glass-card rounded-lg border border-[#DCD7CB]/50 p-5 sm:p-7 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-heading font-bold text-[#16233A]">
            <Lightbulb className="w-5 h-5 text-[#755B18]" />
            Proposer une idée
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#EFECE4]/80 text-[#5C6672] hover:text-[#16233A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#5C6672] leading-relaxed">
          Thèmes de débat, formats d&apos;atelier, invités du podcast, événements… toutes les idées
          sont bienvenues. La communauté vote, le bureau étudie.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Field label="Titre de l'idée" htmlFor="idea-title">
            <input
              id="idea-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="ex : Débat sur l'IA en dentisterie conservatrice"
            />
          </Field>

          <Field label="Développez votre idée (optionnel)" htmlFor="idea-desc">
            <textarea
              id="idea-desc"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} resize-y`}
              placeholder="Format, objectif, invités potentiels…"
            />
          </Field>

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
              {saving ? "Publication…" : "Publier mon idée"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
