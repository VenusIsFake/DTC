"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  LogIn,
  Mail,
  MailX,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field, PrimaryButton, GhostButton, inputClass } from "@/components/ui/form";
import StandIcebreakerGame from "@/components/game/StandIcebreakerGame";

const ROLE_LABELS: Record<string, string> = {
  member: "Membre",
  bureau: "Membre du bureau",
  admin: "Administrateur",
};

type Phase = "redeemable" | "awaiting_verification" | "done";

/**
 * One-time invitation redemption and QR signup flow.
 * Supports immediate signup or reactive polling when email confirmation is required,
 * ensuring members are not blocked at the stand.
 */
export default function InvitationClient({
  token,
  status,
}: {
  token: string;
  status: string;
}) {
  const { user, profile, openAuth, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("redeemable");
  const [result, setResult] = useState<string>(""); // granted role or "already"
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const okRole = status.startsWith("ok:") ? status.slice(3) : null;

  const redeem = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc("redeem_invite_link", {
        p_token: token,
      });
      if (rpcError) throw rpcError;
      setResult(typeof data === "string" ? data : "");
      setPhase("done");
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'activation du lien.");
    } finally {
      setBusy(false);
    }
  }, [token, refreshProfile]);

  // If user session becomes available while awaiting verification, auto-redeem
  useEffect(() => {
    if (user && phase === "awaiting_verification") {
      redeem();
    }
  }, [user, phase, redeem]);

  // Reactive poller: checks if email gets verified in the background
  useEffect(() => {
    if (phase !== "awaiting_verification") return;

    let active = true;
    let timerId: NodeJS.Timeout;

    const checkVerification = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase || !email || !password) return;

      // 1. Check existing session (e.g. redirected or authenticated in another tab)
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        if (!active) return;
        await redeem();
        return;
      }

      // 2. Try logging in with the known credentials
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (!signInErr && signInData?.session?.user) {
        if (!active) return;
        await redeem();
      }
    };

    // Poll every 3.5 seconds
    timerId = setInterval(checkVerification, 3500);

    // Also subscribe to auth state changes
    const supabase = getSupabaseBrowserClient();
    const { data: authSub } = supabase?.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && active) {
        await redeem();
      }
    }) ?? { data: null };

    return () => {
      active = false;
      clearInterval(timerId);
      authSub?.subscription.unsubscribe();
    };
  }, [phase, email, password, redeem]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const signupAndRedeem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (fullName.trim().length < 2) {
      setError("Merci d'indiquer votre nom complet.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    try {
      const redirectUrl = typeof window !== "undefined" ? window.location.href : undefined;
      const { data: signUpData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: redirectUrl,
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("already registered")) {
          throw new Error("Cette adresse email est déjà utilisée. Connectez-vous ci-dessous.");
        }
        throw authError;
      }

      // If email confirmation is enabled on Supabase, session will be null.
      // Transition to awaiting_verification without blocking the user!
      if (!signUpData.session) {
        setPhase("awaiting_verification");
        return;
      }

      // If session exists immediately, redeem right away
      await redeem();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'inscription.");
    } finally {
      setBusy(false);
    }
  };

  const checkNowManually = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        await redeem();
        return;
      }

      if (email && password) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInErr) {
          if (
            signInErr.message.toLowerCase().includes("confirm") ||
            signInErr.message.toLowerCase().includes("verified")
          ) {
            setError("Email pas encore validé. Clique sur le lien reçu dans ta boîte de réception (vérifie aussi les spams) !");
          } else {
            setError(signInErr.message);
          }
          return;
        }

        if (signInData?.session?.user) {
          await redeem();
          return;
        }
      }
      setError("Vérification en attente. Clique sur le lien reçu par email pour continuer.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de vérification.");
    } finally {
      setBusy(false);
    }
  };

  const resendEmail = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || resendCooldown > 0 || !email) return;
    setBusy(true);
    setResendMessage(null);
    setError(null);
    try {
      const redirectUrl = typeof window !== "undefined" ? window.location.href : undefined;
      const { error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: { emailRedirectTo: redirectUrl },
      });
      if (resendErr) throw resendErr;
      setResendMessage("Email renvoyé avec succès ! Vérifie ta boîte de réception et tes spams.");
      setResendCooldown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de renvoyer l'email.");
    } finally {
      setBusy(false);
    }
  };

  const wrap = (children: React.ReactNode) => (
    <div className="pt-10 sm:pt-16 pb-16 px-4 max-w-md mx-auto">
      <div className="glass-card rounded-lg border border-dtc-line/40 p-6 sm:p-8 space-y-5">
        {children}
      </div>
    </div>
  );

  if (status === "invalid" || status === "used" || status === "expired") {
    return wrap(
      <>
        <div className="flex justify-center">
          <div className="p-3 rounded-lg bg-red-500/15 text-red-700">
            <MailX className="w-6 h-6" />
          </div>
        </div>
        <h1 className="text-xl font-heading font-semibold text-dtc-ink text-center">
          Lien indisponible
        </h1>
        <p className="text-xs sm:text-sm text-dtc-inkMuted leading-relaxed text-center">
          {status === "used" &&
            "Ce lien d'invitation a déjà été utilisé — chaque lien ne fonctionne qu'une seule fois. Demandez un nouveau lien au bureau du club."}
          {status === "expired" &&
            "Ce lien d'invitation a expiré. Demandez un nouveau lien au bureau du club."}
          {status === "invalid" &&
            "Ce lien d'invitation n'est pas valide. Vérifiez que vous avez copié l'adresse complète envoyée par le bureau."}
        </p>
      </>
    );
  }

  // Phase: Awaiting Email Verification (Non-blocking + Live Detection)
  if (phase === "awaiting_verification") {
    return (
      <div className="pt-6 sm:pt-10 pb-16 px-4 max-w-lg mx-auto">
        <div className="glass-card rounded-2xl border border-dtc-line/40 p-5 sm:p-7 space-y-5 shadow-lg">
          {/* Animated Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex relative items-center justify-center my-1">
              <div className="w-14 h-14 rounded-2xl bg-dtc-gold/20 text-dtc-goldDark flex items-center justify-center shadow-inner">
                <Mail className="w-7 h-7 animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dtc-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-dtc-gold"></span>
              </span>
            </div>

            <h1 className="text-xl font-heading font-bold text-dtc-ink">
              Vérifie ta boîte mail ✉️
            </h1>
            <p className="text-xs sm:text-sm text-dtc-inkMuted leading-relaxed max-w-sm mx-auto">
              Un email de confirmation vient d&apos;être envoyé à :<br />
              <strong className="text-dtc-ink font-semibold break-all">{email}</strong>
            </p>
          </div>

          {/* Real-time sync badge */}
          <div className="p-3.5 rounded-xl bg-dtc-gold/10 border border-dtc-gold/30 space-y-1.5 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-dtc-goldDark">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Détection automatique en cours...</span>
            </div>
            <p className="text-[11px] text-dtc-inkMuted leading-relaxed">
              Ouvre ton application mail et clique sur le lien. Dès que c&apos;est fait, cette page s&apos;activera toute seule !
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <PrimaryButton
              type="button"
              onClick={checkNowManually}
              disabled={busy}
              className="w-full sm:flex-1 !py-2.5 !text-xs font-semibold"
            >
              {busy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>J&apos;ai validé mon email</span>
            </PrimaryButton>

            <GhostButton
              type="button"
              onClick={resendEmail}
              disabled={busy || resendCooldown > 0}
              className="w-full sm:w-auto !py-2.5 !text-xs shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} />
              <span>
                {resendCooldown > 0
                  ? `Renvoyer (${resendCooldown}s)`
                  : "Renvoyer l'email"}
              </span>
            </GhostButton>
          </div>

          {resendMessage && (
            <p className="text-xs text-center font-medium text-emerald-700 bg-emerald-500/10 border border-emerald-500/30 rounded-lg py-1.5 px-3">
              {resendMessage}
            </p>
          )}

          {error && (
            <p role="alert" className="text-xs text-center text-red-700 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Phase: Completed Activation
  if (phase === "done") {
    const already = result === "already";
    return (
      <div className="pt-6 sm:pt-10 pb-16 px-4 max-w-lg mx-auto">
        <div className="glass-card rounded-2xl border border-dtc-line/40 p-5 sm:p-7 space-y-5 shadow-lg">
          {/* Welcome status banner */}
          <div className="flex items-center justify-between pb-4 border-b border-dtc-line/30 gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  already
                    ? "bg-dtc-gold/15 text-dtc-gold"
                    : "bg-emerald-600/15 text-emerald-700"
                }`}
              >
                {already ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-heading font-semibold text-dtc-ink">
                  {already ? "Accès déjà validé" : "Compte activé avec succès ✓"}
                </h1>
                <p className="text-xs text-dtc-inkMuted">
                  {already
                    ? "Votre compte dispose déjà de l'accès membre."
                    : `Bienvenue au DTC ! Rôle « ${ROLE_LABELS[result] ?? result} » actif.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {(result === "bureau" ||
                result === "admin" ||
                (already && (profile?.role === "bureau" || profile?.role === "admin"))) && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-dtc-gold text-dtc-paper hover:brightness-110 transition-all"
                >
                  Console
                </Link>
              )}
              <Link
                href="/"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-dtc-gold/50 text-dtc-gold hover:bg-dtc-gold/10 transition-all"
              >
                Aller au site →
              </Link>
            </div>
          </div>

          {/* Stand Icebreaker Mini-Game */}
          <StandIcebreakerGame compact={true} />

          <div className="pt-2 text-center border-t border-dtc-line/20">
            <p className="text-[11px] text-dtc-inkMuted">
              Retrouve ce jeu à tout moment au stand sur{" "}
              <Link href="/game" className="underline font-medium text-dtc-goldDark hover:text-dtc-gold">
                dentalkclubfmdc.com/game
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Redeemable link — session holder redeems directly, otherwise sign up.
  if (user) {
    return wrap(
      <>
        <div className="flex justify-center">
          <div className="p-3 rounded-lg bg-dtc-gold/15 text-dtc-gold">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        <h1 className="text-xl font-heading font-semibold text-dtc-ink text-center">
          Invitation DTC
        </h1>
        <p className="text-xs sm:text-sm text-dtc-inkMuted leading-relaxed text-center">
          Ce lien vous accorde l&apos;accès « {ROLE_LABELS[okRole ?? ""] ?? "membre"} » au site du
          club. Vous êtes connecté — activez-le pour ce compte.
        </p>
        {error && (
          <p role="alert" className="text-xs text-red-700 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <PrimaryButton type="button" onClick={redeem} disabled={busy} className="w-full">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activer cette invitation"}
        </PrimaryButton>
      </>
    );
  }

  return wrap(
    <>
      <div className="flex justify-center">
        <div className="p-3 rounded-lg bg-dtc-gold/15 text-dtc-gold">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <h1 className="text-xl font-heading font-semibold text-dtc-ink">Invitation DTC</h1>
        <p className="text-xs sm:text-sm text-dtc-inkMuted leading-relaxed">
          Créez votre compte : il recevra directement l&apos;accès «{" "}
          {ROLE_LABELS[okRole ?? ""] ?? "membre"} ».
        </p>
      </div>
      <form onSubmit={signupAndRedeem} className="space-y-3">
        <Field label="Nom complet" htmlFor="inv-name">
          <input
            id="inv-name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="Prénom Nom"
          />
        </Field>
        <Field label="Adresse email" htmlFor="inv-email">
          <input
            id="inv-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="membre@exemple.com"
          />
        </Field>
        <Field label="Mot de passe" htmlFor="inv-password" hint="8 caractères minimum.">
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
          <p role="alert" className="text-xs text-red-700 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <PrimaryButton type="submit" disabled={busy} className="w-full">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer mon compte et activer"}
        </PrimaryButton>
      </form>
      <div className="text-center">
        <GhostButton type="button" onClick={() => openAuth("signin")} className="!text-[11px]">
          <LogIn className="w-3 h-3" />
          <span>J&apos;ai déjà un compte — me connecter puis activer</span>
        </GhostButton>
      </div>
    </>
  );
}
