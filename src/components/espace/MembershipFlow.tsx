"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Banknote,
  CircleAlert,
  HandCoins,
  Loader2,
  MessageCircle,
  PenLine,
  Send,
  XCircle,
} from "lucide-react";
import type { MembershipSettings, Profile, SiteSettings } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field, PrimaryButton, GhostButton, inputClass } from "@/components/ui/form";

type Phase = "intro" | "form" | "pending";

export default function MembershipFlow({
  profile,
  settings,
  siteSettings,
}: {
  profile: Profile;
  settings: MembershipSettings;
  siteSettings: SiteSettings;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(profile.membership_status === "pending" ? "pending" : "intro");
  const [fullName, setFullName] = useState(profile.full_name);
  const [promo, setPromo] = useState(profile.promo ? String(profile.promo) : "");
  const [phone, setPhone] = useState(profile.phone);
  const [bio, setBio] = useState(profile.bio);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const whatsappHref =
    settings.whatsappNumber.length >= 8
      ? `https://wa.me/${settings.whatsappNumber}${settings.whatsappMessage ? `?text=${encodeURIComponent(settings.whatsappMessage)}` : ""}`
      : null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Base de données non disponible.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { error: rpcError } = await supabase.rpc("submit_membership_request", {
        p_full_name: fullName.trim(),
        p_promo: promo ? Number(promo) : null,
        p_phone: phone.trim(),
        p_bio: bio.trim(),
      });
      if (rpcError) throw rpcError;
      setPhase("pending");
      // Server components re-read the profile (navbar, guards) on next nav.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRequest = async () => {
    if (!window.confirm("Retirer votre demande d'adhésion ? Vous pourrez la renvoyer plus tard.")) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: rpcError } = await supabase.rpc("cancel_membership_request");
    if (!rpcError) {
      setPhase("intro");
      router.refresh();
    } else {
      setError(rpcError.message);
    }
  };

  return (
    <div className="pt-10 sm:pt-14 pb-16 px-4 max-w-2xl mx-auto space-y-5">
      <div className="space-y-1.5 text-center">
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#755B18]">
          Espace Membre
        </p>
        <h1 className="text-xl sm:text-2xl font-heading font-semibold text-[#16233A]">
          Bienvenue au DTC{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} !
        </h1>
      </div>

      {/* Step 1 — opt-in */}
      {phase === "intro" && (
        <div className="glass-card rounded-lg border border-[#755B18]/30 p-6 sm:p-8 space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#755B18]/10 border border-[#755B18]/30 flex items-center justify-center">
            <HandCoins className="w-5 h-5 text-[#755B18]" />
          </div>
          <h2 className="text-lg font-heading font-semibold text-[#16233A]">Devenir membre du Dentalk Club</h2>
          <p className="text-xs sm:text-sm text-[#5C6672] leading-relaxed">
            {settings.intro ||
              "Rejoignez le club : votes, idées, RSVP aux ateliers, annuaire des membres et participations aux événements. Votre compte reste en observation tant que votre adhésion n'est pas finalisée."}
          </p>
          {settings.feeLabel && (
            <p className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EFECE4] border border-[#755B18]/30 text-sm font-bold text-[#16233A]">
              <BadgeCheck className="w-4 h-4 text-[#755B18]" />
              Cotisation : {settings.feeLabel}
            </p>
          )}
          <div className="flex flex-col items-center gap-2 pt-1">
            <PrimaryButton
              onClick={() => {
                setError(null);
                setPhase("form");
              }}
            >
              <PenLine className="w-4 h-4" />
              <span>Oui, je veux adhérer</span>
            </PrimaryButton>
            <p className="text-[10px] text-[#5F6774] max-w-xs leading-relaxed">
              Vous pourrez aussi parcourir librement le site public en attendant.
            </p>
          </div>
        </div>
      )}

      {/* Step 2 — profile form */}
      {phase === "form" && (
        <form onSubmit={submit} className="glass-card rounded-lg border border-[#DCD7CB]/40 p-5 sm:p-7 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-heading font-bold text-[#16233A]">Votre dossier d&apos;adhésion</h2>
            <p className="text-[11px] text-[#5C6672]">
              Ces informations permettent au bureau de valider votre adhésion.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Field label="Nom complet" htmlFor="membership-name">
              <input
                id="membership-name"
                type="text"
                required
                minLength={2}
                maxLength={120}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                placeholder="Prénom Nom"
              />
            </Field>
            <Field label="Email (fixe)" htmlFor="membership-email" hint="L'email du compte ne se modifie pas.">
              <input id="membership-email" type="email" value={profile.email} disabled className={inputClass} />
            </Field>
            <Field label="Année (promo)" htmlFor="membership-promo" hint="Année d'obtention du diplôme.">
              <select
                id="membership-promo"
                required
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                className={inputClass}
              >
                <option value="">— Choisir —</option>
                {siteSettings.promo_years.map((year) => (
                  <option key={year} value={year}>
                    Promo {year}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Téléphone" htmlFor="membership-phone" hint="Visible uniquement par le bureau.">
              <input
                id="membership-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="06 XX XX XX XX"
              />
            </Field>
          </div>
          <Field label="Bio (facultatif)" htmlFor="membership-bio" hint="Quelques mots sur vous (parcours, passions…).">
            <textarea
              id="membership-bio"
              rows={3}
              maxLength={1000}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`${inputClass} resize-y`}
            />
          </Field>
          {error && (
            <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setPhase(profile.membership_status === "pending" ? "pending" : "intro");
              }}
              className="text-[11px] font-semibold text-[#5C6672] hover:text-[#16233A] transition-colors"
            >
              ← Retour
            </button>
            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{submitting ? "Envoi…" : "Envoyer mon dossier"}</span>
            </PrimaryButton>
          </div>
        </form>
      )}

      {/* Step 3 — payment panel */}
      {phase === "pending" && (
        <div className="space-y-4">
          <div className="glass-card rounded-lg border border-emerald-600/40 bg-emerald-600/5 p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-heading font-bold text-[#16233A]">Dossier envoyé</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#3D4A58] leading-relaxed">
              {settings.pendingText ||
                "Dernière étape : réglez la cotisation. Le bureau active votre accès membre dès réception du paiement."}
            </p>
          </div>

          <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-5 sm:p-6 space-y-4">
            {settings.feeLabel && (
              <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl bg-[#EFECE4] border border-[#755B18]/30 px-4 py-3">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5C6672]">
                  <Banknote className="w-4 h-4 text-[#755B18]" />
                  Montant à payer
                </span>
                <span className="text-lg font-heading font-bold text-[#16233A]">{settings.feeLabel}</span>
              </div>
            )}

            {settings.bankEnabled && settings.bankDetails && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#755B18]">Par virement / versement bancaire</p>
                <div className="rounded-xl bg-white/70 border border-[#DCD7CB]/50 px-4 py-3">
                  {settings.bankDetails.split("\n").map((line, i) =>
                    line.trim() ? (
                      <p key={i} className="text-xs text-[#16233A] font-mono select-all break-all leading-relaxed">
                        {line}
                      </p>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {settings.inPersonEnabled && settings.inPersonText && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#755B18]">En main propre</p>
                <p className="text-xs text-[#3D4A58] leading-relaxed rounded-xl bg-white/70 border border-[#DCD7CB]/50 px-4 py-3 whitespace-pre-line">
                  {settings.inPersonText}
                </p>
              </div>
            )}

            {!settings.bankEnabled &&
              !settings.inPersonEnabled &&
              !whatsappHref &&
              !settings.feeLabel && (
                <p className="flex items-center gap-1.5 text-xs text-[#755B18] bg-[#755B18]/10 border border-[#755B18]/30 rounded-lg px-3 py-2">
                  <CircleAlert className="w-3.5 h-3.5 shrink-0" />
                  Les modalités de paiement seront publiées par le bureau très bientôt.
                </p>
              )}

            {whatsappHref && (
              <div className="space-y-2 pt-1">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-bold text-sm bg-[#25D366] text-[#0B3D2E] hover:brightness-95 transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contacter le bureau sur WhatsApp</span>
                </a>
                <p className="text-[10px] text-[#5F6774] text-center">
                  {settings.whatsappMessage
                    ? "Un message pré-rempli s'ouvre — il ne reste qu'à l'envoyer."
                    : "WhatsApp s'ouvre avec le numéro du bureau."}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <GhostButton
              onClick={() => {
                setError(null);
                setPhase("form");
              }}
              className="!py-1.5 !text-[11px]"
            >
              <PenLine className="w-3 h-3" />
              <span>Modifier mon dossier</span>
            </GhostButton>
            <button
              onClick={cancelRequest}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold text-[#5C6672] hover:text-red-600 hover:bg-red-500/10 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Retirer ma demande</span>
            </button>
          </div>
          {error && (
            <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>
      )}

      <p className="text-center text-[10px] text-[#5F6774] leading-relaxed">
        Le bureau du club vérifie chaque adhésion : votre accès membre s&apos;activera automatiquement après
        validation.
      </p>
    </div>
  );
}
