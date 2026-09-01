"use client";

import React, { useEffect, useState } from "react";
import { Home, Loader2 } from "lucide-react";
import type { PartnerCard } from "@/lib/types";
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
                  {value && !gallery.some((g) => g.image_url === value) && (
                    <option value={value}>⚠️ Image absente de la galerie — choisi un remplacement</option>
                  )}
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

/** Site wall toggle: when OFF, the main website is staff-only (middleware). */
function WallToggleCard() {
  const { value: wallOpen, loaded } = useSettingValue<boolean>("site_wall_open", false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    setSaving(true);
    setError(null);
    const err = await upsertSetting("site_wall_open", !wallOpen);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    // Next page load re-evaluates the wall (middleware reads the setting).
    window.location.reload();
  };

  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-sm font-heading font-bold text-[#16233A]">
            Accès public du site {wallOpen ? "(ouvert)" : "(réservé au bureau)"}
          </h3>
          <p className="text-[11px] text-[#5C6672] leading-relaxed mt-0.5">
            {wallOpen
              ? "Le site principal est visible de tous. Basculer pour le refermer."
              : "Seul le formulaire /candidature est public ; le reste du site exige un compte bureau ou admin."}
          </p>
        </div>
        {!loaded ? (
          <Loader2 className="w-4 h-4 text-[#755B18] animate-spin shrink-0" />
        ) : (
          <button
            onClick={toggle}
            disabled={saving}
            role="switch"
            aria-checked={wallOpen}
            aria-label="Ouvrir le site au public"
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              wallOpen ? "bg-emerald-600" : "bg-[#16233A]"
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform ${
                wallOpen ? "translate-x-[24px]" : "translate-x-[3px]"
              }`}
            />
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
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
      <WallToggleCard />
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
