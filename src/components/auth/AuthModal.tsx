"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, KeyRound, LogIn, MailCheck, UserPlus, X } from "lucide-react";
import { useOverlayDialog } from "@/hooks/useOverlayDialog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type AuthMode = "signin" | "signup" | "forgot" | "newpassword";

// Cloudflare Turnstile — rendered only when the site key is configured
// (see docs/platform/deployment.md § Captcha). Supabase checks the token
// when captcha is enabled in the dashboard; absent key = no widget.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

function translateError(message: string): string {
  if (message.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (message.includes("already registered")) return "Un compte existe déjà avec cet email.";
  if (message.includes("Password should be at least")) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (message.includes("too simple") || message.includes("breach")) return "Ce mot de passe est trop faible ou déjà compromis — choisissez-en un autre.";
  if (message.includes("Email name is invalid")) return "Adresse email invalide.";
  if (message.includes("captcha")) return "Vérification anti-robot échouée — rechargez la page et réessayez.";
  if (message.includes("every 60 seconds") || message.includes("rate"))
    return "Trop de demandes — patientez quelques instants puis réessayez.";
  if (message.includes("Failed to fetch") || message.includes("fetch failed"))
    return "Connexion à la base impossible. Réessayez dans un instant.";
  return "Une erreur est survenue. Réessayez.";
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-[#385A75]/50 text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20";

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "signin",
}: {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}) {
  const dialogRef = useOverlayDialog<HTMLDivElement>(isOpen, onClose);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false); // forgot-password email sent
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSent(false);
      setError(null);
      setPassword("");
      setConfirm("");
    }
  }, [isOpen, initialMode]);

  const needsCaptcha = mode === "signin" || mode === "signup";

  // Render/clear the Turnstile widget alongside the sign-in/up forms.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !needsCaptcha || !isOpen || !turnstileReady || !turnstileRef.current) {
      return;
    }
    const id = window.turnstile?.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "dark",
      callback: (token: string) => setCaptchaToken(token),
      "expired-callback": () => setCaptchaToken(null),
      "error-callback": () => setCaptchaToken(null),
    });
    widgetIdRef.current = id ?? null;
    return () => {
      if (widgetIdRef.current !== null) window.turnstile?.remove(widgetIdRef.current);
      widgetIdRef.current = null;
      setCaptchaToken(null);
    };
  }, [isOpen, mode, needsCaptcha, turnstileReady]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Espace membre indisponible (base de données non configurée).");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: { captchaToken: captchaToken ?? undefined },
        });
        if (authError) throw authError;
      } else if (mode === "signup") {
        if (fullName.trim().length < 2) {
          setError("Merci d'indiquer votre nom complet.");
          return;
        }
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName.trim() }, captchaToken: captchaToken ?? undefined },
        });
        if (authError) throw authError;
      } else if (mode === "forgot") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/espace`,
        });
        if (authError) throw authError;
        setSent(true);
        return;
      } else {
        // newpassword: recovery link has already authenticated the session.
        if (password.length < 8) {
          setError("Le mot de passe doit contenir au moins 8 caractères.");
          return;
        }
        if (password !== confirm) {
          setError("Les deux mots de passe ne correspondent pas.");
          return;
        }
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
      }
      onClose();
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const titles: Record<AuthMode, { head: string; gold: string; sub: string }> = {
    signin: { head: "Espace ", gold: "Membre", sub: "Connectez-vous pour voter, commenter et participer aux ateliers." },
    signup: { head: "Rejoindre ", gold: "DTC", sub: "Créez votre compte : votes, idées, RSVP et annuaire des membres." },
    forgot: { head: "Mot de passe ", gold: "oublié", sub: "Nous vous envoyons un lien de réinitialisation par email." },
    newpassword: { head: "Nouveau mot de ", gold: "passe", sub: "Choisissez un nouveau mot de passe pour votre compte." },
  };
  const t = titles[mode];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t.head + t.gold}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn"
    >
      {TURNSTILE_SITE_KEY && needsCaptcha && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
          onLoad={() => setTurnstileReady(true)}
        />
      )}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md glass-card rounded-2xl sm:rounded-3xl border border-[#385A75]/50 p-6 sm:p-8 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-[#1B2E4B]/80 text-[#94A3B8] hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1 text-center">
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
            {t.head}
            <span className="gold-gradient-text">{t.gold}</span>
          </h2>
          <p className="text-xs text-[#94A3B8]">{t.sub}</p>
        </div>

        {/* Mode tabs (sign in / sign up only) */}
        {(mode === "signin" || mode === "signup") && (
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#0F172A]/80 border border-[#385A75]/40" role="tablist">
            {(
              [
                { id: "signin", label: "Connexion" },
                { id: "signup", label: "Inscription" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={mode === tab.id}
                onClick={() => {
                  setMode(tab.id);
                  setError(null);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === tab.id
                    ? "bg-[#1B2E4B] text-[#D4AF37] border border-[#D4AF37]/30"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {mode === "forgot" && sent ? (
          <div className="space-y-4 text-center py-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
              <MailCheck className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <p className="text-sm text-[#CBD5E1]">
              Si un compte existe pour <span className="text-white font-semibold">{email}</span>, un
              email de réinitialisation vient de partir. Ouvrez-le et cliquez sur le lien pour
              choisir un nouveau mot de passe.
            </p>
            <button
              onClick={() => {
                setMode("signin");
                setSent(false);
              }}
              className="text-xs font-semibold text-[#D4AF37] hover:underline underline-offset-2"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {(mode === "forgot" || mode === "newpassword") && (
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "newpassword" ? "signin" : "signin");
                  setError(null);
                  setSent(false);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#94A3B8] hover:text-[#D4AF37] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{mode === "newpassword" ? "Retour à la connexion" : "Retour"}</span>
              </button>
            )}

            {mode === "signup" && (
              <div className="space-y-1">
                <label htmlFor="auth-fullname" className="text-[11px] font-semibold text-[#CBD5E1] block">
                  Nom complet
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  className={inputClass}
                  placeholder="Prénom Nom"
                />
              </div>
            )}

            {mode !== "newpassword" && (
              <div className="space-y-1">
                <label htmlFor="auth-email" className="text-[11px] font-semibold text-[#CBD5E1] block">
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={inputClass}
                  placeholder="prenom.nom@example.com"
                />
              </div>
            )}

            {(mode === "signin" || mode === "signup" || mode === "newpassword") && (
              <div className="space-y-1">
                <label htmlFor="auth-password" className="text-[11px] font-semibold text-[#CBD5E1] block">
                  {mode === "newpassword" ? "Nouveau mot de passe" : "Mot de passe"}
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={mode === "signin" ? undefined : 8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className={inputClass}
                  placeholder="••••••••"
                />
                {mode === "signup" && (
                  <p className="text-[10px] text-[#64748B]">8 caractères minimum, évitez les mots de passe déjà utilisés ailleurs.</p>
                )}
              </div>
            )}

            {mode === "newpassword" && (
              <div className="space-y-1">
                <label htmlFor="auth-confirm" className="text-[11px] font-semibold text-[#CBD5E1] block">
                  Confirmer le mot de passe
                </label>
                <input
                  id="auth-confirm"
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
            )}

            {TURNSTILE_SITE_KEY && needsCaptcha && (
              <div ref={turnstileRef} className="flex justify-center min-h-[65px]" />
            )}

            {error && (
              <p role="alert" className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              data-autofocus
              className="w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#0B132B] hover:brightness-110 transition-all shadow-lg shadow-[#D4AF37]/20 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
            >
              {mode === "signin" && <LogIn className="w-4 h-4" />}
              {mode === "signup" && <UserPlus className="w-4 h-4" />}
              {mode === "forgot" && <MailCheck className="w-4 h-4" />}
              {mode === "newpassword" && <KeyRound className="w-4 h-4" />}
              <span>
                {submitting
                  ? "Un instant…"
                  : mode === "signin"
                    ? "Se connecter"
                    : mode === "signup"
                      ? "Créer mon compte"
                      : mode === "forgot"
                        ? "Envoyer le lien"
                        : "Enregistrer"}
              </span>
            </button>
          </form>
        )}

        {mode === "signin" && (
          <button
            type="button"
            onClick={() => {
              setMode("forgot");
              setError(null);
              setSent(false);
            }}
            className="w-full text-center text-[11px] font-semibold text-[#94A3B8] hover:text-[#D4AF37] transition-colors"
          >
            Mot de passe oublié ?
          </button>
        )}

        {(mode === "signin" || mode === "signup") && (
          <p className="text-center text-[10px] text-[#64748B] leading-relaxed">
            Inscription libre, réservée aux étudiants de la FMDC. En créant un compte vous acceptez
            que le bureau du club modère les échanges.{" "}
            <Link href="/about" className="text-[#94A3B8] underline underline-offset-2">
              En savoir plus
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
