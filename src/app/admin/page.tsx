import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getServerProfile } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import SignInPrompt from "@/components/auth/SignInPrompt";
import AdminConsole from "@/components/admin/AdminConsole";

export const metadata = {
  title: "Console d'Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function AccessDenied() {
  return (
    <div className="pt-10 sm:pt-14 pb-10 sm:pb-20 px-4 sm:px-6 max-w-xl mx-auto">
      <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-8 sm:p-12 text-center space-y-4">
        <div className="inline-flex p-3 rounded-lg bg-red-500/15 text-red-600">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-semibold text-[#16233A]">Accès refusé</h1>
        <p className="text-xs sm:text-sm text-[#5C6672] leading-relaxed max-w-sm mx-auto">
          La console est réservée aux membres du bureau et aux administrateurs du club. Si vous faites
          partie du bureau mais n&apos;avez pas encore accès, demandez au président de vous attribuer
          le rôle « Bureau ».
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold border border-[#755B18]/50 text-[#755B18] hover:bg-[#755B18]/10 transition-all"
        >
          <span>Retour à l&apos;accueil</span>
        </Link>
      </div>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return <SignInPrompt title="Console indisponible" description="La base de données n'est pas configurée." />;
  }

  const [profile, params] = await Promise.all([getServerProfile(), searchParams]);
  if (!profile) {
    return (
      <SignInPrompt
        title="Console du Club"
        description="Connectez-vous avec un compte bureau ou administrateur pour gérer le club."
      />
    );
  }
  if (profile.role !== "admin" && profile.role !== "bureau") {
    return <AccessDenied />;
  }

  return (
    <AdminConsole
      adminName={profile.full_name || "Bureau"}
      role={profile.role}
      initialTab={params.tab}
    />
  );
}
