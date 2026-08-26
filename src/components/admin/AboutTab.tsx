"use client";

import React, { useEffect, useRef, useState } from "react";
import { Crown, FileText, Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import type { AboutSection, Mandate, MandateMember } from "@/lib/types";
import { getSupabaseBrowserClient, publicStorageUrl } from "@/lib/supabase/client";
import { Field, PrimaryButton, GhostButton, Badge, inputClass } from "@/components/ui/form";

// ---------------------------------------------------------------------------
// Sections editor
// ---------------------------------------------------------------------------

function SectionsEditor() {
  const [sections, setSections] = useState<AboutSection[] | null>(null);
  const [editing, setEditing] = useState<AboutSection | null>(null);
  const [form, setForm] = useState({ key: "", sort_order: 1, title: "", body: "", is_published: true });

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase.from("about_sections").select("*").order("sort_order");
    setSections((data as AboutSection[] | null) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (section: AboutSection | null) => {
    setEditing(section);
    setForm(
      section
        ? { key: section.key, sort_order: section.sort_order, title: section.title, body: section.body, is_published: section.is_published }
        : { key: "", sort_order: (sections?.at(-1)?.sort_order ?? 0) + 1, title: "", body: "", is_published: true }
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const payload = {
      key: form.key.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-") || `section-${Date.now()}`,
      sort_order: Number(form.sort_order) || 1,
      title: form.title.trim(),
      body: form.body,
      is_published: form.is_published,
    };
    const { error } = editing
      ? await supabase.from("about_sections").update(payload).eq("id", editing.id)
      : await supabase.from("about_sections").insert(payload);
    if (!error) {
      setEditing(null);
      load();
    }
  };

  const togglePublished = async (section: AboutSection) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("about_sections").update({ is_published: !section.is_published }).eq("id", section.id);
    load();
  };

  const remove = async (section: AboutSection) => {
    if (!window.confirm(`Supprimer la section « ${section.title} » ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("about_sections").delete().eq("id", section.id);
    load();
  };

  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2.5">
        <h3 className="flex items-center gap-1.5 text-sm font-heading font-bold text-[#16233A]">
          <FileText className="w-4 h-4 text-[#755B18]" />
          Sections « À propos »
        </h3>
        <button onClick={() => startEdit(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-bold bg-[#755B18] text-[#F7F5F0] hover:brightness-110 active:scale-95">
          <Plus className="w-3 h-3" />
          <span>Section</span>
        </button>
      </div>

      {editing && (
        <form onSubmit={submit} className="space-y-3 p-3 rounded-xl bg-white/60 border border-[#755B18]/25">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Clé (identifiant)" htmlFor="about-key">
              <input id="about-key" type="text" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} className={inputClass} disabled={Boolean(editing.id)} />
            </Field>
            <Field label="Ordre" htmlFor="about-order">
              <input id="about-order" type="number" min={1} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={inputClass} />
            </Field>
          </div>
          <Field label="Titre" htmlFor="about-title">
            <input id="about-title" type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Contenu" htmlFor="about-body" hint="Texte simple — sauts de ligne conservés. Jamais de HTML brut.">
            <textarea id="about-body" rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className={`${inputClass} resize-y`} />
          </Field>
          <label className="flex items-center gap-2 text-xs text-[#3D4A58] cursor-pointer select-none">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 accent-[#755B18]" />
            <span>Publiée</span>
          </label>
          <div className="flex justify-end gap-2">
            <GhostButton type="button" onClick={() => setEditing(null)}>Annuler</GhostButton>
            <PrimaryButton type="submit">Enregistrer</PrimaryButton>
          </div>
        </form>
      )}

      {sections === null ? (
        <Loader2 className="w-4 h-4 text-[#755B18] animate-spin mx-auto" />
      ) : (
        <div className="space-y-1.5">
          {sections.map((section) => (
            <div key={section.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#EFECE4]/40 border border-[#DCD7CB]/25">
              <span className="text-[10px] font-bold text-[#755B18] w-5 shrink-0">{section.sort_order}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#16233A] truncate">
                  {section.title} {!section.is_published && <Badge tone="gray">Masquée</Badge>}
                </p>
                <p className="text-[10px] text-[#5F6774] truncate">{section.key}</p>
              </div>
              <button onClick={() => togglePublished(section)} className="text-[10px] font-semibold text-[#5C6672] hover:text-[#755B18] shrink-0">
                {section.is_published ? "Masquer" : "Afficher"}
              </button>
              <button onClick={() => startEdit(section)} aria-label="Modifier" className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-[#755B18]">
                <Pencil className="w-3 h-3" />
              </button>
              <button onClick={() => remove(section)} aria-label="Supprimer" className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-red-600">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home stats editor
// ---------------------------------------------------------------------------

function StatsEditor() {
  const [stats, setStats] = useState<{ value: string; label: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "home_stats")
      .maybeSingle()
      .then(({ data }) => {
        if (data) setStats(((data as { value: { value: string; label: string }[] }).value ?? []).slice(0, 6));
      });
  }, []);

  const save = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true);
    await supabase.from("site_settings").upsert({ key: "home_stats", value: stats }, { onConflict: "key" });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-3">
      <h3 className="text-sm font-heading font-bold text-[#16233A]">Statistiques de la page d&apos;accueil</h3>
      <div className="space-y-2">
        {stats.map((stat, idx) => (
          <div key={idx} className="grid grid-cols-[100px_1fr_auto] gap-2 items-center">
            <input
              type="text"
              value={stat.value}
              onChange={(e) => setStats(stats.map((s, i) => (i === idx ? { ...s, value: e.target.value } : s)))}
              className={`${inputClass} !text-xs`}
              aria-label={`Valeur ${idx + 1}`}
            />
            <input
              type="text"
              value={stat.label}
              onChange={(e) => setStats(stats.map((s, i) => (i === idx ? { ...s, label: e.target.value } : s)))}
              className={`${inputClass} !text-xs`}
              aria-label={`Libellé ${idx + 1}`}
            />
            <button
              onClick={() => setStats(stats.filter((_, i) => i !== idx))}
              aria-label="Retirer la statistique"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5F6774] hover:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <GhostButton onClick={() => setStats([...stats, { value: "", label: "" }])} className="!py-1.5 !text-[11px]">
          <Plus className="w-3 h-3" />
          <span>Ajouter</span>
        </GhostButton>
        <PrimaryButton onClick={save} disabled={saving} className="!py-2">
          {saving ? "…" : saved ? "Enregistré ✓" : "Enregistrer"}
        </PrimaryButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mandates manager
// ---------------------------------------------------------------------------

function MandatesEditor() {
  const [mandates, setMandates] = useState<(Mandate & { members: MandateMember[] })[] | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newMember, setNewMember] = useState<{ mandateId: string; name: string; role: string } | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingUploadMandate, setPendingUploadMandate] = useState<string | null>(null);

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: mandateRows } = await supabase
      .from("mandates")
      .select("*")
      .order("is_current", { ascending: false })
      .order("created_at", { ascending: false });
    const { data: memberRows } = await supabase.from("mandate_members").select("*").order("sort");
    const grouped = (mandateRows ?? []) as Mandate[];
    setMandates(
      grouped.map((m) => ({
        ...m,
        members: ((memberRows ?? []) as MandateMember[]).filter((mm) => mm.mandate_id === m.id),
      }))
    );
  };

  useEffect(() => {
    load();
  }, []);

  const createMandate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newLabel.trim()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("mandates").insert({ year_label: newLabel.trim(), is_current: false });
    setNewLabel("");
    load();
  };

  const setCurrent = async (mandate: Mandate) => {
    if (!window.confirm(`« ${mandate.year_label} » devient le mandat courant ; l'ancien est archivé automatiquement. Continuer ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("mandates").update({ is_current: true }).eq("id", mandate.id);
    load();
  };

  const removeMandate = async (mandate: Mandate) => {
    if (!window.confirm(`Supprimer le mandat « ${mandate.year_label} » et ses membres ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("mandates").delete().eq("id", mandate.id);
    load();
  };

  const uploadInfographic = async (mandateId: string, file: File) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setUploadingFor(mandateId);
    try {
      const path = `mandates/${mandateId}-${Date.now()}.${file.name.split(".").pop()?.toLowerCase() ?? "jpg"}`;
      const { error } = await supabase.storage.from("club-media").upload(path, file, { upsert: true });
      if (error) throw error;
      await supabase
        .from("mandates")
        .update({ infographic_url: publicStorageUrl("club-media", path) })
        .eq("id", mandateId);
      load();
    } catch (err) {
      window.alert(`Upload impossible : ${err instanceof Error ? err.message : "erreur inconnue"}`);
    } finally {
      setUploadingFor(null);
    }
  };

  const addMember = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newMember || !newMember.name.trim()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const mandate = mandates?.find((m) => m.id === newMember.mandateId);
    await supabase.from("mandate_members").insert({
      mandate_id: newMember.mandateId,
      name: newMember.name.trim(),
      role: newMember.role.trim() || "Membre",
      sort: (mandate?.members.length ?? 0) + 1,
    });
    setNewMember(null);
    load();
  };

  const removeMember = async (member: MandateMember) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("mandate_members").delete().eq("id", member.id);
    load();
  };

  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <h3 className="flex items-center gap-1.5 text-sm font-heading font-bold text-[#16233A]">
          <Crown className="w-4 h-4 text-[#755B18]" />
          Mandats & organigrammes
        </h3>
        <form onSubmit={createMandate} className="flex gap-2">
          <label htmlFor="mandate-label" className="sr-only">Nouveau mandat</label>
          <input
            id="mandate-label"
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="ex : Mandat 2026–2027"
            className={`${inputClass} !py-1.5 !text-xs !w-44`}
          />
          <GhostButton type="submit" className="!py-1.5 !text-[11px]">
            <Plus className="w-3 h-3" />
            <span>Créer</span>
          </GhostButton>
        </form>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && pendingUploadMandate) uploadInfographic(pendingUploadMandate, file);
          if (fileRef.current) fileRef.current.value = "";
        }}
      />

      {mandates === null ? (
        <Loader2 className="w-4 h-4 text-[#755B18] animate-spin mx-auto" />
      ) : (
        <div className="space-y-2">
          {mandates.map((mandate) => (
            <div
              key={mandate.id}
              className={`rounded-xl border p-3 space-y-2 ${
                mandate.is_current ? "border-[#755B18]/40 bg-[#755B18]/5" : "border-[#DCD7CB]/30 bg-[#EFECE4]/30"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold text-[#16233A]">{mandate.year_label}</p>
                {mandate.is_current && <Badge tone="gold">Courant</Badge>}
                <div className="ml-auto flex items-center gap-1.5">
                  {!mandate.is_current && (
                    <button onClick={() => setCurrent(mandate)} className="text-[10px] font-semibold text-[#755B18] hover:underline">
                      Définir courant
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setPendingUploadMandate(mandate.id);
                      fileRef.current?.click();
                    }}
                    className="flex items-center gap-1 text-[10px] font-semibold text-[#5C6672] hover:text-[#755B18]"
                    disabled={uploadingFor === mandate.id}
                  >
                    {uploadingFor === mandate.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>Infographie</span>
                  </button>
                  <button onClick={() => removeMandate(mandate)} aria-label="Supprimer le mandat" className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-red-600">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-[#5F6774] truncate">
                {mandate.infographic_url || "Aucune infographie"} · {mandate.members.length} membres
              </p>
              <div className="flex flex-wrap gap-1.5">
                {mandate.members.map((member) => (
                  <span key={member.id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/80 border border-[#DCD7CB]/40 text-[10px] text-[#3D4A58]">
                    <span className="font-semibold text-[#16233A]">{member.name}</span>
                    <span className="text-[#755B18]">{member.role}</span>
                    <button onClick={() => removeMember(member)} aria-label={`Retirer ${member.name}`} className="text-[#5F6774] hover:text-red-600">
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              {newMember?.mandateId === mandate.id ? (
                <form onSubmit={addMember} className="flex gap-2">
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Nom"
                    className={`${inputClass} !py-1.5 !text-xs flex-1`}
                    aria-label="Nom du membre"
                  />
                  <input
                    type="text"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    placeholder="Rôle"
                    className={`${inputClass} !py-1.5 !text-xs flex-1`}
                    aria-label="Rôle du membre"
                  />
                  <GhostButton type="submit" className="!py-1.5 !text-[11px]">OK</GhostButton>
                </form>
              ) : (
                <GhostButton onClick={() => setNewMember({ mandateId: mandate.id, name: "", role: "" })} className="!py-1 !text-[10px]">
                  <Plus className="w-3 h-3" />
                  <span>Membre</span>
                </GhostButton>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AboutTab() {
  return (
    <div className="space-y-4">
      <SectionsEditor />
      <StatsEditor />
      <MandatesEditor />
    </div>
  );
}
