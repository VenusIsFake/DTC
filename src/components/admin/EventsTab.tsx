"use client";

import React, { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import type { EventPage, EventPageItem, TedxTalkRow } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadClubImage, clubUploadErrorMessage } from "@/lib/mediaUpload";
import { useOverlayDialog } from "@/hooks/useOverlayDialog";
import { Field, PrimaryButton, GhostButton, Badge, inputClass } from "@/components/ui/form";

// ---------------------------------------------------------------------------
// Section 1: site visibility toggle
// ---------------------------------------------------------------------------

function VisibilityCard() {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "events_visible")
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
      .upsert({ key: "events_visible", value: !visible }, { onConflict: "key" });
    if (error) window.alert(`Impossible de changer la visibilité : ${error.message}`);
    else setVisible(!visible);
    setSaving(false);
  };

  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="flex items-center gap-1.5 text-sm font-heading font-bold text-[#16233A]">
          <CalendarDays className="w-4 h-4 text-[#755B18]" />
          Visibilité de la section « TEDx & Débats »
        </h3>
        <p className="text-[11px] text-[#5C6672] mt-0.5">
          Masquer retire le lien de navigation, redirige /events vers l&apos;accueil et l&apos;exclut du
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

// ---------------------------------------------------------------------------
// Section 2: TEDx talks CRUD
// ---------------------------------------------------------------------------

interface TedxForm {
  id: string | null;
  extract_number: number;
  speaker: string;
  topic: string;
  language: "FR" | "EN" | "AR";
  video_url: string;
  poster_url: string;
  instagram_url: string;
  duration: string;
  description: string;
  is_published: boolean;
}

const EMPTY_TEDX: TedxForm = {
  id: null,
  extract_number: 1,
  speaker: "",
  topic: "",
  language: "FR",
  video_url: "",
  poster_url: "",
  instagram_url: "",
  duration: "",
  description: "",
  is_published: true,
};

