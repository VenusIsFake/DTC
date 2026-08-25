"use client";

import React, { useEffect, useState } from "react";
import { Building2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { Committee } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field, PrimaryButton, GhostButton, inputClass } from "@/components/ui/form";

function CommitteesEditor() {
  const [committees, setCommittees] = useState<Committee[] | null>(null);
  const [editing, setEditing] = useState<Committee | null>(null);
  const [form, setForm] = useState({ name: "", description: "", sort: 1 });

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase.from("committees").select("*").order("sort");
    setCommittees((data as Committee[] | null) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (committee: Committee | null) => {
    setEditing(committee);
    setForm(
      committee
        ? { name: committee.name, description: committee.description, sort: committee.sort }
        : { name: "", description: "", sort: (committees?.at(-1)?.sort ?? 0) + 1 }
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const payload = { name: form.name.trim(), description: form.description.trim(), sort: Number(form.sort) || 1 };
    const { error } = editing
      ? await supabase.from("committees").update(payload).eq("id", editing.id)
      : await supabase.from("committees").insert(payload);
    if (!error) {
      setEditing(null);
      load();
    }
  };

  const remove = async (committee: Committee) => {
    if (!window.confirm(`Supprimer la commission « ${committee.name} » ? Les profils liés perdront cette commission.`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("committees").delete().eq("id", committee.id);
    load();
  };

  return (
    <div className="glass-card rounded-2xl border border-[#385A75]/40 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2.5">
        <h3 className="flex items-center gap-1.5 text-sm font-heading font-bold text-white">
          <Building2 className="w-4 h-4 text-[#D4AF37]" />
          Commissions ({committees?.length ?? "…"})
        </h3>
        <button onClick={() => startEdit(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#0B132B] hover:brightness-110 active:scale-95">
          <Plus className="w-3 h-3" />
          <span>Commission</span>
        </button>
      </div>

      {editing && (
        <form onSubmit={submit} className="space-y-3 p-3 rounded-xl bg-[#0F172A]/60 border border-[#D4AF37]/25">
          <div className="grid grid-cols-[1fr_90px] gap-3">
            <Field label="Nom" htmlFor="committee-name">
              <input id="committee-name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Ordre" htmlFor="committee-sort">
              <input id="committee-sort" type="number" min={1} value={form.sort} onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })} className={inputClass} />
            </Field>
          </div>
          <Field label="Description" htmlFor="committee-desc">
            <textarea id="committee-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-y`} />
          </Field>
          <div className="flex justify-end gap-2">
            <GhostButton type="button" onClick={() => setEditing(null)}>Annuler</GhostButton>
            <PrimaryButton type="submit">Enregistrer</PrimaryButton>
          </div>
        </form>
      )}

      {committees === null ? (
        <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin mx-auto" />
      ) : (
        <div className="space-y-1.5">
          {committees.map((committee) => (
            <div key={committee.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#1B2E4B]/40 border border-[#385A75]/25">
              <span className="text-[10px] font-bold text-[#D4AF37] w-5 shrink-0">{committee.sort}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{committee.name}</p>
                <p className="text-[10px] text-[#64748B] truncate">{committee.description}</p>
              </div>
              <button onClick={() => startEdit(committee)} aria-label="Modifier" className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#D4AF37]">
                <Pencil className="w-3 h-3" />
              </button>
              <button onClick={() => remove(committee)} aria-label="Supprimer" className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-red-400">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PromoYearsEditor() {
  const [raw, setRaw] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "promo_years")
      .maybeSingle()
      .then(({ data }) => {
        if (data) setRaw(((data as { value: number[] }).value ?? []).join(", "));
      });
  }, []);

  const save = async () => {
    const years = raw
      .split(/[,;\s]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n > 1990 && n < 2100);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true);
    await supabase.from("site_settings").upsert({ key: "promo_years", value: years }, { onConflict: "key" });
    setSaving(false);
    setSaved(true);
    setRaw(years.join(", "));
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-card rounded-2xl border border-[#385A75]/40 p-4 sm:p-5 space-y-3">
      <h3 className="text-sm font-heading font-bold text-white">Liste des années (promos)</h3>
      <p className="text-[11px] text-[#94A3B8]">
        Années proposées dans le sélecteur « Promo » du profil membre. Séparez par des virgules.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="promo-years" className="sr-only">Années promo</label>
        <input
          id="promo-years"
          type="text"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="2024, 2025, 2026"
          className={`${inputClass} flex-1`}
        />
        <PrimaryButton onClick={save} disabled={saving} className="shrink-0">
          {saving ? "…" : saved ? "Enregistré ✓" : "Enregistrer"}
        </PrimaryButton>
      </div>
    </div>
  );
}

export default function CommitteesTab() {
  return (
    <div className="space-y-4">
      <CommitteesEditor />
      <PromoYearsEditor />
    </div>
  );
}
