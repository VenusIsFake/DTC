"use client";

import React, { useEffect, useState } from "react";
import { Home, Loader2, Plus, Trash2 } from "lucide-react";
import type { HomeStat, PartnerCard } from "@/lib/types";
import { siteConfig } from "@/data/siteConfig";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field, PrimaryButton, GhostButton, inputClass } from "@/components/ui/form";

// ---------------------------------------------------------------------------
// site_settings plumbing shared by every card in this tab
// ---------------------------------------------------------------------------

async function upsertSetting(key: string, value: unknown): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return "Base de données non configurée.";
  const { error } = await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
  return error?.message ?? null;
}

function useSettingValue<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setValue(((data as { value: T }).value ?? fallback) as T);
        setLoaded(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { value, setValue, loaded };
}

/** One labeled text setting (input or textarea) saved into site_settings. */
function TextSettingCard({
  title,
  settingKey,
  label,
  hint,
  placeholder,
  multiline = false,
}: {
  title: string;
  settingKey: string;
  label: string;
  hint?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const { value, setValue, loaded } = useSettingValue<string>(settingKey, "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setError(null);
    const err = await upsertSetting(settingKey, value.trim());
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-3">
      <h3 className="text-sm font-heading font-bold text-[#16233A]">{title}</h3>
      {!loaded ? (
        <Loader2 className="w-4 h-4 text-[#755B18] animate-spin mx-auto" />
      ) : (
        <>
          {multiline ? (
            <Field label={label} htmlFor={settingKey} hint={hint}>
              <textarea
                id={settingKey}
                rows={3}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className={`${inputClass} resize-y`}
              />
            </Field>
          ) : (
            <Field label={label} htmlFor={settingKey} hint={hint}>
              <input
                id={settingKey}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className={inputClass}
              />
            </Field>
          )}
          {error && (
            <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex justify-end">
            <PrimaryButton onClick={save} disabled={saving} className="!py-2">
              {saving ? "…" : saved ? "Enregistré ✓" : "Enregistrer"}
            </PrimaryButton>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home stats editor (renders as the stats strip under the homepage hero)
// ---------------------------------------------------------------------------

function StatsEditor() {
  const [stats, setStats] = useState<HomeStat[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        // No saved row yet → show the live defaults so they are editable,
        // not a blank list that hides what the site currently renders.
        if (data) setStats(((data as { value: HomeStat[] }).value ?? []).slice(0, 6));
        else setStats(siteConfig.stats);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    const err = await upsertSetting("home_stats", stats ?? []);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (stats === null) {
    return (
      <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-5">
        <Loader2 className="w-4 h-4 text-[#755B18] animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-3">
      <h3 className="text-sm font-heading font-bold text-[#16233A]">Statistiques de la page d&apos;accueil</h3>
      <p className="text-[11px] text-[#5C6672]">
        Bandeau de chiffres affiché sous le hero de l&apos;accueil (max 6 — 4 idéalement). Vide = valeurs par défaut du site.
      </p>
      <div className="space-y-2">
        {stats.map((stat, idx) => (
          <div key={idx} className="grid grid-cols-[110px_1fr_auto] gap-2 items-center">
            <input
              type="text"
              value={stat.value}
              onChange={(e) => setStats(stats.map((s, i) => (i === idx ? { ...s, value: e.target.value } : s)))}
              className={`${inputClass} !text-xs`}
              aria-label={`Valeur ${idx + 1}`}
              placeholder="1,500+"
            />
            <input
              type="text"
              value={stat.label}
              onChange={(e) => setStats(stats.map((s, i) => (i === idx ? { ...s, label: e.target.value } : s)))}
              className={`${inputClass} !text-xs`}
              aria-label={`Libellé ${idx + 1}`}
              placeholder="Étudiants & Communauté"
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
      {error && (
        <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className="flex justify-between">
        <GhostButton
          onClick={() => stats.length < 6 && setStats([...stats, { value: "", label: "" }])}
          className="!py-1.5 !text-[11px]"
        >
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
// Partners editor (sponsor + partner club cards on /about)
// ---------------------------------------------------------------------------

function PartnersEditor() {
  // Prefill with the live static defaults so the two existing partners are
  // editable immediately — the DB row is only created on first save.
  const sponsor = useSettingValue<PartnerCard>("sponsor", siteConfig.sponsor);
  const partner = useSettingValue<PartnerCard>("partner_club", siteConfig.partnerClub);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setError(null);
    // Empty name = card removed (public pages + footer hide it).
    const clean = (p: PartnerCard) => ({
      name: p.name.trim(),
      tagline: p.tagline.trim(),
    });
    const errS = await upsertSetting("sponsor", clean(sponsor.value));
    const errC = await upsertSetting("partner_club", clean(partner.value));
    setSaving(false);
    const err = errS ?? errC;
    if (err) {
      setError(err);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!sponsor.loaded || !partner.loaded) {
    return (
      <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-5">
        <Loader2 className="w-4 h-4 text-[#755B18] animate-spin mx-auto" />
      </div>
    );
  }

  const rows: { title: string; data: PartnerCard; set: (p: PartnerCard) => void }[] = [
    { title: "Sponsor officiel", data: sponsor.value, set: sponsor.setValue },
    { title: "Club partenaire", data: partner.value, set: partner.setValue },
  ];

  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-3">
      <h3 className="text-sm font-heading font-bold text-[#16233A]">Partenaires & soutiens</h3>
      <p className="text-[11px] text-[#5C6672]">
        Cartes affichées sur la page À propos et dans le pied de page. Vider le nom et enregistrer
        retire la carte du site.
      </p>
      {rows.map((row) => (
        <div key={row.title} className="space-y-2 p-3 rounded-xl bg-white/60 border border-[#DCD7CB]/40">
          <p className="text-[11px] font-bold text-[#755B18]">{row.title}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Field label="Nom" htmlFor={`partner-name-${row.title}`}>
              <input
                id={`partner-name-${row.title}`}
                type="text"
                value={row.data.name}
                onChange={(e) => row.set({ ...row.data, name: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Accroche" htmlFor={`partner-tagline-${row.title}`}>
              <input
                id={`partner-tagline-${row.title}`}
                type="text"
                value={row.data.tagline}
                onChange={(e) => row.set({ ...row.data, tagline: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      ))}
      {error && (
        <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <PrimaryButton onClick={save} disabled={saving} className="!py-2">
          {saving ? "…" : saved ? "Enregistré ✓" : "Enregistrer"}
        </PrimaryButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity card images — pick a gallery image per homepage activity card
// ---------------------------------------------------------------------------

interface GalleryOption {
  id: string;
  title: string;
  image_url: string;
}

function ActivityImagesCard() {
  const images = useSettingValue<Record<string, string>>("activity_card_images", {});
  const [gallery, setGallery] = useState<GalleryOption[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("gallery_images")
      .select("id, title, image_url")
      .eq("is_published", true)
      .order("sort")
      .then(({ data }) => setGallery((data as GalleryOption[] | null) ?? []));
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    const err = await upsertSetting("activity_card_images", images.value);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cards: { key: string; label: string; fallback: string }[] = [
    { key: "debates", label: "Débats en Table Dentalk", fallback: "/media/events/debate_table_session.jpg" },
    { key: "workshops", label: "Ateliers Pratiques & Masterclasses", fallback: "/media/events/eloquence_workshop.jpg" },
    { key: "team", label: "Vie du Club & Sorties Cohésion", fallback: "/media/team/outdoor_retreat.jpg" },
  ];

  if (!images.loaded || gallery === null) {
    return (
      <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-5">
        <Loader2 className="w-4 h-4 text-[#755B18] animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-3">
      <h3 className="text-sm font-heading font-bold text-[#16233A]">Images des cartes d&apos;activité (accueil)</h3>
      <p className="text-[11px] text-[#5C6672]">
        Choisissez pour chaque carte une image publiée dans la galerie. « Par défaut » garde
        l&apos;image actuelle du site.
      </p>
      <div className="space-y-2">
        {cards.map((card) => {
          const value = images.value[card.key] ?? "";
          const preview = value || card.fallback;
          return (
            <div key={card.key} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 border border-[#DCD7CB]/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className="w-16 h-12 rounded-lg object-cover border border-[#DCD7CB]/50 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-[#16233A] truncate">{card.label}</p>
                <label className="sr-only" htmlFor={`card-img-${card.key}`}>
                  Image de la carte {card.label}
                </label>
                <select
                  id={`card-img-${card.key}`}
                  value={value}
                  onChange={(e) => images.setValue({ ...images.value, [card.key]: e.target.value })}
                  className={`${inputClass} !py-1.5 !text-[11px] mt-1`}
                >
                  <option value="">Image par défaut du site</option>
                  {gallery.map((g) => (
                    <option key={g.id} value={g.image_url}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
      {gallery.length === 0 && (
        <p className="text-[11px] text-[#755B18] bg-[#755B18]/10 border border-[#755B18]/30 rounded-lg px-3 py-2">
          Aucune image dans la galerie — publiez d&apos;abord des images dans l&apos;onglet Galerie.
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <PrimaryButton onClick={save} disabled={saving} className="!py-2">
          {saving ? "…" : saved ? "Enregistré ✓" : "Enregistrer"}
        </PrimaryButton>
      </div>
    </div>
  );
}

export default function HomeTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 text-xs text-[#5C6672]">
        <Home className="w-4 h-4 text-[#755B18]" />
        <p>Contenu éditorial de l&apos;accueil et de l&apos;en-tête — champ vide = valeur par défaut du site.</p>
      </div>
      <TextSettingCard
        title="Ligne éditoriale du hero (marquee)"
        settingKey="marquee_line"
        label="Texte en majuscules au-dessus du titre"
        placeholder="WE PRESENT TO YOU"
      />
      <TextSettingCard
        title="Slogan du hero"
        settingKey="hero_tagline"
        label="Citation affichée à côté du titre"
        placeholder="Let your voice be heard with endless echoes."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextSettingCard
          title="Sur-titre TEDx"
          settingKey="highlight_kicker"
          label="Petit texte doré de la section TEDx"
          placeholder="Événement phare"
        />
        <TextSettingCard
          title="Date de l'événement phare"
          settingKey="highlight_date"
          label="Affichée après le sur-titre"
          placeholder="22 Nov 2025"
        />
      </div>
      <StatsEditor />
      <ActivityImagesCard />
      <PartnersEditor />
      <TextSettingCard
        title="Introduction de la page À propos"
        settingKey="about_intro"
        label="Phrase sous le titre « À Propos de Dentalk Club »"
        multiline
        placeholder="Fondé en novembre 2024 à la Faculté de Médecine Dentaire de Casablanca…"
      />
    </div>
  );
}
