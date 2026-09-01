"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  Download,
  Link2,
  Loader2,
  Lock,
  LockOpen,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
import type {
  ApplicationRow,
  ApplicationStatus,
  Recruitment,
  RecruitmentPosition,
} from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/format";
import { Badge, Field, GhostButton, PrimaryButton, inputClass } from "@/components/ui/form";

const STATUS_META: Record<
  ApplicationStatus,
  { label: string; tone: "gold" | "blue" | "green" | "red" }
> = {
  new: { label: "Nouvelle", tone: "gold" },
  reviewed: { label: "Traitée", tone: "blue" },
  accepted: { label: "Retenue", tone: "green" },
  rejected: { label: "Écartée", tone: "red" },
};

function csvEscape(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

/** Canonical public link of the application form (branded domain). */
const SHARE_URL = `${siteConfig.siteUrl}/candidature`;

/** Campaign settings: title, intro, open/close, open positions. */
function CampaignEditor() {
  const [campaign, setCampaign] = useState<Recruitment | null>(null);
  const [positions, setPositions] = useState<RecruitmentPosition[] | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingPosition, setEditingPosition] = useState<RecruitmentPosition | null>(null);
  const [addingPosition, setAddingPosition] = useState(false);
  const [positionForm, setPositionForm] = useState({ title: "", description: "" });
  const [linkCopied, setLinkCopied] = useState(false);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
    } catch {
      const input = document.getElementById("rec-share-url") as HTMLInputElement | null;
      input?.select();
      document.execCommand("copy");
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase
      .from("recruitments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      const row = data as Recruitment;
      setCampaign(row);
      // Prefill live values (console convention: editors never start blank).
      setTitle(row.title);
      setIntro(row.intro);
      const { data: pos } = await supabase
        .from("recruitment_positions")
        .select("*")
        .eq("recruitment_id", row.id)
        .order("sort", { ascending: true });
      setPositions((pos as RecruitmentPosition[] | null) ?? []);
    } else {
      setPositions([]);
    }
    setLoaded(true);
  };

  useEffect(() => {
    load();
  }, []);

  const createCampaign = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: dbError } = await supabase.from("recruitments").insert({
      title: "Appel à candidatures — Bureau",
      intro: "Expliquez ici l'appel à candidatures adressé aux membres…",
      is_open: false,
    });
    if (dbError) {
      setError(dbError.message);
      return;
    }
    setError(null);
    await load();
  };

  const save = async () => {
    if (!campaign) return;
    if (title.trim().length < 3) {
      setError("Le titre doit contenir au moins 3 caractères.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true);
    const { error: dbError } = await supabase
      .from("recruitments")
      .update({ title: title.trim(), intro: intro.trim() })
      .eq("id", campaign.id);
    setSaving(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    setError(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    await load();
  };

  const toggleOpen = async () => {
    if (!campaign) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: dbError } = await supabase
      .from("recruitments")
      .update({ is_open: !campaign.is_open })
      .eq("id", campaign.id);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    setError(null);
    await load();
  };

  const startPositionEdit = (position: RecruitmentPosition | null) => {
    setAddingPosition(position === null);
    setEditingPosition(position);
    setPositionForm(
      position
        ? { title: position.title, description: position.description }
        : { title: "", description: "" }
    );
  };

  const submitPosition = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!campaign || positionForm.title.trim().length < 2) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: dbError } =
      editingPosition && !addingPosition
        ? await supabase
            .from("recruitment_positions")
            .update({ title: positionForm.title.trim(), description: positionForm.description.trim() })
            .eq("id", editingPosition.id)
        : await supabase.from("recruitment_positions").insert({
            recruitment_id: campaign.id,
            title: positionForm.title.trim(),
            description: positionForm.description.trim(),
            sort: (positions?.at(-1)?.sort ?? 0) + 1,
          });
    if (dbError) {
      setError(dbError.message);
      return;
    }
    setError(null);
    setEditingPosition(null);
    setAddingPosition(false);
    await load();
  };

  const removePosition = async (position: RecruitmentPosition) => {
    if (
      !window.confirm(
        `Supprimer le poste « ${position.title} » ? Les candidatures déjà reçues sont conservées (elles apparaîtront sans poste).`
      )
    )
      return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("recruitment_positions").delete().eq("id", position.id);
    await load();
  };

  if (!loaded) {
    return (
      <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-8 text-center">
        <Loader2 className="w-5 h-5 text-[#755B18] animate-spin mx-auto" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-6 sm:p-8 space-y-4 text-center">
        <h3 className="flex items-center justify-center gap-1.5 text-sm font-heading font-bold text-[#16233A]">
          <ClipboardList className="w-4 h-4 text-[#755B18]" />
          Aucune campagne de candidatures
        </h3>
        <p className="text-xs text-[#5C6672] max-w-md mx-auto">
          Créez une campagne pour ouvrir le formulaire /candidature aux membres : titre, texte
          d&apos;appel, postes ouverts — tout est modifiable ici.
        </p>
        <PrimaryButton onClick={createCampaign}>
          <Plus className="w-3.5 h-3.5" />
          Nouvelle campagne
        </PrimaryButton>
        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <h3 className="flex items-center gap-1.5 text-sm font-heading font-bold text-[#16233A]">
          <ClipboardList className="w-4 h-4 text-[#755B18]" />
          Campagne « {campaign.title} »
        </h3>
        <div className="flex items-center gap-2">
          <Badge tone={campaign.is_open ? "green" : "gray"}>
            {campaign.is_open ? "Ouverte" : "Fermée"}
          </Badge>
          <GhostButton onClick={toggleOpen}>
            {campaign.is_open ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
            {campaign.is_open ? "Fermer les candidatures" : "Ouvrir les candidatures"}
          </GhostButton>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-lg bg-[#EFECE4]/60 border border-[#DCD7CB]/30">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#755B18] shrink-0">
          <Link2 className="w-3 h-3" />
          Lien à envoyer aux membres
        </span>
        <input
          id="rec-share-url"
          type="text"
          readOnly
          value={SHARE_URL}
          onFocus={(e) => e.currentTarget.select()}
          className={`${inputClass} flex-1 !py-1.5 !text-[11px] font-mono`}
        />
        <GhostButton onClick={copyShareLink} className="shrink-0 justify-center">
          {linkCopied ? "Copié ✓" : "Copier"}
        </GhostButton>
      </div>

      <div className="space-y-3">
        <Field label="Titre affiché sur /candidature" htmlFor="rec-title">
          <input
            id="rec-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Texte d'appel (paragraphes séparés par une ligne vide)" htmlFor="rec-intro">
          <textarea
            id="rec-intro"
            rows={6}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </Field>
        <div className="flex justify-end">
          <PrimaryButton onClick={save} disabled={saving}>
            {saving ? "…" : saved ? "Enregistré ✓" : "Enregistrer"}
          </PrimaryButton>
        </div>
      </div>

      <div className="space-y-2.5 pt-2 border-t border-[#DCD7CB]/50">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-[#16233A] uppercase tracking-wide">
            Postes ouverts ({positions?.length ?? 0})
          </h4>
          <button
            onClick={() => startPositionEdit(null)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-bold bg-[#755B18] text-[#F7F5F0] hover:brightness-110 active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>Poste</span>
          </button>
        </div>

        {editingPosition && (
          <form
            onSubmit={submitPosition}
            className="space-y-3 p-3 rounded-xl bg-white/60 border border-[#755B18]/25"
          >
            <Field label="Intitulé du poste" htmlFor="pos-title">
              <input
                id="pos-title"
                type="text"
                required
                value={positionForm.title}
                onChange={(e) => setPositionForm({ ...positionForm, title: e.target.value })}
                className={inputClass}
                placeholder="ex : Secrétaire général(e)"
              />
            </Field>
            <Field label="Précisions (optionnel)" htmlFor="pos-desc">
              <textarea
                id="pos-desc"
                rows={2}
                value={positionForm.description}
                onChange={(e) => setPositionForm({ ...positionForm, description: e.target.value })}
                className={`${inputClass} resize-y`}
              />
            </Field>
            <div className="flex justify-end gap-2">
              <GhostButton
                type="button"
                onClick={() => {
                  setEditingPosition(null);
                  setAddingPosition(false);
                }}
              >
                Annuler
              </GhostButton>
              <PrimaryButton type="submit">Enregistrer</PrimaryButton>
            </div>
          </form>
        )}

        {positions === null ? (
          <Loader2 className="w-4 h-4 text-[#755B18] animate-spin mx-auto" />
        ) : (
          <div className="space-y-1.5">
            {positions.map((position) => (
              <div
                key={position.id}
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#EFECE4]/40 border border-[#DCD7CB]/25"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#16233A] truncate">{position.title}</p>
                  {position.description && (
                    <p className="text-[10px] text-[#5F6774] truncate">{position.description}</p>
                  )}
                </div>
                <button
                  onClick={() => startPositionEdit(position)}
                  aria-label="Modifier"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-[#755B18]"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removePosition(position)}
                  aria-label="Supprimer"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {positions.length === 0 && (
              <p className="text-xs text-[#5C6672] py-2">
                Aucun poste — ajoutez au moins un poste pour que le formulaire soit complet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Submitted applications: read, label, delete, CSV export. */
function ApplicationsList() {
  const [items, setItems] = useState<ApplicationRow[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase
      .from("applications")
      .select("*, position:recruitment_positions(title)")
      .order("created_at", { ascending: false });
    setItems((data as ApplicationRow[] | null) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (item: ApplicationRow, status: ApplicationStatus) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("applications").update({ status }).eq("id", item.id);
    load();
  };

  const remove = async (item: ApplicationRow) => {
    // Irreversible: warn explicitly, then surface any DB failure (RLS, network).
    if (
      !window.confirm(
        `Supprimer définitivement la candidature de « ${item.full_name} » ?\n\n` +
          "Cette action est irréversible : toutes ses réponses seront perdues."
      )
    )
      return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase.from("applications").delete().eq("id", item.id);
    if (error) {
      window.alert(`Suppression impossible : ${error.message}`);
      return;
    }
    load();
  };

  const exportCsv = () => {
    if (!items || items.length === 0) return;
    const header = [
      "Date",
      "Nom et prénom",
      "Année d'étude",
      "Poste",
      "Téléphone",
      "Responsabilité antérieure",
      "Motivation et vision",
      "Pourquoi vous",
      "Statut",
    ];
    const lines = items.map((item) =>
      [
        formatDateTime(item.created_at),
        item.full_name,
        item.study_year,
        item.position?.title ?? "",
        item.phone,
        item.had_responsibility ? "Oui" : "Non",
        item.motivation,
        item.why_you,
        STATUS_META[item.status].label,
      ]
        .map(csvEscape)
        .join(",")
    );
    // BOM so Excel renders accents correctly.
    const blob = new Blob(["\uFEFF" + [header.map(csvEscape).join(","), ...lines].join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `candidatures-dtc-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const newCount = items?.filter((i) => i.status === "new").length ?? 0;

  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <h3 className="text-sm font-heading font-bold text-[#16233A]">
          Candidatures reçues ({items?.length ?? "…"}
          {items && newCount > 0 ? (
            <span className="text-[#755B18]">
              {" "}
              · {newCount} nouvelle{newCount > 1 ? "s" : ""}
            </span>
          ) : null}
          )
        </h3>
        {items && items.length > 0 && (
          <GhostButton onClick={exportCsv}>
            <Download className="w-3.5 h-3.5" />
            Exporter CSV
          </GhostButton>
        )}
      </div>

      {items === null ? (
        <Loader2 className="w-4 h-4 text-[#755B18] animate-spin mx-auto" />
      ) : items.length === 0 ? (
        <p className="text-xs text-[#5C6672] text-center py-4">
          Aucune candidature pour le moment — elles apparaîtront ici dès qu&apos;un membre
          enverra le formulaire.
        </p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => {
            const meta = STATUS_META[item.status];
            const isOpen = expanded === item.id;
            return (
              <div
                key={item.id}
                className="rounded-lg bg-[#EFECE4]/40 border border-[#DCD7CB]/25 overflow-hidden"
              >
                <div className="p-2.5 sm:p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpanded(isOpen ? null : item.id)}
                      aria-expanded={isOpen}
                      className="flex items-center shrink-0 text-[#5C6672] hover:text-[#16233A] transition-colors"
                      aria-label={isOpen ? "Réduire la candidature" : "Développer la candidature"}
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <p className="min-w-0 flex-1 text-xs sm:text-sm font-bold text-[#16233A] truncate">
                      {item.full_name}
                      <span className="ml-1.5 font-semibold text-[#755B18]">{item.study_year}</span>
                    </p>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#5C6672] leading-relaxed">
                    {item.position?.title ?? "Poste supprimé"} · {item.phone} ·{" "}
                    {formatDateTime(item.created_at)}
                    {item.had_responsibility ? " · déjà responsable" : " · 1er poste"}
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`app-status-${item.id}`}>
                      Statut
                    </label>
                    <select
                      id={`app-status-${item.id}`}
                      value={item.status}
                      onChange={(e) => setStatus(item, e.target.value as ApplicationStatus)}
                      className={`${inputClass} flex-1 sm:flex-none !py-1.5 !px-2 !text-[11px]`}
                    >
                      <option value="new">Nouvelle</option>
                      <option value="reviewed">Traitée</option>
                      <option value="accepted">Retenue</option>
                      <option value="rejected">Écartée</option>
                    </select>
                    <button
                      onClick={() => remove(item)}
                      aria-label="Supprimer"
                      className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-red-600 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-3.5 pb-3 pt-1 space-y-2.5 border-t border-[#DCD7CB]/30 bg-white/50">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#755B18]">
                        Motivation et vision pour le club
                      </p>
                      <p className="text-xs text-[#3D4A58] whitespace-pre-wrap leading-relaxed mt-0.5">
                        {item.motivation}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#755B18]">
                        Pourquoi vous et pas quelqu&apos;un d&apos;autre ?
                      </p>
                      <p className="text-xs text-[#3D4A58] whitespace-pre-wrap leading-relaxed mt-0.5">
                        {item.why_you}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#5C6672]">
                      {item.had_responsibility
                        ? "A déjà occupé un poste de responsabilité."
                        : "Premier poste de responsabilité."}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RecruitmentsTab() {
  return (
    <div className="space-y-4">
      <CampaignEditor />
      <ApplicationsList />
    </div>
  );
}
