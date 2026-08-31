"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Crown,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  UserPlus,
} from "lucide-react";
import type { AboutSection, Mandate, MandateMember, ProfileOption } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadClubImage, clubUploadErrorMessage } from "@/lib/mediaUpload";
import { Field, PrimaryButton, GhostButton, Badge, inputClass } from "@/components/ui/form";
import UserAvatar from "@/components/UserAvatar";

// ---------------------------------------------------------------------------
// Sections editor
// ---------------------------------------------------------------------------

function SectionsEditor() {
  const [sections, setSections] = useState<AboutSection[] | null>(null);
  const [editing, setEditing] = useState<AboutSection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ key: "", sort_order: 1, title: "", body: "", is_published: true });

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data, error: loadError } = await supabase.from("about_sections").select("*").order("sort_order");
    if (loadError) setError(loadError.message);
    setSections((data as AboutSection[] | null) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (section: AboutSection | null) => {
    setEditing(section);
    setError(null);
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
    setError(null);
    const payload = {
      key: form.key.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-") || `section-${Date.now()}`,
      sort_order: Number(form.sort_order) || 1,
      title: form.title.trim(),
      body: form.body,
      is_published: form.is_published,
    };
    const { error: dbError } = editing
      ? await supabase.from("about_sections").update(payload).eq("id", editing.id)
      : await supabase.from("about_sections").insert(payload);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    setEditing(null);
    load();
  };

  const togglePublished = async (section: AboutSection) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: dbError } = await supabase
      .from("about_sections")
      .update({ is_published: !section.is_published })
      .eq("id", section.id);
    if (dbError) setError(dbError.message);
    load();
  };

  const remove = async (section: AboutSection) => {
    if (!window.confirm(`Supprimer la section « ${section.title} » ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: dbError } = await supabase.from("about_sections").delete().eq("id", section.id);
    if (dbError) setError(dbError.message);
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

      {error && (
        <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

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
// Mandates manager
// ---------------------------------------------------------------------------

interface MemberForm {
  mandateId: string;
  /** null = creating a new member. */
  id: string | null;
  profile_id: string;
  name: string;
  role: string;
  photo_url: string;
}

function MandatesEditor() {
  const [mandates, setMandates] = useState<(Mandate & { members: MandateMember[] })[] | null>(null);
  const [profiles, setProfiles] = useState<ProfileOption[] | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [memberForm, setMemberForm] = useState<MemberForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoFileRef = useRef<HTMLInputElement>(null);
  const [pendingUploadMandate, setPendingUploadMandate] = useState<string | null>(null);

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const [{ data: mandateRows, error: mError }, { data: memberRows }] = await Promise.all([
      supabase
        .from("mandates")
        .select("*")
        .order("is_current", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("mandate_members").select("*").order("sort"),
    ]);
    if (mError) setError(mError.message);
    const grouped = (mandateRows ?? []) as Mandate[];
    setMandates(
      grouped.map((m) => ({
        ...m,
        members: ((memberRows ?? []) as MandateMember[]).filter((mm) => mm.mandate_id === m.id),
      }))
    );
  };

  // Member picker data — the bureau RPC exposes safe profile fields.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .rpc("bureau_list_profiles")
      .then(({ data }) => {
        const rows = ((data ?? []) as ProfileOption[])
          .filter((p) => p.full_name?.trim())
          .sort((a, b) => a.full_name.localeCompare(b.full_name, "fr"));
        setProfiles(rows);
      });
  }, []);

  useEffect(() => {
    load();
  }, []);

  /** Surface a DB error, or clear the banner when null. */
  const fail = (err: { message: string } | null, friendly?: string): boolean => {
    if (!err) {
      setError(null);
      return false;
    }
    setError(friendly ?? err.message);
    return true;
  };

  const friendlyDbError = (message: string) =>
    /duplicate key/i.test(message)
      ? "Ce libellé existe déjà — les mandats doivent être uniques."
      : message;

  const createMandate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newLabel.trim()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setNotice(null);
    const { error: dbError } = await supabase
      .from("mandates")
      .insert({ year_label: newLabel.trim(), is_current: false });
    if (fail(dbError, dbError ? friendlyDbError(dbError.message) : undefined)) return;
    setNewLabel("");
    load();
  };

  const setCurrent = async (mandate: Mandate) => {
    if (!window.confirm(`« ${mandate.year_label} » devient le mandat courant ; l'ancien est archivé automatiquement. Continuer ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setNotice(null);
    const { error: dbError } = await supabase.from("mandates").update({ is_current: true }).eq("id", mandate.id);
    fail(dbError);
    load();
  };

  const removeMandate = async (mandate: Mandate) => {
    if (!window.confirm(`Supprimer le mandat « ${mandate.year_label} » et ses membres ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setNotice(null);
    const { error: dbError } = await supabase.from("mandates").delete().eq("id", mandate.id);
    fail(dbError);
    load();
  };

  const uploadInfographic = async (mandateId: string, file: File) => {
    setUploadingFor(mandateId);
    try {
      const url = await uploadClubImage(file, `mandates/${mandateId}`);
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      const { error: dbError } = await supabase
        .from("mandates")
        .update({ infographic_url: url })
        .eq("id", mandateId);
      fail(dbError);
      load();
    } catch (err) {
      setError(clubUploadErrorMessage(err));
    } finally {
      setUploadingFor(null);
    }
  };

  const startMemberEdit = (mandateId: string, member?: MandateMember) => {
    setError(null);
    setMemberForm(
      member
        ? {
            mandateId,
            id: member.id,
            profile_id: member.profile_id ?? "",
            name: member.name,
            role: member.role,
            photo_url: member.photo_url ?? "",
          }
        : { mandateId, id: null, profile_id: "", name: "", role: "", photo_url: "" }
    );
  };

  const saveMember = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!memberForm || !memberForm.name.trim()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setNotice(null);
    const payload = {
      mandate_id: memberForm.mandateId,
      name: memberForm.name.trim(),
      role: memberForm.role.trim() || "Membre",
      profile_id: memberForm.profile_id || null,
      photo_url: memberForm.photo_url.trim() || null,
    };
    const mandate = mandates?.find((m) => m.id === memberForm.mandateId);
    const { error: dbError } = memberForm.id
      ? await supabase.from("mandate_members").update(payload).eq("id", memberForm.id)
      : await supabase
          .from("mandate_members")
          .insert({ ...payload, sort: (mandate?.members.length ?? 0) + 1 });
    if (fail(dbError, dbError ? (/duplicate key/i.test(dbError.message) ? "Ce membre figure déjà dans le mandat." : dbError.message) : undefined)) return;
    setMemberForm(null);
    load();
  };

  const removeMember = async (member: MandateMember) => {
    if (!window.confirm(`Retirer ${member.name} du mandat ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setNotice(null);
    const { error: dbError } = await supabase.from("mandate_members").delete().eq("id", member.id);
    fail(dbError);
    load();
  };

  /** Swap sort values with the visible neighbour (sorted list order = display order). */
  const moveMember = async (mandateId: string, memberId: string, dir: -1 | 1) => {
    const mandate = mandates?.find((m) => m.id === mandateId);
    const list = [...(mandate?.members ?? [])].sort((a, b) => a.sort - b.sort);
    const idx = list.findIndex((m) => m.id === memberId);
    const neighbour = list[idx + dir];
    const member = list[idx];
    if (!mandate || !member || !neighbour) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const [a, b] = await Promise.all([
      supabase.from("mandate_members").update({ sort: neighbour.sort }).eq("id", member.id),
      supabase.from("mandate_members").update({ sort: member.sort }).eq("id", neighbour.id),
    ]);
    fail(a.error ?? b.error);
    load();
  };

  /** Copy the most recent other mandat's team (roles, photos, profile links kept). */
  const importPrevious = async (mandate: Mandate & { members: MandateMember[] }) => {
    const source = (mandates ?? [])
      .filter((m) => m.id !== mandate.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    if (!source || source.members.length === 0) return;
    const existing = new Set(mandate.members.map((m) => m.name.trim().toLowerCase()));
    const byName = new Map((profiles ?? []).map((p) => [p.full_name.trim().toLowerCase(), p.id]));
    const rows = source.members
      .filter((m) => !existing.has(m.name.trim().toLowerCase()))
      .map((m, i) => ({
        mandate_id: mandate.id,
        name: m.name,
        role: m.role,
        photo_url: m.photo_url,
        profile_id: m.profile_id ?? byName.get(m.name.trim().toLowerCase()) ?? null,
        sort: mandate.members.length + i + 1,
      }));
    if (rows.length === 0) {
      setNotice("Toute l'équipe de l'autre mandat est déjà présente ici.");
      return;
    }
    if (!window.confirm(`Reprendre ${rows.length} membre(s) de « ${source.year_label} » (rôles, photos et comptes liés conservés) ?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: dbError } = await supabase.from("mandate_members").insert(rows);
    if (fail(dbError)) return;
    setNotice(`${rows.length} membre(s) importé(s) depuis « ${source.year_label} ».`);
    load();
  };

  const uploadMemberPhoto = async (file: File) => {
    if (!memberForm) return;
    setUploadingPhoto(true);
    setError(null);
    try {
      const url = await uploadClubImage(file, `mandates/${memberForm.mandateId}`);
      setMemberForm({ ...memberForm, photo_url: url });
    } catch (err) {
      setError(clubUploadErrorMessage(err));
    } finally {
      setUploadingPhoto(false);
    }
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

      {error && (
        <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {notice && (
        <p className="text-xs text-emerald-700 bg-emerald-600/10 border border-emerald-600/30 rounded-lg px-3 py-2">
          {notice}
        </p>
      )}

      {mandates === null ? (
        <Loader2 className="w-4 h-4 text-[#755B18] animate-spin mx-auto" />
      ) : (
        <div className="space-y-2">
          {mandates.length === 0 && (
            <p className="text-[11px] text-[#755B18] bg-[#755B18]/10 border border-[#755B18]/30 rounded-lg px-3 py-2">
              Aucun mandat en base — le site public affiche le mandat statique de secours (2025–2026).
            </p>
          )}
          {mandates.map((mandate) => {
            const sortedMembers = [...mandate.members].sort((a, b) => a.sort - b.sort);
            const hasOtherMandate = mandates.some((m) => m.id !== mandate.id && m.members.length > 0);
            return (
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
                    {hasOtherMandate && (
                      <button
                        onClick={() => importPrevious(mandate)}
                        title="Reprendre l'équipe du mandat précédent (rôles et photos conservés)"
                        className="flex items-center gap-1 text-[10px] font-semibold text-[#5C6672] hover:text-[#755B18]"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Importer l&apos;équipe précédente</span>
                      </button>
                    )}
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

                <div className="space-y-1">
                  {sortedMembers.map((member, idx) => (
                    <div key={member.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/70 border border-[#DCD7CB]/30">
                      <UserAvatar name={member.name} src={member.photo_url} size={30} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-[#16233A] truncate">
                          {member.name}
                          {member.profile_id && (
                            <Badge tone="gray" className="ml-1.5">compte lié</Badge>
                          )}
                        </p>
                        <p className="text-[10px] text-[#755B18] truncate">{member.role}</p>
                      </div>
                      <button
                        onClick={() => moveMember(mandate.id, member.id, -1)}
                        disabled={idx === 0}
                        aria-label={`Monter ${member.name}`}
                        className="w-6 h-6 flex items-center justify-center rounded text-[#5C6672] hover:text-[#755B18] disabled:opacity-30"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveMember(mandate.id, member.id, 1)}
                        disabled={idx === sortedMembers.length - 1}
                        aria-label={`Descendre ${member.name}`}
                        className="w-6 h-6 flex items-center justify-center rounded text-[#5C6672] hover:text-[#755B18] disabled:opacity-30"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => startMemberEdit(mandate.id, member)}
                        aria-label={`Modifier ${member.name}`}
                        className="w-6 h-6 flex items-center justify-center rounded text-[#5C6672] hover:text-[#755B18]"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeMember(member)}
                        aria-label={`Retirer ${member.name}`}
                        className="w-6 h-6 flex items-center justify-center rounded text-[#5C6672] hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {memberForm?.mandateId === mandate.id ? (
                  <form onSubmit={saveMember} className="space-y-2.5 p-3 rounded-xl bg-white/60 border border-[#755B18]/25">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <Field
                        label="Compte du club (optionnel)"
                        htmlFor={`mm-profile-${mandate.id}`}
                        hint="Réutilise un membre existant — nom prérempli, compte lié."
                      >
                        <select
                          id={`mm-profile-${mandate.id}`}
                          value={memberForm.profile_id}
                          onChange={(e) => {
                            const id = e.target.value;
                            const profile = profiles?.find((p) => p.id === id);
                            setMemberForm({
                              ...memberForm,
                              profile_id: id,
                              name: memberForm.name.trim() ? memberForm.name : (profile?.full_name ?? ""),
                            });
                          }}
                          className={inputClass}
                        >
                          <option value="">— Saisie libre (pas de compte) —</option>
                          {profiles?.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.full_name}
                              {p.promo ? ` — promo ${p.promo}` : ""}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Rôle dans le mandat" htmlFor={`mm-role-${mandate.id}`}>
                        <input
                          id={`mm-role-${mandate.id}`}
                          type="text"
                          value={memberForm.role}
                          onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                          placeholder="ex : Présidente"
                          className={inputClass}
                        />
                      </Field>
                    </div>
                    <Field label="Nom affiché" htmlFor={`mm-name-${mandate.id}`}>
                      <input
                        id={`mm-name-${mandate.id}`}
                        type="text"
                        required
                        value={memberForm.name}
                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <input
                        ref={photoFileRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadMemberPhoto(file);
                          if (photoFileRef.current) photoFileRef.current.value = "";
                        }}
                      />
                      <UserAvatar name={memberForm.name || "?"} src={memberForm.photo_url || null} size={40} />
                      <GhostButton
                        type="button"
                        onClick={() => photoFileRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="!py-1.5 !text-[11px]"
                      >
                        {uploadingPhoto ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        <span>{memberForm.photo_url ? "Changer la photo" : "Ajouter une photo"}</span>
                      </GhostButton>
                      {memberForm.photo_url && (
                        <button
                          type="button"
                          onClick={() => setMemberForm({ ...memberForm, photo_url: "" })}
                          className="text-[10px] font-semibold text-[#5C6672] hover:text-red-600"
                        >
                          Retirer la photo
                        </button>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <GhostButton type="button" onClick={() => setMemberForm(null)}>Annuler</GhostButton>
                      <PrimaryButton type="submit">{memberForm.id ? "Mettre à jour" : "Ajouter"}</PrimaryButton>
                    </div>
                  </form>
                ) : (
                  <GhostButton onClick={() => startMemberEdit(mandate.id)} className="!py-1 !text-[10px]">
                    <Plus className="w-3 h-3" />
                    <span>Membre</span>
                  </GhostButton>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AboutTab() {
  return (
    <div className="space-y-4">
      <SectionsEditor />
      <MandatesEditor />
    </div>
  );
}
