"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  { value: "2032", label: "1ère année (1A — Promo 2032)" },
  { value: "2031", label: "2ème année (2A — Promo 2031)" },
  { value: "2030", label: "3ème année (3A — Promo 2030)" },
  { value: "2029", label: "4ème année (4A — Promo 2029)" },
  { value: "2028", label: "5ème année (5A — Promo 2028)" },
  { value: "2027", label: "6ème année (6A — Promo 2027)" },
  { value: "2026", label: "Promo 2026 (Diplômé / Interne / Résident)" },
  { value: "2025", label: "Promo 2025 ou antérieure" },
];

export default function InvitationClient({
  token,
  status,
  membershipSettings,
  siteSettings,
}: InvitationClientProps) {
  const { user, profile, openAuth, refreshProfile } = useAuth();

  // Settings with sensible fallbacks
  const settings: MembershipSettings = membershipSettings ?? {
    enabled: true,
    intro: "Rejoignez le Dentalk Club FMDC : débats, ateliers, prise de parole et événements.",
    feeLabel: "100 DH / an",
    bankEnabled: true,
    bankDetails: "RIB : 007780000738230040239346\nTitulaire : FAKHOUT HOUSSAM\nBanque : Attijariwafa Bank",
    bankDetails2: "RIB : 230 780 6065299211021800 68\nTitulaire : NEAMA LABZAI\nBanque : CIH Bank (Casa Mly Abdellah)\nIBAN : MA64 2307 8060 6529 9211 0218 0068",
    inPersonEnabled: true,
    inPersonText: "Rapprochez-vous directement de Neama Labzai (trésorière) ou d'un membre du bureau présent devant vous au stand pour régler votre cotisation.",
    whatsappNumber: "212635321003",
    whatsappMessage: "Bonjour, je viens de créer mon compte au DENTALK CLUB (DTC). Je souhaite régler ma cotisation pour confirmer mon adhésion. Merci !",
    pendingText: "Votre inscription est bien enregistrée. Réglez votre adhésion auprès du bureau pour activer immédiatement votre accès.",
  };

  // State
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [studyYear, setStudyYear] = useState<string>(
    profile?.promo ? String(profile.promo) : "2032"
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

  const whatsappHref =
    settings.whatsappNumber.length >= 8
      ? `https://wa.me/${settings.whatsappNumber}${
          settings.whatsappMessage
            ? `?text=${encodeURIComponent(settings.whatsappMessage)}`
            : ""
        }`
      : null;

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

      // If user session is not returned directly, sign in with known credentials
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
        // Fallback: direct update if RPC guards role mismatch
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
    <div className="pt-8 sm:pt-14 pb-16 px-4 max-w-lg mx-auto">
      <div className="glass-card rounded-2xl border border-dtc-line/40 p-5 sm:p-7 space-y-5 shadow-lg">
        {children}
      </div>
    </div>
  );

  // Link status check
  if (status === "invalid" || status === "used" || status === "expired") {
    return wrap(
      <>
        <div className="flex justify-center">
          <div className="p-3 rounded-xl bg-red-500/15 text-red-700">
            <MailX className="w-6 h-6" />
          </div>
        </div>
        <h1 className="text-xl font-heading font-semibold text-dtc-ink text-center">
          Lien indisponible
        </h1>
        <p className="text-xs sm:text-sm text-dtc-inkMuted leading-relaxed text-center">
          {status === "used" &&
            "Ce lien d'invitation a déjà été utilisé. Demandez un nouveau lien au bureau du club."}
          {status === "expired" &&
            "Ce lien a expiré. Demandez un nouveau lien ou scannez le QR code au stand."}
          {status === "invalid" &&
            "Ce lien d'invitation n'est pas valide. Vérifiez l'adresse ou scannez le QR code au stand."}
        </p>
        <div className="pt-2 text-center">
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
          <div className="p-3.5 rounded-2xl bg-emerald-600/15 text-emerald-700">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>
        <div className="text-center space-y-1.5">
          <h1 className="text-xl font-heading font-bold text-dtc-ink">
            Accès Membre Déjà Actif ✓
          </h1>
          <p className="text-xs sm:text-sm text-dtc-inkMuted leading-relaxed">
            Bonjour <strong>{profile.full_name || user.email}</strong> ! Votre compte dispose déjà de l&apos;accès membre complet au Dentalk Club.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Link
            href="/espace"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-dtc-gold text-dtc-paper hover:brightness-110 transition-all shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span>Mon Espace Membre</span>
          </Link>
          <Link
            href="/game"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs border border-dtc-gold/40 text-dtc-gold hover:bg-dtc-gold/10 transition-all"
          >
            <Sparkles className="w-4 h-4" />
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
    const feeAmount = returningInfo?.is_returning ? "80 DH" : "100 DH";
    return wrap(
      <>
        {/* Brand header */}
        <div className="flex items-center justify-between pb-3 border-b border-dtc-line/30">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-dtc-line shrink-0">
              <Image
                src="/logo.png?v=2026d"
                alt="DTC"
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <div className="leading-tight">
              <span className="font-heading font-bold text-sm text-dtc-ink">
                Dentalk <span className="text-dtc-gold">Club</span>
              </span>
              <span className="block text-[10px] text-dtc-inkMuted tracking-wider uppercase">
                FMDC Casablanca
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-dtc-gold bg-dtc-gold/10 border border-dtc-gold/25 px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            <span>Étape 2 / 2</span>
          </span>
        </div>

        {/* Confirmation status notice */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
            <span>Inscription enregistrée · Validation en cours</span>
          </div>
          <p className="text-[11px] text-amber-950/80 leading-relaxed">
            Pendant que le bureau confirme votre compte, voici comment régler votre adhésion :
          </p>
        </div>

        {/* Amount to pay */}
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-dtc-wash border border-dtc-gold/30">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-dtc-inkMuted">
            <Banknote className="w-4 h-4 text-dtc-gold" />
            Montant de la cotisation
          </span>
          <div className="text-right">
            {returningInfo?.is_returning ? (
              <div className="flex items-center gap-2">
                <span className="line-through text-xs text-dtc-inkMuted">100 DH</span>
                <span className="text-base font-heading font-bold text-emerald-800">80 DH</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-800 border border-emerald-600/30">
                  Tarif Ancien Membre
                </span>
              </div>
            ) : (
              <span className="text-base font-heading font-bold text-dtc-ink">
                {settings.feeLabel || "100 DH / an"}
              </span>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          {/* Method 1: At Stand / In Person */}
          {settings.inPersonEnabled && settings.inPersonText && (
            <div className="rounded-xl bg-white/80 border border-dtc-line/60 p-3.5 space-y-1.5 shadow-sm">
              <p className="text-[11px] font-bold text-dtc-gold uppercase tracking-wider">
                1. Au stand (en main propre)
              </p>
              <p className="text-xs text-dtc-lineDark leading-relaxed">
                {settings.inPersonText}
              </p>
            </div>
          )}

          {/* Method 2: Bank transfer */}
          {settings.bankEnabled && (settings.bankDetails || settings.bankDetails2) && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-dtc-gold uppercase tracking-wider">
                2. Par virement ou versement bancaire
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {settings.bankDetails && (
                  <div className="rounded-xl bg-white/90 border border-dtc-line/70 p-3 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between gap-1 border-b border-dtc-line/30 pb-1.5">
                      <span className="text-[11px] font-bold text-dtc-ink">
                        Attijariwafa Bank
                      </span>
                      <GhostButton
                        onClick={() => copyDetails(settings.bankDetails, 1)}
                        className="!py-0.5 !px-2 !text-[10px]"
                      >
                        {copiedAccount === 1 ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedAccount === 1 ? "Copié !" : "Copier"}</span>
                      </GhostButton>
                    </div>
                    <div className="font-mono text-[11px] text-dtc-ink select-all break-all leading-relaxed">
                      {settings.bankDetails.split("\n").map((line, i) =>
                        line.trim() ? <p key={i}>{line}</p> : null
                      )}
                    </div>
                  </div>
                )}

                {settings.bankDetails2 && (
                  <div className="rounded-xl bg-white/90 border border-dtc-line/70 p-3 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between gap-1 border-b border-dtc-line/30 pb-1.5">
                      <span className="text-[11px] font-bold text-dtc-ink">
                        CIH Bank
                      </span>
                      <GhostButton
                        onClick={() => copyDetails(settings.bankDetails2, 2)}
                        className="!py-0.5 !px-2 !text-[10px]"
                      >
                        {copiedAccount === 2 ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedAccount === 2 ? "Copié !" : "Copier"}</span>
                      </GhostButton>
                    </div>
                    <div className="font-mono text-[11px] text-dtc-ink select-all break-all leading-relaxed">
                      {settings.bankDetails2.split("\n").map((line, i) =>
                        line.trim() ? <p key={i}>{line}</p> : null
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp Button */}
        {whatsappHref && (
          <div className="space-y-1.5 pt-1">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#25D366] text-[#0B3D2E] hover:brightness-95 transition-all active:scale-[0.98] shadow-sm"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>Envoyer le reçu sur WhatsApp au bureau</span>
            </a>
            <p className="text-[10px] text-dtc-inkSoft text-center">
              Un message pré-rempli s&apos;ouvre pour confirmer votre paiement auprès du bureau.
            </p>
          </div>
        )}

        {/* Mini-Game CTA at the very end (clean, progressive, separate) */}
        <div className="pt-3 border-t border-dtc-line/40 space-y-2.5 text-center">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-dtc-ink">
              Tu es devant le stand du DTC ? 🎲
            </p>
            <p className="text-[11px] text-dtc-inkMuted leading-relaxed">
              Tire une question aléatoire et viens discuter avec les membres du bureau !
            </p>
          </div>

          <Link
            href="/game"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-heading font-bold text-sm bg-gradient-to-r from-dtc-gold to-dtc-goldDark text-white shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Let&apos;s play a game 🎮</span>
          </Link>

          <div>
            <Link
              href="/"
              className="text-[11px] font-medium text-dtc-inkMuted hover:text-dtc-ink transition-colors"
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
      <div className="text-center space-y-2">
        <div className="relative w-12 h-12 mx-auto rounded-full overflow-hidden border-2 border-dtc-gold/40 shadow-sm">
          <Image
            src="/logo.png?v=2026d"
            alt="Logo DTC"
            fill
            sizes="48px"
            className="object-cover"
            priority
          />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-dtc-gold/15 text-dtc-goldDark text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Rentrée 2026–2027 · Stand DTC</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-dtc-ink tracking-tight">
            Rejoindre le Dentalk Club
          </h1>
          <p className="text-xs text-dtc-inkMuted leading-relaxed max-w-sm mx-auto">
            Remplis tes coordonnées pour créer ton compte et lancer ton adhésion.
          </p>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-3.5 pt-1">
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
          hint="Visible uniquement par le bureau pour la coordination."
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
          <div className="flex items-start gap-2 p-2.5 rounded-xl border border-dtc-gold/40 bg-dtc-gold/10 text-dtc-ink animate-fadeIn">
            <Sparkles className="w-4 h-4 text-dtc-gold shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug">
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
            className="text-xs text-center text-red-700 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"
          >
            {error}
          </p>
        )}

        <PrimaryButton type="submit" disabled={busy} className="w-full !py-2.5 font-bold text-xs sm:text-sm">
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Confirmer mon inscription</span>
              <CheckCircle2 className="w-4 h-4 ml-1" />
            </>
          )}
        </PrimaryButton>
      </form>

      {/* Already registered switch */}
      <div className="text-center pt-1 border-t border-dtc-line/30">
        <GhostButton
          type="button"
          onClick={() => openAuth("signin")}
          className="!text-[11px] text-dtc-inkMuted hover:text-dtc-ink"
        >
          <LogIn className="w-3 h-3" />
          <span>J&apos;ai déjà un compte — me connecter</span>
        </GhostButton>
      </div>
    </>
  );
}
