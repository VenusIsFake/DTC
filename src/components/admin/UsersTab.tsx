"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, Copy, KeyRound, Loader2, ShieldOff, ShieldCheck, Search, Trash2, UserPlus, X } from "lucide-react";
import type { AdminProfileRow, Role } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatRelative } from "@/lib/format";
import { Badge, Field, GhostButton, PrimaryButton, inputClass } from "@/components/ui/form";
import UserAvatar from "@/components/UserAvatar";
import { useOverlayDialog } from "@/hooks/useOverlayDialog";

const ROLE_LABELS: Record<Role, string> = {
  member: "Membre",
  bureau: "Bureau",
  admin: "Administrateur",
};

const ROLE_RANK: Record<Role, number> = { admin: 0, bureau: 1, member: 2 };

type SortMode = "role" | "recent" | "name";

interface InviteForm {
  email: string;
  full_name: string;
  role: Role;
}

export default function UsersTab() {
  const [users, setUsers] = useState<AdminProfileRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("role");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [serviceReady, setServiceReady] = useState<boolean | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteForm>({ email: "", full_name: "", role: "bureau" });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [passwordResult, setPasswordResult] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const inviteDialogRef = useOverlayDialog<HTMLDivElement>(inviteOpen, () => setInviteOpen(false));

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data, error: rpcError } = await supabase.rpc("admin_list_profiles");
    if (rpcError) setError(rpcError.message);
    setUsers((data as AdminProfileRow[] | null) ?? []);
  };

  useEffect(() => {
    load();
    // Which optional server capabilities are live (drives the invite/reset UI).
    fetch("/api/admin/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { serviceKey?: boolean } | null) => setServiceReady(payload?.serviceKey ?? null))
      .catch(() => setServiceReady(null));
  }, []);

  const setRole = async (target: AdminProfileRow, role: Role) => {
    if (role === target.role) return;
    if (
      !window.confirm(
        `Donner le rôle « ${ROLE_LABELS[role]} » à ${target.full_name || target.email} ?`
      )
    ) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusyId(target.id);
    const { error: rpcError } = await supabase.rpc("admin_set_role", { target_id: target.id, new_role: role });
    if (rpcError) setError(rpcError.message);
    else await load();
    setBusyId(null);
  };

  const setBanned = async (target: AdminProfileRow, banned: boolean) => {
    if (
      banned &&
      !window.confirm(
        `Bannir ${target.full_name || target.email} ? Le compte ne pourra plus se connecter ni interagir.`
      )
    ) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusyId(target.id);
    const { error: rpcError } = await supabase.rpc("admin_set_banned", { target_id: target.id, banned });
    if (rpcError) setError(rpcError.message);
    else await load();
    setBusyId(null);
  };

  const invite = async (event: React.FormEvent) => {
    event.preventDefault();
    setInviting(true);
    setInviteError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...inviteForm }),
      });
      const payload = (await res.json()) as { email?: string; password?: string; error?: string };
      if (!res.ok || !payload.password) throw new Error(payload.error ?? "Création impossible.");
      setPasswordResult({ email: payload.email ?? inviteForm.email, password: payload.password });
      setCopied(false);
      setInviteOpen(false);
      setInviteForm({ email: "", full_name: "", role: "bureau" });
      await load();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Création impossible.");
    } finally {
      setInviting(false);
    }
  };

  const resetPassword = async (target: AdminProfileRow) => {
    if (
      !window.confirm(
        `Générer un nouveau mot de passe temporaire pour ${target.full_name || target.email} ? L'ancien cessera de fonctionner immédiatement.`
      )
    ) {
      return;
    }
    setBusyId(target.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password", user_id: target.id }),
      });
      const payload = (await res.json()) as { password?: string; error?: string };
      if (!res.ok || !payload.password) throw new Error(payload.error ?? "Échec de la réinitialisation.");
      setPasswordResult({ email: target.email, password: payload.password });
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la réinitialisation.");
    } finally {
      setBusyId(null);
    }
  };

  const deleteAccount = async (target: AdminProfileRow) => {
    if (
      !window.confirm(
        `Supprimer définitivement le compte de ${target.full_name || target.email} ? Ses contributions (annonces, idées, commentaires) seront conservées mais sans nom d'auteur. Cette action est irréversible.`
      )
    ) {
      return;
    }
    setBusyId(target.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", user_id: target.id }),
      });
      const payload = (await res.json()) as { deleted?: boolean; error?: string };
      if (!res.ok || !payload.deleted) throw new Error(payload.error ?? "Suppression impossible.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    } finally {
      setBusyId(null);
    }
  };

  const copyPassword = async () => {
    if (!passwordResult) return;
    try {
      await navigator.clipboard.writeText(passwordResult.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the password stays selectable for manual copy.
    }
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = needle
      ? users
          ?.filter(
              (u) =>
                u.full_name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle)
            ) ?? []
      : (users ?? []);
    const sorted = [...list];
    if (sort === "role") {
      sorted.sort(
        (a, b) =>
          ROLE_RANK[a.role] - ROLE_RANK[b.role] || a.full_name.localeCompare(b.full_name, "fr")
      );
    } else if (sort === "name") {
      sorted.sort((a, b) => a.full_name.localeCompare(b.full_name, "fr"));
    } else {
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return sorted;
  }, [users, query, sort]);

  if (users === null) {
    return (
      <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-8 text-center">
        <Loader2 className="w-5 h-5 text-[#755B18] animate-spin mx-auto" />
        <p className="text-xs text-[#5C6672] mt-2">Chargement des comptes…</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <p className="text-xs text-[#5C6672]">
          {users.length} compte{users.length > 1 ? "s" : ""} — rôles, bannissements et coordonnées.
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="users-sort" className="sr-only">Trier les comptes</label>
          <select
            id="users-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className={`${inputClass} !py-1.5 !px-2 !text-[11px] w-auto`}
          >
            <option value="role">Tri : Rôle (Admin → Bureau → Membre)</option>
            <option value="recent">Tri : Récents</option>
            <option value="name">Tri : Nom A→Z</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5F6774]" aria-hidden="true" />
            <label htmlFor="users-search" className="sr-only">Rechercher un compte</label>
            <input
              id="users-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom ou email…"
              className={`${inputClass} pl-9 !py-1.5 !text-xs w-52`}
            />
          </div>
          <button
            onClick={() => {
              setInviteError(null);
              setInviteOpen(true);
            }}
            disabled={serviceReady === false}
            title={serviceReady === false ? "Clé service_role manquante sur le serveur" : "Créer un compte et transmettre le mot de passe temporaire"}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold bg-[#755B18] text-[#F7F5F0] hover:brightness-110 shadow-md shadow-[#755B18]/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Inviter</span>
          </button>
        </div>
      </div>

      {serviceReady === false && (
        <p className="text-[11px] text-[#755B18] bg-[#755B18]/10 border border-[#755B18]/30 rounded-lg px-3 py-2">
          Invitations, réinitialisations et suppressions de comptes sont désactivées : la clé serveur
          SUPABASE_SERVICE_ROLE_KEY n&apos;est pas configurée.
        </p>
      )}

      {passwordResult && (
        <div className="glass-card rounded-lg border border-emerald-600/40 bg-emerald-600/5 p-4 space-y-2">
          <p className="text-xs font-bold text-emerald-800">
            Mot de passe temporaire pour {passwordResult.email} — affiché une seule fois :
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <code className="px-3 py-2 rounded-lg bg-white border border-[#DCD7CB]/60 text-sm font-bold tracking-wider text-[#16233A] select-all">
              {passwordResult.password}
            </code>
            <GhostButton onClick={copyPassword} className="!py-1.5 !text-[11px]">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copié ✓" : "Copier"}</span>
            </GhostButton>
            <button
              onClick={() => setPasswordResult(null)}
              className="text-[10px] font-semibold text-[#5C6672] hover:text-[#16233A]"
            >
              Fermer
            </button>
          </div>
          <p className="text-[10px] text-[#5C6672]">
            Transmettez-le au membre (WhatsApp, en personne…) — il pourra le changer dans « Mon espace ».
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-2">
        {filtered.map((u) => (
          <div
            key={u.id}
            className={`glass-card rounded-xl border p-3 sm:p-4 flex flex-wrap items-center gap-3 ${
              u.is_banned ? "border-red-500/30 opacity-75" : "border-[#DCD7CB]/40"
            }`}
          >
            <UserAvatar name={u.full_name} src={u.avatar_url} size={38} />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-[#16233A] truncate">
                {u.full_name || "(sans nom)"}
                {u.is_banned && (
                  <Badge tone="red" className="ml-2">
                    Banni
                  </Badge>
                )}
              </p>
              <p className="text-[11px] text-[#5C6672] truncate">
                {u.email}
                {u.phone ? ` · ${u.phone}` : ""}
                {u.promo ? ` · Promo ${u.promo}` : ""}
                {u.committee ? ` · ${u.committee}` : ""}
              </p>
              <p className="text-[10px] text-[#5F6774]">Inscrit {formatRelative(u.created_at)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {busyId === u.id ? (
                <Loader2 className="w-4 h-4 text-[#755B18] animate-spin" />
              ) : (
                <>
                  <label className="sr-only" htmlFor={`role-${u.id}`}>
                    Rôle de {u.full_name}
                  </label>
                  <select
                    id={`role-${u.id}`}
                    value={u.role}
                    onChange={(e) => setRole(u, e.target.value as Role)}
                    className={`${inputClass} !w-auto !py-1.5 !px-2 !text-[11px]`}
                  >
                    <option value="member">Membre</option>
                    <option value="bureau">Bureau</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => setBanned(u, !u.is_banned)}
                    aria-label={u.is_banned ? "Réactiver le compte" : "Bannir le compte"}
                    title={u.is_banned ? "Réactiver" : "Bannir"}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                      u.is_banned
                        ? "text-emerald-700 hover:bg-emerald-600/10"
                        : "text-[#5C6672] hover:text-red-600 hover:bg-red-500/10"
                    }`}
                  >
                    {u.is_banned ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => resetPassword(u)}
                    aria-label={`Réinitialiser le mot de passe de ${u.full_name || u.email}`}
                    title="Mot de passe temporaire"
                    disabled={serviceReady === false}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-[#755B18] hover:bg-[#EFECE4] transition-colors disabled:opacity-40"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAccount(u)}
                    aria-label={`Supprimer le compte de ${u.full_name || u.email}`}
                    title="Supprimer le compte"
                    disabled={serviceReady === false}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5C6672] hover:text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-[#5C6672] text-center py-6">Aucun compte ne correspond.</p>
        )}
      </div>

      {inviteOpen && (
        <div
          ref={inviteDialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Inviter un membre"
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fadeIn"
        >
          <div className="absolute inset-0" onClick={() => setInviteOpen(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-md max-h-[92dvh] overflow-y-auto glass-card rounded-lg border border-[#DCD7CB]/50 p-5 sm:p-6 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-heading font-bold text-[#16233A]">Inviter un membre</h4>
              <button
                onClick={() => setInviteOpen(false)}
                aria-label="Fermer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#EFECE4]/80 text-[#5C6672] hover:text-[#16233A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={invite} className="space-y-3">
              <Field label="Adresse email" htmlFor="invite-email">
                <input
                  id="invite-email"
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className={inputClass}
                  placeholder="membre@exemple.com"
                />
              </Field>
              <Field label="Nom complet" htmlFor="invite-name">
                <input
                  id="invite-name"
                  type="text"
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                  className={inputClass}
                  placeholder="Prénom Nom"
                />
              </Field>
              <Field label="Rôle" htmlFor="invite-role" hint="Le membre peut être promu ou rétrogradé plus tard.">
                <select
                  id="invite-role"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as Role })}
                  className={inputClass}
                >
                  <option value="member">Membre</option>
                  <option value="bureau">Bureau</option>
                  <option value="admin">Administrateur</option>
                </select>
              </Field>
              <p className="text-[10px] text-[#5C6672] leading-relaxed">
                Un mot de passe temporaire sera généré et affiché une seule fois — transmettez-le au
                membre, il le changera à sa première connexion depuis « Mon espace ».
              </p>
              {inviteError && (
                <p role="alert" className="text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                  {inviteError}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <GhostButton type="button" onClick={() => setInviteOpen(false)}>
                  Annuler
                </GhostButton>
                <PrimaryButton type="submit" disabled={inviting}>
                  {inviting ? "Création…" : "Créer le compte"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
