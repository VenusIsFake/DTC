"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Banknote,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  LogIn,
  MailX,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field, PrimaryButton, GhostButton, inputClass } from "@/components/ui/form";
import type { MembershipSettings, ReturningMemberCheck, SiteSettings } from "@/lib/types";

interface InvitationClientProps {
  token: string;
  status: string;
  membershipSettings?: MembershipSettings;
  siteSettings?: SiteSettings;
}

const STUDY_YEAR_OPTIONS = [
  { value: "2026", label: "1ère année (1A — Promo 2026)" },
  { value: "2025", label: "2ème année (2A — Promo 2025)" },
  { value: "2024", label: "3ème année (3A — Promo 2024)" },
  { value: "2023", label: "4ème année (4A — Promo 2023)" },
  { value: "2022", label: "5ème année (5A — Promo 2022)" },
  { value: "2021", label: "6ème année (6A — Promo 2021)" },
  { value: "2020", label: "Promo 2020 ou antérieure" },
];

export default function InvitationClient({
  token,
  status,
  membershipSettings,
  siteSettings,
}: InvitationClientProps) {
  const { user, profile, openAuth, refreshProfile } = useAuth();

  // Guaranteed non-empty values for bank & contacts
  const bank1 =
    membershipSettings?.bankDetails?.trim() ||
    "RIB : 007780000738230040239346\nTitulaire : FAKHOUT HOUSSAM\nBanque : Attijariwafa Bank";
  const bank2 =
    membershipSettings?.bankDetails2?.trim() ||
    "RIB : 230 780 6065299211021800 68\nTitulaire : NEAMA LABZAI\nBanque : CIH Bank (Casa Mly Abdellah)\nIBAN : MA64 2307 8060 6529 9211 0218 0068";
  const inPersonText =
    membershipSettings?.inPersonText?.trim() ||
    "Rapprochez-vous directement de Neama Labzai (trésorière) ou d'un membre du bureau présent devant vous au stand pour régler votre cotisation.";
  const feeLabel = membershipSettings?.feeLabel?.trim() || "100 DH / an";
  const rawWhatsApp = membershipSettings?.whatsappNumber?.replace(/[^0-9]/g, "") || "212635321003";
  const whatsappMsg =
    membershipSettings?.whatsappMessage?.trim() ||
    "Bonjour, je viens de créer mon compte au DENTALK CLUB (DTC). Je souhaite régler ma cotisation pour confirmer mon adhésion. Merci !";
  const whatsappHref = `https://wa.me/${rawWhatsApp}?text=${encodeURIComponent(whatsappMsg)}`;

  // State
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [studyYear, setStudyYear] = useState<string>(
    profile?.promo ? String(profile.promo) : "2026"
  );
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [returningInfo, setReturningInfo] = useState<ReturningMemberCheck | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<number | null>(null);

  // Phase: "form" (step 1) -> "adhesion" (step 2)
  const [phase, setPhase] = useState<"form" | "adhesion">(() => {
    if (user && profile?.membership_status === "pending") return "adhesion";
    return "form";
  });

  // Switch to adhesion if user is already pending
  useEffect(() => {
    if (user && profile?.membership_status === "pending") {
      setPhase("adhesion");
      if (profile.full_name && !fullName) setFullName(profile.full_name);
      if (profile.phone && !phone) setPhone(profile.phone);
    }
  }, [user, profile, fullName, phone]);

  // Real-time returning member check on phone input
  useEffect(() => {
    const clean = (phone || "").replace(/[^0-9]/g, "");
    if (clean.length < 8) {
      setReturningInfo(null);
      return;
    }
    let active = true;
    const checkPhone = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      const { data } = await supabase.rpc("check_returning_member", { p_phone: phone });
      if (active && data) {
        setReturningInfo(data as ReturningMemberCheck);
      }
    };
    const timer = setTimeout(checkPhone, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [phone]);

  const copyDetails = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAccount(index);
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  // Step 1: Submit Form -> Create Account -> Transition to Step 2
  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (fullName.trim().length < 2) {
      setError("Merci d'indiquer votre nom et prénom.");
      return;
    }
    if (email.trim().length < 5 || !email.includes("@")) {
      setError("Merci d'indiquer une adresse email valide.");
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    if (cleanPhone.length < 8) {
      setError("Merci d'indiquer un numéro de téléphone valide.");
      return;
    }
    if (!studyYear) {
      setError("Merci de sélectionner votre année d'étude.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Base de données indisponible.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      // 1. Sign up user (email verification is disabled in Supabase)
      const { data: signUpData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            promo: Number(studyYear),
          },
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("already registered")) {
          throw new Error("Cette adresse email est déjà utilisée. Connectez-vous ci-dessous.");
        }
        throw authError;
      }

      // If session is null, sign in with known credentials
      if (!signUpData.session) {
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
      }

      // 2. Submit membership request to write full_name, phone, promo & pending status
      const { error: rpcErr } = await supabase.rpc("submit_membership_request", {
        p_full_name: fullName.trim(),
        p_promo: Number(studyYear),
        p_phone: phone.trim(),
        p_bio: "",
      });

      if (rpcErr) {
        await supabase
          .from("profiles")
          .update({
            full_name: fullName.trim(),
            promo: Number(studyYear),
            phone: phone.trim(),
            membership_status: "pending",
          })
          .eq("id", signUpData.user?.id);
      }

      // 3. Register stand QR scan
      if (token) {
        await supabase.rpc("register_stand_scan", { p_token: token });
      }

      await refreshProfile();

      // Transition smoothly to Step 2 (Adhesion)
      setPhase("adhesion");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'inscription.");
    } finally {
      setBusy(false);
    }
  };

  const wrap = (children: React.ReactNode) => (
    <div className="pt-4 sm:pt-6 pb-12 px-3 sm:px-4 max-w-md mx-auto">
      <div className="glass-card rounded-2xl border border-dtc-line/40 p-4 sm:p-5 space-y-3 shadow-md">
        {children}
      </div>
    </div>
  );

  // Link status check
  if (status === "invalid" || status === "used" || status === "expired") {
    return wrap(
      <>
        <div className="flex justify-center">
          <div className="p-2.5 rounded-xl bg-red-500/15 text-red-700">
            <MailX className="w-5 h-5" />
          </div>
        </div>
        <h1 className="text-lg font-heading font-semibold text-dtc-ink text-center">
          Lien indisponible
        </h1>
        <p className="text-xs text-dtc-inkMuted leading-relaxed text-center">
          {status === "used" &&
            "Ce lien d'invitation a déjà été utilisé. Demandez un nouveau lien au bureau du club."}
          {status === "expired" &&
            "Ce lien a expiré. Demandez un nouveau lien ou scannez le QR code au stand."}
          {status === "invalid" &&
            "Ce lien d'invitation n'est pas valide. Vérifiez l'adresse ou scannez le QR code au stand."}
        </p>
        <div className="pt-1 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-dtc-gold hover:underline underline-offset-2"
          >
            Retourner au site public →
          </Link>
        </div>
      </>
    );
  }

  // Already an active member/bureau/admin
  if (user && (profile?.role === "member" || profile?.role === "bureau" || profile?.role === "admin")) {
    return wrap(
      <>
        <div className="flex justify-center">
          <div className="p-3 rounded-2xl bg-emerald-600/15 text-emerald-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-lg font-heading font-bold text-dtc-ink">
            Accès Membre Déjà Actif ✓
          </h1>
          <p className="text-xs text-dtc-inkMuted leading-relaxed">
            Bonjour <strong>{profile.full_name || user.email}</strong> ! Votre compte dispose déjà de l&apos;accès membre complet au Dentalk Club.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Link
            href="/espace"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs bg-dtc-gold text-dtc-paper hover:brightness-110 transition-all shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Mon Espace Membre</span>
          </Link>
          <Link
            href="/game"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs border border-dtc-gold/40 text-dtc-gold hover:bg-dtc-gold/10 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mini-Jeu du Stand 🎲</span>
          </Link>
        </div>
      </>
    );
  }

  // --------------------------------------------------------------------------
  // STEP 2: L'ADHÉSION & RÈGLEMENT (Payment instructions + contacts)
  // --------------------------------------------------------------------------
  if (phase === "adhesion") {
    return wrap(
      <>
        {/* Brand header */}
        <div className="flex items-center justify-between pb-2 border-b border-dtc-line/30">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-dtc-line shrink-0">
              <Image
                src="/logo.png?v=2026d"
                alt="DTC"
                fill
                sizes="24px"
                className="object-cover"
              />
            </div>
            <div className="leading-tight">
              <span className="font-heading font-bold text-xs text-dtc-ink">
                Dentalk <span className="text-dtc-gold">Club</span>
              </span>
              <span className="block text-[8px] text-dtc-inkMuted tracking-wider uppercase">
                FMDC Casablanca
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-dtc-gold bg-dtc-gold/10 border border-dtc-gold/25 px-2 py-0.5 rounded-full">
            <Clock className="w-2.5 h-2.5" />
            <span>Étape 2 / 2</span>
          </span>
        </div>

        {/* Confirmation status notice */}
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-0.5 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse shrink-0" />
            <span>Inscription enregistrée · Validation en cours</span>
          </div>
          <p className="text-[11px] text-amber-950/80 leading-relaxed">
            Pendant que le bureau confirme votre compte, voici comment régler votre adhésion :
          </p>
        </div>

        {/* Amount to pay */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-dtc-wash border border-dtc-gold/30">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-dtc-inkMuted whitespace-nowrap">
            <Banknote className="w-4 h-4 text-dtc-gold shrink-0" />
            Cotisation
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {returningInfo?.is_returning ? (
              <>
                <span className="line-through text-xs text-dtc-inkMuted whitespace-nowrap">100 DH</span>
                <span className="text-sm sm:text-base font-heading font-bold text-emerald-800 whitespace-nowrap">80 DH</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600/20 text-emerald-800 border border-emerald-600/30 whitespace-nowrap">
                  Ancien Membre
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-heading font-bold text-dtc-ink whitespace-nowrap">
                {feeLabel}
              </span>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2">
          {/* Method 1: At Stand / In Person */}
          <div className="rounded-xl bg-white/85 border border-dtc-line/60 p-2.5 space-y-1 shadow-xs">
            <p className="text-[10px] font-bold text-dtc-gold uppercase tracking-wider">
              1. Au stand (en main propre)
            </p>
            <p className="text-[11px] text-dtc-lineDark leading-relaxed">
              {inPersonText}
            </p>
          </div>

          {/* Method 2: Bank transfer (RIBs) */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-dtc-gold uppercase tracking-wider">
              2. Par virement bancaire (RIBs au choix)
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {/* Bank 1: Attijariwafa */}
              <div className="rounded-xl bg-white/95 border border-dtc-line/70 p-2.5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between gap-1 border-b border-dtc-line/30 pb-1">
                  <span className="text-[11px] font-bold text-dtc-ink">
                    Attijariwafa Bank
                  </span>
                  <GhostButton
                    onClick={() => copyDetails(bank1, 1)}
                    className="!py-0.5 !px-2 !text-[10px] !h-6"
                  >
                    {copiedAccount === 1 ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedAccount === 1 ? "Copié !" : "Copier"}</span>
                  </GhostButton>
                </div>
                <div className="font-mono text-[10px] sm:text-[11px] text-dtc-ink select-all break-all leading-snug">
                  {bank1.split("\n").map((line, i) =>
                    line.trim() ? <p key={i}>{line}</p> : null
                  )}
                </div>
              </div>

              {/* Bank 2: CIH Bank */}
              <div className="rounded-xl bg-white/95 border border-dtc-line/70 p-2.5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between gap-1 border-b border-dtc-line/30 pb-1">
                  <span className="text-[11px] font-bold text-dtc-ink">
                    CIH Bank
                  </span>
                  <GhostButton
                    onClick={() => copyDetails(bank2, 2)}
                    className="!py-0.5 !px-2 !text-[10px] !h-6"
                  >
                    {copiedAccount === 2 ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedAccount === 2 ? "Copié !" : "Copier"}</span>
                  </GhostButton>
                </div>
                <div className="font-mono text-[10px] sm:text-[11px] text-dtc-ink select-all break-all leading-snug">
                  {bank2.split("\n").map((line, i) =>
                    line.trim() ? <p key={i}>{line}</p> : null
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bureau contact & WhatsApp */}
        <div className="space-y-1.5 pt-0.5">
          <p className="text-[10px] font-bold text-dtc-gold uppercase tracking-wider">
            3. Envoyer un message au bureau
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs bg-[#25D366] text-[#0B3D2E] hover:brightness-95 transition-all active:scale-[0.98] shadow-xs"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>Contacter le bureau sur WhatsApp (+212 635-321003)</span>
          </a>
          <p className="text-[9px] text-dtc-inkSoft text-center">
            Trésorière : Neama Labzai · Message pré-rempli pour envoyer votre reçu.
          </p>
        </div>

        {/* Mini-Game CTA at the very end */}
        <div className="pt-2 border-t border-dtc-line/40 space-y-1.5 text-center">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-dtc-ink">
              Tu es devant le stand du DTC ? 🎲
            </p>
            <p className="text-[10px] text-dtc-inkMuted leading-tight">
              Tire une question et viens discuter avec les membres du bureau !
            </p>
          </div>

          <Link
            href="/game"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm bg-gradient-to-r from-dtc-gold to-dtc-goldDark text-white shadow-xs hover:brightness-105 active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Let&apos;s play a game 🎮</span>
          </Link>

          <div>
            <Link
              href="/"
              className="text-[10px] font-medium text-dtc-inkMuted hover:text-dtc-ink transition-colors"
            >
              Aller au site public →
            </Link>
          </div>
        </div>
      </>
    );
  }

  // --------------------------------------------------------------------------
  // STEP 1: REGISTRATION FORM (Name, Email, Phone, Study Year, Password)
  // --------------------------------------------------------------------------
  return wrap(
    <>
      {/* Brand Header */}
      <div className="text-center space-y-1">
        <div className="relative w-9 h-9 mx-auto rounded-full overflow-hidden border-2 border-dtc-gold/40 shadow-xs">
          <Image
            src="/logo.png?v=2026d"
            alt="Logo DTC"
            fill
            sizes="36px"
            className="object-cover"
            priority
          />
        </div>
        <div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dtc-gold/15 text-dtc-goldDark text-[9px] font-bold uppercase tracking-wider mb-0.5">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Rentrée 2026–2027 · Stand DTC</span>
          </div>
          <h1 className="text-base sm:text-lg font-heading font-bold text-dtc-ink tracking-tight">
            Rejoindre le Dentalk Club
          </h1>
          <p className="text-[11px] text-dtc-inkMuted leading-relaxed max-w-xs mx-auto">
            Remplis tes coordonnées pour créer ton compte et lancer ton adhésion.
          </p>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-2.5 pt-0.5">
        {/* Full Name */}
        <Field label="Nom complet" htmlFor="inv-name">
          <input
            id="inv-name"
            type="text"
            required
            minLength={2}
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="ex : Sarah Benali"
            autoComplete="name"
          />
        </Field>

        {/* Email */}
        <Field label="Adresse email" htmlFor="inv-email">
          <input
            id="inv-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="ex : sarah.benali@gmail.com"
            autoComplete="email"
          />
        </Field>

        {/* Phone & Returning Member Detection */}
        <Field
          label="Numéro de téléphone"
          htmlFor="inv-phone"
          hint="Visible uniquement par le bureau."
        >
          <input
            id="inv-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="ex : 06 12 34 56 78"
            autoComplete="tel"
          />
        </Field>

        {/* Whitelist discount badge */}
        {returningInfo?.is_returning && (
          <div className="flex items-start gap-2 p-2 rounded-xl border border-dtc-gold/40 bg-dtc-gold/10 text-dtc-ink animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-dtc-gold shrink-0 mt-0.5" />
            <div className="text-[10px] leading-snug">
              <p className="font-bold text-dtc-gold">✨ Ancien membre reconnu !</p>
              <p className="text-dtc-inkMuted">
                Tu bénéficies du tarif fidélité réduit de <strong>80 DH</strong> (au lieu de 100 DH).
              </p>
            </div>
          </div>
        )}

        {/* Study Year */}
        <Field
          label="Année d'étude (Faculté dentaire)"
          htmlFor="inv-year"
          hint="Ton année actuelle à la FMDC."
        >
          <select
            id="inv-year"
            required
            value={studyYear}
            onChange={(e) => setStudyYear(e.target.value)}
            className={inputClass}
          >
            {STUDY_YEAR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Password */}
        <Field
          label="Mot de passe"
          htmlFor="inv-password"
          hint="8 caractères minimum."
        >
          <input
            id="inv-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>

        {error && (
          <p
            role="alert"
            className="text-xs text-center text-red-700 bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-1"
          >
            {error}
          </p>
        )}

        <PrimaryButton type="submit" disabled={busy} className="w-full !py-2 font-bold text-xs">
          {busy ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span>Confirmer mon inscription</span>
              <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
            </>
          )}
        </PrimaryButton>
      </form>

      {/* Already registered switch */}
      <div className="text-center pt-0.5 border-t border-dtc-line/30">
        <GhostButton
          type="button"
          onClick={() => openAuth("signin")}
          className="!text-[10px] text-dtc-inkMuted hover:text-dtc-ink !h-6"
        >
          <LogIn className="w-3 h-3" />
          <span>J&apos;ai déjà un compte — me connecter</span>
        </GhostButton>
      </div>
    </>
  );
}
