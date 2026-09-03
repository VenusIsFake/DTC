"use client";

import React, { useEffect, useState } from "react";
import { HandCoins, Loader2, MessageCircle, ExternalLink } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field, PrimaryButton, inputClass } from "@/components/ui/form";

// ---------------------------------------------------------------------------
// site_settings plumbing (same pattern as HomeTab — kept local so each
// console tab stays self-contained)
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

function TextCard({
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
          <Field label={label} htmlFor={settingKey} hint={hint}>
            {multiline ? (
              <textarea
                id={settingKey}
                rows={4}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className={`${inputClass} resize-y`}
              />
            ) : (
              <input
                id={settingKey}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className={inputClass}
              />
            )}
          </Field>
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

/** Boolean toggle card (mirrors HomeTab's wall toggle). */
function ToggleCard({
  titleOn,
  titleOff,
  description,
  settingKey,
}: {
  titleOn: string;
  titleOff: string;
  description: string;
  settingKey: string;
}) {
  const { value: on, loaded } = useSettingValue<boolean>(settingKey, false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    setSaving(true);
    setError(null);
    const err = await upsertSetting(settingKey, !on);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    window.location.reload();
  };

  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-sm font-heading font-bold text-[#16233A]">{on ? titleOn : titleOff}</h3>
          <p className="text-[11px] text-[#5C6672] leading-relaxed mt-0.5">{description}</p>
        </div>
        {!loaded ? (
          <Loader2 className="w-4 h-4 text-[#755B18] animate-spin shrink-0" />
        ) : (
          <button
            onClick={toggle}
            disabled={saving}
            role="switch"
            aria-checked={on}
            aria-label={titleOn}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              on ? "bg-emerald-600" : "bg-[#16233A]"
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform ${
                on ? "translate-x-[24px]" : "translate-x-[3px]"
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

/** WhatsApp number + prefilled message, with a live test link. */
function WhatsAppCard() {
  const number = useSettingValue<string>("membership_whatsapp_number", "");
  const message = useSettingValue<string>("membership_whatsapp_message", "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setError(null);
    const digits = number.value.replace(/[^0-9]/g, "");
    if (digits && digits.length < 8) {
      setSaving(false);
      setError("Numéro trop court — format international attendu (ex. 212612345678).");
      return;
    }
    const err = await upsertSetting("membership_whatsapp_number", digits);
    const err2 = err ?? (await upsertSetting("membership_whatsapp_message", message.value.trim()));
    setSaving(false);
    if (err2) {
      setError(err2);
      return;
    }
    number.setValue(digits);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!number.loaded || !message.loaded) {
    return (
      <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-5">
        <Loader2 className="w-4 h-4 text-[#755B18] animate-spin mx-auto" />
      </div>
    );
  }

  const digits = number.value.replace(/[^0-9]/g, "");
  const testHref = digits
    ? `https://wa.me/${digits}${message.value.trim() ? `?text=${encodeURIComponent(message.value.trim())}` : ""}`
    : null;

  return (
    <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-1.5">
        <MessageCircle className="w-4 h-4 text-[#25D366]" />
        <h3 className="text-sm font-heading font-bold text-[#16233A]">Bouton WhatsApp</h3>
      </div>
      <p className="text-[11px] text-[#5C6672] leading-relaxed">
        Affiché sur la page de paiement des candidats : un appui ouvre WhatsApp avec un
        message pré-rempli vers ce numéro.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Field
          label="Numéro du bureau"
          htmlFor="membership-whatsapp-number"
          hint="Format international sans « + » ni espaces, ex. 212612345678."
        >
          <input
            id="membership-whatsapp-number"
            type="tel"
            inputMode="numeric"
            value={number.value}
            onChange={(e) => number.setValue(e.target.value)}
            placeholder="212612345678"
            className={inputClass}
          />
        </Field>
        <Field
          label="Message pré-rempli"
          htmlFor="membership-whatsapp-message"
          hint="Envoyé tel quel — pensez à vous présenter."
        >
          <input
            id="membership-whatsapp-message"
            type="text"
            value={message.value}
            onChange={(e) => message.setValue(e.target.value)}
            placeholder="Bonjour, je viens d'envoyer mon dossier d'adhésion au DTC…"
            className={inputClass}
          />
        </Field>
      </div>
      {testHref && (
        <p className="text-[10px] text-[#5F6774]">
          Aperçu :{" "}
          <a
            href={testHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-[#755B18] font-semibold hover:underline underline-offset-2"
          >
            tester le lien <ExternalLink className="w-3 h-3" />
          </a>
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

export default function MembershipTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 text-xs text-[#5C6672]">
        <HandCoins className="w-4 h-4 text-[#755B18]" />
        <p>
          Parcours d&apos;adhésion des nouveaux comptes : texte d&apos;invitation, cotisation,
          moyens de paiement et contact WhatsApp — tout se règle ici.
        </p>
      </div>

      <ToggleCard
        settingKey="membership_enabled"
        titleOn="Parcours d'adhésion actif (ouvert)"
        titleOff="Parcours d'adhésion désactivé"
        description="Activé : chaque nouveau compte invité est invité à remplir son dossier depuis « Mon espace ». Désactivé : message d'attente simple (comportement précédent)."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TextCard
          title="Texte d'invitation"
          settingKey="membership_intro"
          label="Présentation affichée avant le formulaire"
          hint="Vide = texte par défaut du site."
          multiline
          placeholder="Rejoignez le club : votes, idées, RSVP aux ateliers…"
        />
        <TextCard
          title="Cotisation à afficher"
          settingKey="membership_fee_label"
          label="Montant tel qu'affiché"
          hint="Texte libre, ex. « 500 DH / an » ou « 300 DH (promo 2028) »."
          placeholder="500 DH / an"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <ToggleCard
            settingKey="membership_bank_enabled"
            titleOn="Paiement bancaire affiché"
            titleOff="Paiement bancaire masqué"
            description="Affiche la section « Par virement / versement bancaire » sur la page de paiement."
          />
          <TextCard
            title="Coordonnées bancaires"
            settingKey="membership_bank_details"
            label="Une ligne par information (RIB, titulaire, banque…)"
            hint="Rendues sélectionnables pour copier-coller. Vérifiez chaque caractère."
            multiline
            placeholder={"RIB : 011 780 0000 1234 5678 9012 34\nTitulaire : Dentalk Club FMDC\nBanque : Attijariwafa Bank"}
          />
        </div>
        <div className="space-y-4">
          <ToggleCard
            settingKey="membership_inperson_enabled"
            titleOn="Paiement en main propre affiché"
            titleOff="Paiement en main propre masqué"
            description="Affiche la section « En main propre » : rendez-vous avec un membre du bureau."
          />
          <TextCard
            title="Instructions en main propre"
            settingKey="membership_inperson_text"
            label="Comment et où rencontrer le bureau"
            multiline
            placeholder="Passez voir le trésorier devant l'amphi 3, ou demandez au stand DTC…"
          />
        </div>
      </div>

      <WhatsAppCard />

      <TextCard
        title="Message après envoi du dossier"
        settingKey="membership_pending_text"
        label="Texte affiché tant que l'adhésion est en attente"
        hint="Vide = texte par défaut du site."
        multiline
        placeholder="Dernière étape : réglez la cotisation. Le bureau active votre accès membre dès réception du paiement."
      />

      <div className="glass-card rounded-lg border border-[#755B18]/30 bg-[#755B18]/5 p-4 sm:p-5 space-y-2">
        <h3 className="text-sm font-heading font-bold text-[#16233A]">Comment ça marche côté bureau</h3>
        <ol className="text-[11px] text-[#3D4A58] leading-relaxed list-decimal list-inside space-y-1">
          <li>La personne crée son compte (invité) et remplit son dossier depuis « Mon espace ».</li>
          <li>
            Elle apparaît dans l&apos;onglet Utilisateurs avec le badge « Dossier reçu » ; elle voit
            les moyens de paiement et le bouton WhatsApp.
          </li>
          <li>
            Paiement vérifié (virement ou en main propre) → bouton <strong>Approuver</strong> :
            elle devient membre et accède à tout l&apos;espace.
          </li>
        </ol>
      </div>
    </div>
  );
}
