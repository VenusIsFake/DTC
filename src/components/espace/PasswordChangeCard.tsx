"use client";

import React, { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field, PrimaryButton, inputClass } from "@/components/ui/form";

/**
 * Self-serve password change (member space). The current password is
 * verified by signing in again — this both proves ownership and refreshes
 * the session so updateUser() never trips "requires_recent_login".
 */
export default function PasswordChangeCard() {
  const { profile } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    if (newPassword.length < 8) {
      setMessage({ kind: "error", text: "Le nouveau mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ kind: "error", text: "Les deux nouveaux mots de passe ne correspondent pas." });
      return;
    }
    if (newPassword === currentPassword) {
      setMessage({ kind: "error", text: "Le nouveau mot de passe doit être différent de l'actuel." });
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !profile?.email) {
      setMessage({ kind: "error", text: "Espace membre indisponible." });
      return;
    }
    setSaving(true);
    try {
      // Re-authenticate first: proves the current password and refreshes the
      // session in one step (supabase-js replaces the stored session).
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      });
      if (signInError) {
        setMessage({ kind: "error", text: "Mot de passe actuel incorrect." });
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setMessage({ kind: "ok", text: "Mot de passe mis à jour ✓" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "Échec de la mise à jour.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="glass-card rounded-xl border border-[#DCD7CB]/40 p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-[#755B18]" />
        <h3 className="text-sm font-heading font-bold text-[#16233A]">Mot de passe</h3>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Mot de passe actuel" htmlFor="current-password">
          <input
            id="current-password"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nouveau mot de passe" htmlFor="new-password">
            <input
              id="new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Confirmer le nouveau" htmlFor="confirm-password">
            <input
              id="confirm-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        {message && (
          <p
            role="status"
            className={`text-xs rounded-lg px-3 py-2 border ${
              message.kind === "ok"
                ? "text-emerald-700 bg-emerald-600/5 border-emerald-600/30"
                : "text-red-600 bg-red-500/10 border-red-500/30"
            }`}
          >
            {message.text}
          </p>
        )}
        <div className="flex justify-end">
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Changer le mot de passe"}
          </PrimaryButton>
        </div>
      </form>
    </section>
  );
}
