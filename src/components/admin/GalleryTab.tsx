"use client";

import React, { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, ImagePlus, Images, Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import type { GalleryImageRow } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadClubImage, clubUploadErrorMessage } from "@/lib/mediaUpload";
import { Badge, Field, GhostButton, PrimaryButton, inputClass } from "@/components/ui/form";
import { useOverlayDialog } from "@/hooks/useOverlayDialog";
import { X } from "lucide-react";

const CATEGORIES: { id: GalleryImageRow["category"]; label: string }[] = [
  { id: "tedx", label: "TEDxFMDC" },
  { id: "podcast", label: "Let's Talk Podcast" },
  { id: "debates", label: "Débats & Formations" },
  { id: "team", label: "Vie du Club" },
  { id: "awards", label: "Trophées & Cérémonies" },
];

interface Draft {
  id: string | null;
  title: string;
  category: GalleryImageRow["category"];
  image_url: string;
  description: string;
  date_label: string;
  sort: number;
  is_published: boolean;
}

const EMPTY_DRAFT: Draft = {
  id: null,
  title: "",
  category: "team",
  image_url: "",
  description: "",
  date_label: "",
  sort: 100,
  is_published: true,
};

function EditorModal({
  isOpen,
  draft,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  draft: Draft | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const dialogRef = useOverlayDialog<HTMLDivElement>(isOpen, onClose);
  const [form, setForm] = useState<Draft>(draft ?? EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(draft ?? EMPTY_DRAFT);
      setError(null);
    }
  }, [isOpen, draft]);

  if (!isOpen) return null;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadClubImage(file, "gallery");
      set("image_url", url);
    } catch (err) {
      setError(clubUploadErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    if (form.title.trim().length < 3) {
      setError("Titre trop court.");
      return;
    }
    if (!form.image_url.trim()) {
      setError("Ajoutez une image (upload ou URL).");
      return;
    }
    setSaving(true);
    setError(null);
    const row = {
      title: form.title.trim(),
      category: form.category,
      category_label: CATEGORIES.find((c) => c.id === form.category)?.label ?? "",
      image_url: form.image_url.trim(),
      description: form.description.trim(),
      date_label: form.date_label.trim(),
      sort: Number(form.sort) || 0,
      is_published: form.is_published,
    };
    const { error: saveError } = form.id
      ? await supabase.from("gallery_images").update(row).eq("id", form.id)
      : await supabase.from("gallery_images").insert(row);
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={form.id ? "Modifier l'image" : "Ajouter une image"}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg glass-card rounded-lg border border-dtc-line/50 p-5 sm:p-6 space-y-4 shadow-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-heading font-bold text-dtc-ink">
            {form.id ? "Modifier" : "Nouvelle image"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-dtc-wash/80 text-dtc-inkMuted hover:text-dtc-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Field label="Titre" htmlFor="gal-title">
          <input
            id="gal-title"
            className={inputClass}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Ex. Talk TEDx : …"
          />
        </Field>

        <Field label="Catégorie" htmlFor="gal-category">
          <select
            id="gal-category"
            className={inputClass}
            value={form.category}
            onChange={(e) => set("category", e.target.value as Draft["category"])}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Image (URL Supabase Storage ou /media/…)" htmlFor="gal-url" hint="Upload ci-dessous ou collez une URL.">
          <div className="flex gap-2">
            <input
              id="gal-url"
              className={inputClass}
              value={form.image_url}
              onChange={(e) => set("image_url", e.target.value)}
              placeholder="https://…supabase.co/storage/v1/object/public/club-media/…"
            />
            <GhostButton
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="!px-3 shrink-0"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span className="hidden sm:inline">Upload</span>
            </GhostButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
                e.target.value = "";
              }}
            />
          </div>
        </Field>

        {form.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.image_url}
            alt="Aperçu"
            className="w-full aspect-[4/3] object-cover rounded-xl border border-dtc-line/50"
          />
        )}

        <Field label="Description" htmlFor="gal-desc">
          <textarea
            id="gal-desc"
            className={inputClass}
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date (libre)" htmlFor="gal-date" hint="Ex. Novembre 2025">
            <input
              id="gal-date"
              className={inputClass}
              value={form.date_label}
              onChange={(e) => set("date_label", e.target.value)}
            />
          </Field>
          <Field label="Ordre" htmlFor="gal-sort" hint="Plus petit = plus tôt">
            <input
              id="gal-sort"
              type="number"
              className={inputClass}
              value={form.sort}
              onChange={(e) => set("sort", Number(e.target.value))}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-dtc-lineDark cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => set("is_published", e.target.checked)}
            className="accent-dtc-gold"
          />
          Publiée (visible sur la galerie publique)
        </label>

        {error && (
          <p role="alert" className="text-xs text-red-700 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <GhostButton onClick={onClose}>Annuler</GhostButton>
          <PrimaryButton onClick={save} disabled={saving || uploading}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function GalleryVisibilityCard() {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "gallery_visible")
      .maybeSingle()
      .then(({ data }) => setVisible(data ? Boolean((data as { value: boolean }).value) : true));
  }, []);

  const toggle = async () => {
    if (visible === null) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "gallery_visible", value: !visible }, { onConflict: "key" });
    if (error) window.alert(`Impossible de changer la visibilité : ${error.message}`);
    else setVisible(!visible);
    setSaving(false);
  };

  return (
    <div className="glass-card rounded-lg border border-dtc-line/40 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-1.5 text-sm font-heading font-bold text-dtc-ink">
          <Images className="w-4 h-4 text-dtc-gold" />
          Visibilité de la section « Galerie Média »
        </h2>
        <p className="text-[11px] text-dtc-inkMuted mt-0.5">
          Masquer retire le lien de navigation, redirige /gallery vers l&apos;accueil et l&apos;exclut du
          sitemap — la section disparaît réellement.
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={visible === null || saving}
        aria-pressed={visible === true}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-md text-xs font-bold transition-all active:scale-95 disabled:opacity-50 ${
          visible
            ? "bg-emerald-600/10 text-emerald-700 border border-emerald-600/40"
            : "bg-slate-500/10 text-slate-600 border border-slate-500/40"
        }`}
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : visible ? (
          <Eye className="w-4 h-4" />
        ) : (
          <EyeOff className="w-4 h-4" />
        )}
        <span>{visible === null ? "…" : visible ? "Visible" : "Masquée"}</span>
      </button>
    </div>
  );
}

export default function GalleryTab() {
  const [items, setItems] = useState<GalleryImageRow[] | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data, error: loadError } = await supabase
      .from("gallery_images")
      .select("*")
      .order("sort", { ascending: true })
      .order("created_at", { ascending: true });
    if (loadError) {
      setError(loadError.message);
      return;
    }
    setError(null);
    setItems((data as GalleryImageRow[] | null) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublish = async (item: GalleryImageRow) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: dbError } = await supabase
      .from("gallery_images")
      .update({ is_published: !item.is_published })
      .eq("id", item.id);
    if (dbError) setError(dbError.message);
    load();
  };

  const remove = async (item: GalleryImageRow) => {
    if (!window.confirm(`Supprimer « ${item.title} » de la galerie ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: dbError } = await supabase.from("gallery_images").delete().eq("id", item.id);
    if (dbError) setError(dbError.message);
    load();
  };

  return (
    <div className="space-y-4">
      <GalleryVisibilityCard />

      <div className="flex items-center justify-between gap-2.5">
        <p className="text-xs text-dtc-inkMuted">La galerie publique — images, affiches, moments du club.</p>
        <button
          onClick={() => {
            setDraft(null);
            setEditorOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold bg-dtc-gold text-dtc-paper hover:brightness-110 shadow-md shadow-dtc-gold/20 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter</span>
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-700 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {items === null && (
        <div className="glass-card rounded-lg border border-dtc-line/40 p-8 text-center">
          <Loader2 className="w-5 h-5 text-dtc-gold animate-spin mx-auto" />
        </div>
      )}

      <div className="space-y-2">
        {items?.map((item) => (
          <div
            key={item.id}
            className="glass-card rounded-xl border border-dtc-line/40 p-3 flex flex-wrap items-center gap-2.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt=""
              className="w-14 h-11 rounded-lg object-cover border border-dtc-line/50 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-dtc-ink truncate">{item.title}</p>
              <p className="text-[10px] text-dtc-inkMuted truncate">
                {item.category_label} · ordre {item.sort}
                {item.date_label ? ` · ${item.date_label}` : ""}
              </p>
            </div>
            <Badge tone={item.is_published ? "green" : "gold"}>
              {item.is_published ? "Publiée" : "Brouillon"}
            </Badge>
            <div className="flex items-center gap-1">
              <button
                onClick={() => togglePublish(item)}
                aria-label={`${item.is_published ? "Dépublier" : "Publier"} — ${item.title}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-dtc-inkMuted hover:text-dtc-gold hover:bg-dtc-wash transition-colors"
              >
                {item.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setDraft({
                    id: item.id,
                    title: item.title,
                    category: item.category,
                    image_url: item.image_url,
                    description: item.description,
                    date_label: item.date_label,
                    sort: item.sort,
                    is_published: item.is_published,
                  });
                  setEditorOpen(true);
                }}
                aria-label={`Modifier — ${item.title}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-dtc-inkMuted hover:text-dtc-gold hover:bg-dtc-wash transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => remove(item)}
                aria-label={`Supprimer — ${item.title}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-dtc-inkMuted hover:text-red-700 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {items?.length === 0 && (
          <p className="text-xs text-dtc-inkMuted text-center py-6 flex items-center justify-center gap-1.5">
            <ImagePlus className="w-3.5 h-3.5" />
            Galerie vide côté base — le site affiche encore les images statiques intégrées.
          </p>
        )}
      </div>

      <EditorModal
        isOpen={editorOpen}
        draft={draft}
        onClose={() => setEditorOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
