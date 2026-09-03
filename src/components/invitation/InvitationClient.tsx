"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, LogIn, MailX, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field, PrimaryButton, GhostButton, inputClass } from "@/components/ui/form";

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
      <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-6 sm:p-8 space-y-5">
        {children}
      </div>
    </div>
  );

  if (status === "invalid" || status === "used" || status === "expired") {
    return wrap(
      <>
        <div className="flex justify-center">
          <div className="p-3 rounded-lg bg-red-500/15 text-red-600">
            <MailX className="w-6 h-6" />
          </div>
        </div>
        <h1 className="text-xl font-heading font-semibold text-[#16233A] text-center">
          Lien indisponible
        </h1>
        <p className="text-xs sm:text-sm text-[#5C6672] leading-relaxed text-center">
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
    return wrap(
      <>
        <div className="flex justify-center">
          <div className={`p-3 rounded-lg ${already ? "bg-[#755B18]/15 text-[#755B18]" : "bg-emerald-600/15 text-emerald-700"}`}>
            {already ? <ShieldCheck className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
          </div>
        </div>
        <h1 className="text-xl font-heading font-semibold text-[#16233A] text-center">
          {already ? "Vous avez déjà accès" : "Invitation activée ✓"}
        </h1>
        <p className="text-xs sm:text-sm text-[#5C6672] leading-relaxed text-center">
          {already
            ? "Votre compte dispose déjà de ce niveau d'accès (ou plus) — le lien reste utilisable par son véritable destinataire."
            : `Bienvenue au DTC ! Votre compte dispose maintenant de l'accès « ${ROLE_LABELS[result] ?? result} ». Vous pouvez quitter cette page et vous connecter au site normalement.`}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {(result === "bureau" ||
            result === "admin" ||
            (already && (profile?.role === "bureau" || profile?.role === "admin"))) && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md text-xs font-bold bg-[#755B18] text-[#F7F5F0] hover:brightness-110 transition-all"
            >
              Ouvrir la console
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md text-xs font-bold border border-[#755B18]/50 text-[#755B18] hover:bg-[#755B18]/10 transition-all"
          >
            Aller au site
          </Link>
        </div>
      </>
    );
  }

  // Redeemable link — session holder redeems directly, otherwise sign up.
  if (user) {
    return wrap(
      <>
        <div className="flex justify-center">
          <div className="p-3 rounded-lg bg-[#755B18]/15 text-[#755B18]">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        <h1 className="text-xl font-heading font-semibold text-[#16233A] text-center">
          Invitation DTC
        </h1>
        <p className="text-xs sm:text-sm text-[#5C6672] leading-relaxed text-center">
          Ce lien vous accorde l&apos;accès « {ROLE_LABELS[okRole ?? ""] ?? "membre"} » au site du
          club. Vous êtes connecté — activez-le pour ce compte.
        </p>
        {error && (
          <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
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
        <div className="p-3 rounded-lg bg-[#755B18]/15 text-[#755B18]">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <h1 className="text-xl font-heading font-semibold text-[#16233A]">Invitation DTC</h1>
        <p className="text-xs sm:text-sm text-[#5C6672] leading-relaxed">
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
          <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
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
