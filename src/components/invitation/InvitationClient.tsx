"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, LogIn, MailX, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field, PrimaryButton, GhostButton, inputClass } from "@/components/ui/form";
import StandIcebreakerGame from "@/components/game/StandIcebreakerGame";

const ROLE_LABELS: Record<string, string> = {
  member: "Membre",
  bureau: "Membre du bureau",
  admin: "Administrateur",
};

type Phase = "redeemable" | "done";

/**
 * One-time invitation redemption. The server already validated the token;
 * this component handles the two ways to redeem: sign up fresh, or apply the
 * link to the current (guest/member) session. Redemption is atomic in the
 * redeem_invite_link RPC — a second attempt gets a clean error.
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

  const okRole = status.startsWith("ok:") ? status.slice(3) : null;

  const redeem = async () => {
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
  };

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
      const { data: signUpData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      if (authError) throw authError;
      if (!signUpData.session) {
        setError("Vérifiez votre boîte mail pour confirmer le compte, puis revenez sur ce lien.");
        return;
      }
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

  if (phase === "done") {
    const already = result === "already";
    return (
      <div className="pt-6 sm:pt-10 pb-16 px-4 max-w-lg mx-auto">
        <div className="glass-card rounded-2xl border border-dtc-line/40 p-5 sm:p-7 space-y-5">
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
