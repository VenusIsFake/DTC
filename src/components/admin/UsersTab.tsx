"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldOff, ShieldCheck, Search } from "lucide-react";
import type { AdminProfileRow, Role } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatRelative } from "@/lib/format";
import { Badge, inputClass } from "@/components/ui/form";
import UserAvatar from "@/components/UserAvatar";

const ROLE_LABELS: Record<Role, string> = {
  member: "Membre",
  bureau: "Bureau",
  admin: "Administrateur",
};

const ROLE_RANK: Record<Role, number> = { admin: 0, bureau: 1, member: 2 };

type SortMode = "role" | "recent" | "name";

export default function UsersTab() {
  const [users, setUsers] = useState<AdminProfileRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("role");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data, error: rpcError } = await supabase.rpc("admin_list_profiles");
    if (rpcError) setError(rpcError.message);
    setUsers((data as AdminProfileRow[] | null) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const setRole = async (target: AdminProfileRow, role: Role) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusyId(target.id);
    const { error: rpcError } = await supabase.rpc("admin_set_role", { target_id: target.id, new_role: role });
    if (rpcError) setError(rpcError.message);
    else await load();
    setBusyId(null);
  };

  const setBanned = async (target: AdminProfileRow, banned: boolean) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusyId(target.id);
    const { error: rpcError } = await supabase.rpc("admin_set_banned", { target_id: target.id, banned });
    if (rpcError) setError(rpcError.message);
    else await load();
    setBusyId(null);
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
        <Loader2 className="w-5 h-5 text-[#8A6D1F] animate-spin mx-auto" />
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7A828D]" aria-hidden="true" />
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
        </div>
      </div>

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
              <p className="text-[10px] text-[#7A828D]">Inscrit {formatRelative(u.created_at)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {busyId === u.id ? (
                <Loader2 className="w-4 h-4 text-[#8A6D1F] animate-spin" />
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
                </>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-[#5C6672] text-center py-6">Aucun compte ne correspond.</p>
        )}
      </div>
    </div>
  );
}
