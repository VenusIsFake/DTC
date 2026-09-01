"use client";

import React from "react";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Discreet bureau entry point living on the public application form: when
 * the site wall is up, /candidature is the only reachable page, so staff
 * need a way to open the sign-in modal from there.
 */
export default function BureauSignIn() {
  const { user, loading, openAuth } = useAuth();

  if (loading || user) return null;

  return (
    <div className="flex justify-center pt-1">
      <button
        onClick={() => openAuth("signin")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold text-[#5C6672] border border-[#DCD7CB]/60 hover:text-[#755B18] hover:border-[#755B18]/40 transition-colors"
      >
        <KeyRound className="w-3 h-3" />
        <span>Connexion bureau</span>
      </button>
    </div>
  );
}
