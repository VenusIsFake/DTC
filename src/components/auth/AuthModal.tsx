"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, UserPlus, X } from "lucide-react";
import { useOverlayDialog } from "@/hooks/useOverlayDialog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

function translateError(message: string): string {
  if (message.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (message.includes("already registered")) return "Un compte existe déjà avec cet email.";
  if (message.includes("Password should be at least")) return "Le mot de passe doit contenir au moins 6 caractères.";
  if (message.includes("Email name is invalid")) return "Adresse email invalide.";
  if (message.includes("Failed to fetch") || message.includes("fetch failed"))
    return "Connexion à la base impossible. Réessayez dans un instant.";
  return "Une erreur est survenue. Réessayez.";
}

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialogRef = useOverlayDialog<HTMLDivElement>(isOpen, onClose);
  const [mode, setMode] = useState<Mode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setPassword("");
    }
  }, [isOpen]);

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
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      } else {
        if (fullName.trim().length < 2) {
          setError("Merci d'indiquer votre nom complet.");
          return;
        }
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName.trim() } },
        });
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

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "signin" ? "Connexion à l'espace membre" : "Créer un compte"}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md glass-card rounded-2xl sm:rounded-3xl border border-[#385A75]/50 p-6 sm:p-8 space-y-5 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-[#1B2E4B]/80 text-[#94A3B8] hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1 text-center">
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
            {mode === "signin" ? "Espace " : "Rejoindre "}
            <span className="gold-gradient-text">{mode === "signin" ? "Membre" : "DTC"}</span>
          </h2>
          <p className="text-xs text-[#94A3B8]">
            {mode === "signin"
              ? "Connectez-vous pour voter, commenter et participer aux ateliers."
              : "Créez votre compte : votes, idées, RSVP et annuaire des membres."}
          </p>
        </div>

        {/* Mode tabs */}
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-[#385A75]/50 text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20"
                placeholder="Prénom Nom"
              />
            </div>
          )}

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
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-[#385A75]/50 text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20"
              placeholder="prenom.nom@example.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="auth-password" className="text-[11px] font-semibold text-[#CBD5E1] block">
              Mot de passe
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-[#385A75]/50 text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20"
              placeholder="••••••••"
            />
          </div>

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
            {mode === "signin" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{submitting ? "Un instant…" : mode === "signin" ? "Se connecter" : "Créer mon compte"}</span>
          </button>
        </form>

        <p className="text-center text-[10px] text-[#64748B] leading-relaxed">
          Inscription libre, réservée aux étudiants de la FMDC. En créant un compte vous acceptez
          que le bureau du club modère les échanges.{" "}
          <Link href="/about" className="text-[#94A3B8] underline underline-offset-2">
            En savoir plus
          </Link>
        </p>
      </div>
    </div>
  );
}
