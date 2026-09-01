"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { STUDY_YEARS, type StudyYear } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field, PrimaryButton, inputClass } from "@/components/ui/form";

interface PositionOption {
  id: string;
  title: string;
}

/**
 * Public application form for the open recruitment campaign. Mirrors the
 * Google Form it replaces (name, year, phone, prior responsibility,
 * motivation, "why you"); logged-in members get name/phone prefilled and
 * their profile linked automatically by the DB default on applications.
 */
export default function CandidatureForm({
  recruitmentId,
  positions,
  defaultName,
  defaultPhone,
}: {
  recruitmentId: string;
  positions: PositionOption[];
  defaultName: string;
  defaultPhone: string;
}) {
  const [positionId, setPositionId] = useState(positions[0]?.id ?? "");
  const [fullName, setFullName] = useState(defaultName);
  const [studyYear, setStudyYear] = useState<StudyYear | "">("");
  const [phone, setPhone] = useState(defaultPhone);
  const [hadResponsibility, setHadResponsibility] = useState<"yes" | "no" | "">("");
  const [motivation, setMotivation] = useState("");
  const [whyYou, setWhyYou] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!positionId) {
      setError("Choisissez le poste visé.");
      return;
    }
    if (fullName.trim().length < 3) {
      setError("Indiquez votre nom et prénom complets.");
      return;
    }
    if (!studyYear) {
      setError("Sélectionnez votre année d'étude.");
      return;
    }
    const digits = phone.replace(/[^\d+]/g, "");
    if (digits.length < 6) {
      setError("Indiquez un numéro de téléphone valide pour que le bureau puisse vous joindre.");
      return;
    }
    if (!hadResponsibility) {
      setError("Précisez si vous avez déjà occupé un poste de responsabilité.");
      return;
    }
    if (motivation.trim().length < 20) {
      setError("Votre motivation et vision méritent une réponse longue et sérieuse (20 caractères minimum).");
      return;
    }
    if (whyYou.trim().length < 20) {
      setError("« Pourquoi vous et pas quelqu'un d'autre ? » — développez votre réponse (20 caractères minimum).");
      return;
    }

    // Honeypot filled → bot: pretend success without writing anything.
    if (honeypot.trim() !== "") {
      setDone(true);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Le formulaire est momentanément indisponible. Réessayez dans un instant.");
      return;
    }
    setSaving(true);
    try {
      const { error: dbError } = await supabase.from("applications").insert({
        recruitment_id: recruitmentId,
        position_id: positionId,
        full_name: fullName.trim(),
        study_year: studyYear,
        phone: phone.trim(),
        had_responsibility: hadResponsibility === "yes",
        motivation: motivation.trim(),
        why_you: whyYou.trim(),
      });
      if (dbError) throw dbError;
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? `Échec de l'envoi : ${err.message}`
          : "Échec de l'envoi. Vérifiez votre connexion et réessayez."
      );
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="glass-card rounded-xl border border-[#755B18]/30 p-8 sm:p-10 text-center space-y-3.5">
        <div className="inline-flex p-3 rounded-full bg-emerald-500/15 text-emerald-600">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h2 className="text-lg sm:text-xl font-heading font-bold text-[#16233A]">
          Candidature envoyée
        </h2>
        <p className="text-xs sm:text-sm text-[#5C6672] leading-relaxed max-w-md mx-auto">
          Merci {fullName.trim().split(" ")[0]} ! Le bureau a bien reçu votre candidature et
          reviendra vers vous par téléphone. Bonne chance !
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card rounded-xl border border-[#DCD7CB]/50 p-4 sm:p-7 space-y-4 shadow-sm"
      noValidate
    >
      <h2 className="text-base sm:text-lg font-heading font-bold text-[#16233A]">
        Formulaire de candidature
      </h2>
      <p className="text-[11px] text-[#5C6672]">
        Tous les champs sont requis. Réponses sérieuses attendues — le bureau lit chaque candidature.
      </p>

      {positions.length > 1 && (
        <Field label="Poste visé" htmlFor="cand-position">
          <select
            id="cand-position"
            value={positionId}
            onChange={(e) => setPositionId(e.target.value)}
            className={inputClass}
          >
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </Field>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nom et prénom" htmlFor="cand-name">
          <input
            id="cand-name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="ex : Aya Jei"
            autoComplete="name"
          />
        </Field>
        <Field label="Année d'étude" htmlFor="cand-year">
          <select
            id="cand-year"
            required
            value={studyYear}
            onChange={(e) => setStudyYear(e.target.value as StudyYear)}
            className={inputClass}
          >
            <option value="" disabled>
              Sélectionnez…
            </option>
            {STUDY_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Numéro de téléphone" htmlFor="cand-phone" hint="Le bureau vous contacte à ce numéro.">
        <input
          id="cand-phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          placeholder="06 XX XX XX XX"
          autoComplete="tel"
        />
      </Field>

      <fieldset className="space-y-1.5">
        <legend className="text-[11px] font-semibold text-[#3D4A58]">
          Avez-vous déjà occupé un poste de responsabilité dans une association ou un club ?
        </legend>
        <div className="flex gap-2">
          {(
            [
              { value: "yes", label: "Oui" },
              { value: "no", label: "Non" },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer text-sm font-semibold transition-colors ${
                hadResponsibility === option.value
                  ? "border-[#755B18]/60 bg-[#755B18]/10 text-[#755B18]"
                  : "border-[#DCD7CB]/60 bg-white text-[#3D4A58] hover:border-[#755B18]/40"
              }`}
            >
              <input
                type="radio"
                name="had-responsibility"
                value={option.value}
                checked={hadResponsibility === option.value}
                onChange={() => setHadResponsibility(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label="Votre motivation et vision pour le club ?"
        htmlFor="cand-motivation"
        hint="Réponse longue et sérieuse attendue."
      >
        <textarea
          id="cand-motivation"
          rows={5}
          required
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          className={`${inputClass} resize-y`}
          placeholder="Ce qui vous motive, ce que vous voulez apporter au club, vos idées…"
        />
      </Field>

      <Field label="Pourquoi vous et pas quelqu'un d'autre ?" htmlFor="cand-why">
        <textarea
          id="cand-why"
          rows={4}
          required
          value={whyYou}
          onChange={(e) => setWhyYou(e.target.value)}
          className={`${inputClass} resize-y`}
          placeholder="Votre atout distinctif pour le poste…"
        />
      </Field>

      {/* Honeypot: invisible to humans, irresistible to bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="cand-company">Entreprise</label>
        <input
          id="cand-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"
        >
          {error}
        </p>
      )}

      <div className="pt-1">
        <PrimaryButton type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {saving ? "Envoi en cours…" : "Envoyer ma candidature"}
        </PrimaryButton>
      </div>
    </form>
  );
}