function TedxCard() {
  const [talks, setTalks] = useState<TedxTalkRow[] | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TedxForm>(EMPTY_TEDX);
  const dialogRef = useOverlayDialog<HTMLDivElement>(open, () => setOpen(false));
  const [error, setError] = useState<string | null>(null);
  const posterFileRef = useRef<HTMLInputElement>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase.from("tedx_talks").select("*").order("extract_number");
    setTalks((data as TedxTalkRow[] | null) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const uploadPoster = async (file: File) => {
    setUploadingPoster(true);
    setError(null);
    try {
      const url = await uploadClubImage(file, "events");
      setForm((prev) => ({ ...prev, poster_url: url }));
    } catch (err) {
      setError(clubUploadErrorMessage(err));
    } finally {
      setUploadingPoster(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const payload = {
      extract_number: Number(form.extract_number) || 1,
      speaker: form.speaker.trim(),
      topic: form.topic.trim(),
      language: form.language,
      video_url: form.video_url.trim(),
      poster_url: form.poster_url.trim(),
      instagram_url: form.instagram_url.trim(),
      duration: form.duration.trim(),
      description: form.description.trim(),
      is_published: form.is_published,
    };
    const { error: dbError } = form.id
      ? await supabase.from("tedx_talks").update(payload).eq("id", form.id)
      : await supabase.from("tedx_talks").insert(payload);
    setError(dbError?.message ?? null);
    if (!dbError) {
      setOpen(false);
      load();
    }
  };

  const togglePublished = async (row: TedxTalkRow) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: dbError } = await supabase
      .from("tedx_talks")
      .update({ is_published: !row.is_published })
      .eq("id", row.id);
    if (dbError) setError(dbError.message);
    load();
  };

  const remove = async (row: TedxTalkRow) => {
    if (!window.confirm(`Supprimer le talk de ${row.speaker} ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: dbError } = await supabase.from("tedx_talks").delete().eq("id", row.id);
    if (dbError) setError(dbError.message);
    load();
  };

  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2.5">
        <h3 className="text-sm font-heading font-bold text-[#16233A]">TEDxFMDC — talks ({talks?.length ?? "…"})</h3>
        <button
          onClick={() => {
            setForm({ ...EMPTY_TEDX, extract_number: (talks?.at(-1)?.extract_number ?? 0) + 1 });
            setError(null);
            setOpen(true);
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-bold bg-[#755B18] text-[#F7F5F0] hover:brightness-110 active:scale-95"
        >
          <Plus className="w-3 h-3" />
          <span>Talk</span>
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {talks === null ? (
        <Loader2 className="w-4 h-4 text-[#755B18] animate-spin mx-auto" />
      ) : (
        <div className="space-y-1.5">
          {talks.length === 0 && (
            <p className="text-[11px] text-[#755B18] bg-[#755B18]/10 border border-[#755B18]/30 rounded-lg px-3 py-2">
              Aucun talk en base — la page /events affiche les extraits statiques intégrés.
            </p>
          )}
          {talks.map((row) => (
            <div key={row.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-[#EFECE4]/40 border border-[#DCD7CB]/25">
              <span className="text-[10px] font-bold text-[#755B18] w-7 shrink-0">#{row.extract_number}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#16233A] truncate">
                  {row.speaker} {!row.is_published && <Badge tone="gray">Masqué</Badge>}
                </p>
                <p className="text-[10px] text-[#5C6672] truncate">{row.topic}</p>
              </div>
              <button
                onClick={() => {
                  setForm({ ...row, id: row.id });
                  setError(null);
                  setOpen(true);
                }}
                aria-label="Modifier"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-[#755B18]"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={() => remove(row)}
                aria-label="Supprimer"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Éditeur de talk TEDx"
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fadeIn"
        >
          <div className="absolute inset-0" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-lg max-h-[92dvh] overflow-y-auto glass-card rounded-lg border border-[#DCD7CB]/50 p-5 sm:p-6 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-heading font-bold text-[#16233A]">
                {form.id ? "Modifier le talk" : "Nouveau talk"}
              </h4>
              <button onClick={() => setOpen(false)} aria-label="Fermer" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#EFECE4]/80 text-[#5C6672] hover:text-[#16233A]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Field label="N°" htmlFor="tedx-num">
                  <input id="tedx-num" type="number" min={1} value={form.extract_number} onChange={(e) => setForm({ ...form, extract_number: Number(e.target.value) })} className={inputClass} />
                </Field>
                <Field label="Langue" htmlFor="tedx-lang">
                  <select id="tedx-lang" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value as TedxForm["language"] })} className={inputClass}>
                    <option value="FR">FR</option>
                    <option value="EN">EN</option>
                    <option value="AR">AR</option>
                  </select>
                </Field>
                <Field label="Durée" htmlFor="tedx-dur">
                  <input id="tedx-dur" type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputClass} placeholder="1:20" />
                </Field>
              </div>
              <Field label="Orateur" htmlFor="tedx-speaker">
                <input id="tedx-speaker" type="text" required value={form.speaker} onChange={(e) => setForm({ ...form, speaker: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Sujet" htmlFor="tedx-topic">
                <input id="tedx-topic" type="text" required value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Vidéo (chemin local ou URL YouTube)" htmlFor="tedx-video" hint="Les vidéos restent des liens (YouTube idéal) — l'upload console couvre les images.">
                <input id="tedx-video" type="text" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} className={inputClass} placeholder="/media/events/… ou https://youtu.be/…" />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Poster (URL ou upload)" htmlFor="tedx-poster">
                  <div className="flex gap-2">
                    <input
                      id="tedx-poster"
                      type="text"
                      value={form.poster_url}
                      onChange={(e) => setForm({ ...form, poster_url: e.target.value })}
                      className={`${inputClass} flex-1`}
                    />
                    <GhostButton
                      type="button"
                      onClick={() => posterFileRef.current?.click()}
                      disabled={uploadingPoster}
                      className="shrink-0"
                    >
                      {uploadingPoster ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span className="hidden sm:inline">Upload</span>
                    </GhostButton>
                  </div>
                </Field>
                <Field label="Lien Instagram" htmlFor="tedx-ig">
                  <input id="tedx-ig" type="url" value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} className={inputClass} />
                </Field>
              </div>
              <input
                ref={posterFileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPoster(file);
                  if (posterFileRef.current) posterFileRef.current.value = "";
                }}
              />
              <Field label="Description" htmlFor="tedx-desc">
                <textarea id="tedx-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-y`} />
              </Field>
              <label className="flex items-center gap-2 text-xs text-[#3D4A58] cursor-pointer select-none">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 accent-[#755B18]" />
                <span>Publié</span>
              </label>
              {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
              <div className="flex justify-end gap-2">
                <GhostButton type="button" onClick={() => setOpen(false)}>Annuler</GhostButton>
                <PrimaryButton type="submit">Enregistrer</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 3: dynamic event pages (/events/[slug])
// ---------------------------------------------------------------------------

interface ItemForm {
  pageId: string;
  /** null = creating. */
  id: string | null;
  title: string;
  speaker: string;
  description: string;
  video_url: string;
  poster_url: string;
}

const EMPTY_ITEM: Omit<ItemForm, "pageId"> = {
  id: null,
  title: "",
  speaker: "",
  description: "",
  video_url: "",
  poster_url: "",
};

function EventPagesCard() {
  const [pages, setPages] = useState<EventPage[] | null>(null);
  const [itemsByPage, setItemsByPage] = useState<Record<string, EventPageItem[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventPage | null>(null);
  const dialogRef = useOverlayDialog<HTMLDivElement>(open, () => setOpen(false));
  const [form, setForm] = useState({ slug: "", title: "", tagline: "", hero_poster: "", description: "", status: "draft" as EventPage["status"] });
  const [editingItem, setEditingItem] = useState<ItemForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const itemPosterRef = useRef<HTMLInputElement>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingItemPoster, setUploadingItemPoster] = useState(false);

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const [{ data: pageData }, { data: itemData }] = await Promise.all([
      supabase.from("event_pages").select("*").order("created_at", { ascending: false }),
      supabase.from("event_page_items").select("*").order("sort"),
    ]);
    const pageRows = (pageData ?? []) as EventPage[];
    const itemRows = (itemData ?? []) as EventPageItem[];
    const grouped: Record<string, EventPageItem[]> = {};
    for (const item of itemRows) {
      grouped[item.event_page_id] = [...(grouped[item.event_page_id] ?? []), item];
    }
    setPages(pageRows);
    setItemsByPage(grouped);
  };

  useEffect(() => {
    load();
  }, []);

  const openEditor = (page: EventPage | null) => {
    setEditing(page);
    setForm(
      page
        ? { slug: page.slug, title: page.title, tagline: page.tagline, hero_poster: page.hero_poster, description: page.description, status: page.status }
        : { slug: "", title: "", tagline: "", hero_poster: "", description: "", status: "draft" }
    );
    setError(null);
    setOpen(true);
  };

  const uploadHero = async (file: File) => {
    setUploadingHero(true);
    setError(null);
    try {
      const url = await uploadClubImage(file, "events");
      setForm((prev) => ({ ...prev, hero_poster: url }));
    } catch (err) {
      setError(clubUploadErrorMessage(err));
    } finally {
      setUploadingHero(false);
    }
  };

  const uploadItemPoster = async (file: File) => {
    if (!editingItem) return;
    setUploadingItemPoster(true);
    setError(null);
    try {
      const url = await uploadClubImage(file, "events");
      setEditingItem({ ...editingItem, poster_url: url });
    } catch (err) {
      setError(clubUploadErrorMessage(err));
    } finally {
      setUploadingItemPoster(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const payload = {
      slug: form.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""),
      title: form.title.trim(),
      tagline: form.tagline.trim(),
      hero_poster: form.hero_poster.trim(),
      description: form.description.trim(),
      status: form.status,
    };
    if (!payload.slug || !payload.title) {
      setError("Slug et titre requis.");
      return;
    }
    const { error: dbError } = editing
      ? await supabase.from("event_pages").update(payload).eq("id", editing.id)
      : await supabase.from("event_pages").insert(payload);
    setError(dbError?.message ?? null);
    if (!dbError) {
      setOpen(false);
      load();
    }
  };

  const remove = async (page: EventPage) => {
    if (!window.confirm(`Supprimer la page « ${page.title} » et son contenu ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: dbError } = await supabase.from("event_pages").delete().eq("id", page.id);
    if (dbError) setError(dbError.message);
    load();
  };

  const saveItem = async (page: EventPage) => {
    if (!editingItem || !editingItem.title.trim()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const payload = {
      title: editingItem.title.trim(),
      speaker: editingItem.speaker.trim(),
      description: editingItem.description.trim(),
      video_url: editingItem.video_url.trim(),
      poster_url: editingItem.poster_url.trim(),
    };
    const existing = itemsByPage[page.id]?.length ?? 0;
    const { error: dbError } = editingItem.id
      ? await supabase.from("event_page_items").update(payload).eq("id", editingItem.id)
      : await supabase.from("event_page_items").insert({ ...payload, event_page_id: page.id, sort: existing + 1 });
    setError(dbError?.message ?? null);
    if (!dbError) {
      setEditingItem(null);
      load();
    }
  };

  const removeItem = async (item: EventPageItem) => {
    if (!window.confirm(`Supprimer l'élément « ${item.title} » ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: dbError } = await supabase.from("event_page_items").delete().eq("id", item.id);
    if (dbError) setError(dbError.message);
    load();
  };

  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2.5">
        <div>
          <h3 className="text-sm font-heading font-bold text-[#16233A]">Pages d&apos;événement ({pages?.length ?? "…"})</h3>
          <p className="text-[11px] text-[#5C6672]">Pages vitrines dynamiques servies sur /events/[slug].</p>
        </div>
        <button
          onClick={() => openEditor(null)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-bold bg-[#755B18] text-[#F7F5F0] hover:brightness-110 active:scale-95"
        >
          <Plus className="w-3 h-3" />
          <span>Page</span>
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {pages === null ? (
        <Loader2 className="w-4 h-4 text-[#755B18] animate-spin mx-auto" />
      ) : (
        <div className="space-y-1.5">
          {pages.map((page) => {
            const isExpanded = expanded === page.id;
            return (
              <div key={page.id} className="rounded-xl bg-[#EFECE4]/40 border border-[#DCD7CB]/25">
                <div className="flex items-center gap-2.5 p-2.5">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : page.id)}
                    aria-expanded={isExpanded}
                    className="flex items-center gap-1 text-[#5F6774] hover:text-[#755B18]"
                    aria-label={isExpanded ? "Replier" : "Déplier"}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#16233A] truncate">
                      {page.title} <span className="text-[#5F6774] font-normal">/events/{page.slug}</span>
                    </p>
                    <p className="text-[10px] text-[#5C6672]">
                      {itemsByPage[page.id]?.length ?? 0} élément(s)
                    </p>
                  </div>
                  <Badge tone={page.status === "published" ? "green" : page.status === "draft" ? "gold" : "gray"}>
                    {page.status === "published" ? "Publiée" : page.status === "draft" ? "Brouillon" : "Archivée"}
                  </Badge>
                  <button onClick={() => openEditor(page)} aria-label="Modifier" className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-[#755B18]">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button onClick={() => remove(page)} aria-label="Supprimer" className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-red-600">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2 border-t border-[#DCD7CB]/25 pt-2.5">
                    {(itemsByPage[page.id] ?? []).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/60 border border-[#DCD7CB]/20">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-[#16233A] truncate">
                            {item.title} {item.speaker && <span className="text-[#755B18]">— {item.speaker}</span>}
                          </p>
                          <p className="text-[10px] text-[#5F6774] truncate">{item.video_url || item.poster_url || "—"}</p>
                        </div>
                        <button
                          onClick={() =>
                            setEditingItem({
                              pageId: page.id,
                              id: item.id,
                              title: item.title,
                              speaker: item.speaker,
                              description: item.description,
                              video_url: item.video_url,
                              poster_url: item.poster_url,
                            })
                          }
                          aria-label="Modifier l'élément"
                          className="w-6 h-6 flex items-center justify-center rounded text-[#5F6774] hover:text-[#755B18]"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => removeItem(item)} aria-label="Supprimer l'élément" className="w-6 h-6 flex items-center justify-center rounded text-[#5F6774] hover:text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {editingItem?.pageId === page.id ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg border border-dashed border-[#755B18]/40 bg-white/40">
                        <input
                          type="text"
                          value={editingItem.title}
                          onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                          placeholder="Titre (ex : Talk d'ouverture)"
                          className={`${inputClass} !text-xs`}
                          aria-label="Titre de l'élément"
                        />
                        <input
                          type="text"
                          value={editingItem.speaker}
                          onChange={(e) => setEditingItem({ ...editingItem, speaker: e.target.value })}
                          placeholder="Intervenant"
                          className={`${inputClass} !text-xs`}
                          aria-label="Intervenant"
                        />
                        <input
                          type="text"
                          value={editingItem.video_url}
                          onChange={(e) => setEditingItem({ ...editingItem, video_url: e.target.value })}
                          placeholder="Vidéo (URL YouTube ou chemin)"
                          className={`${inputClass} !text-xs`}
                          aria-label="Vidéo"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingItem.poster_url}
                            onChange={(e) => setEditingItem({ ...editingItem, poster_url: e.target.value })}
                            placeholder="Poster (chemin/URL)"
                            className={`${inputClass} !text-xs flex-1`}
                            aria-label="Poster"
                          />
                          <GhostButton
                            type="button"
                            onClick={() => itemPosterRef.current?.click()}
                            disabled={uploadingItemPoster}
                            className="shrink-0 !py-1.5 !px-2.5"
                          >
                            {uploadingItemPoster ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            <span className="sr-only">Uploader le poster</span>
                          </GhostButton>
                        </div>
                        <textarea
                          value={editingItem.description}
                          onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                          placeholder="Description (optionnel)"
                          rows={2}
                          className={`${inputClass} !text-xs resize-y sm:col-span-2`}
                          aria-label="Description de l'élément"
                        />
                        <div className="sm:col-span-2 flex justify-end gap-2">
                          <GhostButton type="button" onClick={() => setEditingItem(null)} className="!py-1.5 !text-[11px]">
                            Annuler
                          </GhostButton>
                          <PrimaryButton type="button" onClick={() => saveItem(page)} className="!py-1.5 !text-[11px]">
                            {editingItem.id ? "Mettre à jour" : "Ajouter l'élément"}
                          </PrimaryButton>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <GhostButton
                          type="button"
                          onClick={() => setEditingItem({ pageId: page.id, ...EMPTY_ITEM })}
                          className="!py-1.5 !text-[11px]"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Élément</span>
                        </GhostButton>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {pages.length === 0 && (
            <p className="text-xs text-[#5C6672] text-center py-4">
              Aucune page — créez « la page du TEDx de l&apos;année prochaine » ici.
            </p>
          )}
        </div>
      )}

      <input
        ref={heroFileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadHero(file);
          if (heroFileRef.current) heroFileRef.current.value = "";
        }}
      />
      <input
        ref={itemPosterRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadItemPoster(file);
          if (itemPosterRef.current) itemPosterRef.current.value = "";
        }}
      />

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Éditeur de page événement"
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fadeIn"
        >
          <div className="absolute inset-0" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-lg max-h-[92dvh] overflow-y-auto glass-card rounded-lg border border-[#DCD7CB]/50 p-5 sm:p-6 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-heading font-bold text-[#16233A]">
                {editing ? "Modifier la page" : "Nouvelle page d'événement"}
              </h4>
              <button onClick={() => setOpen(false)} aria-label="Fermer" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#EFECE4]/80 text-[#5C6672] hover:text-[#16233A]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Slug (URL)" htmlFor="epage-slug" hint="ex : tedxfmdc-2027">
                  <input id="epage-slug" type="text" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Statut" htmlFor="epage-status">
                  <select id="epage-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EventPage["status"] })} className={inputClass}>
                    <option value="draft">Brouillon</option>
                    <option value="published">Publiée</option>
                    <option value="archived">Archivée</option>
                  </select>
                </Field>
              </div>
              <Field label="Titre" htmlFor="epage-title">
                <input id="epage-title" type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Tagline" htmlFor="epage-tagline">
                <input id="epage-tagline" type="text" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Hero poster (URL ou upload)" htmlFor="epage-poster">
                <div className="flex gap-2">
                  <input
                    id="epage-poster"
                    type="text"
                    value={form.hero_poster}
                    onChange={(e) => setForm({ ...form, hero_poster: e.target.value })}
                    className={`${inputClass} flex-1`}
                  />
                  <GhostButton
                    type="button"
                    onClick={() => heroFileRef.current?.click()}
                    disabled={uploadingHero}
                    className="shrink-0"
                  >
                    {uploadingHero ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span className="hidden sm:inline">Upload</span>
                  </GhostButton>
                </div>
              </Field>
              <Field label="Description" htmlFor="epage-desc">
                <textarea id="epage-desc" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-y`} />
              </Field>
              {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
              <div className="flex justify-end gap-2">
                <GhostButton type="button" onClick={() => setOpen(false)}>Annuler</GhostButton>
                <PrimaryButton type="submit">Enregistrer</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventsTab() {
  return (
    <div className="space-y-4">
      <VisibilityCard />
      <TedxCard />
      <EventPagesCard />
    </div>
  );
}
