"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Megaphone,
  Radio,
  CalendarDays,
  FileText,
  Images,
  Home,
  ClipboardList,
} from "lucide-react";
import type { Role } from "@/lib/types";
import UsersTab from "@/components/admin/UsersTab";
import AnnoncesIdeesTab from "@/components/admin/AnnoncesIdeesTab";
import PodcastTab from "@/components/admin/PodcastTab";
import EventsTab from "@/components/admin/EventsTab";
import AboutCommitteesTab from "@/components/admin/AboutCommitteesTab";
import GalleryTab from "@/components/admin/GalleryTab";
import HomeTab from "@/components/admin/HomeTab";
import RecruitmentsTab from "@/components/admin/RecruitmentsTab";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<{ viewerRole?: Role }>;
  /** Admin-only tab — hidden from bureau accounts (none today; kept for future use). */
  adminOnly?: boolean;
}

const TABS: TabDef[] = [
  // Users tab is shared: admins get full account management, bureau members
  // get the guest-approval view only (UsersTab checks viewerRole).
  { id: "users", label: "Utilisateurs", icon: Users, component: UsersTab },
  { id: "home", label: "Accueil", icon: Home, component: HomeTab },
  { id: "annonces", label: "Annonces & Idées", icon: Megaphone, component: AnnoncesIdeesTab },
  { id: "podcast", label: "Podcast Studio", icon: Radio, component: PodcastTab },
  { id: "events", label: "Événements", icon: CalendarDays, component: EventsTab },
  { id: "gallery", label: "Galerie", icon: Images, component: GalleryTab },
  { id: "about", label: "À propos & Commissions", icon: FileText, component: AboutCommitteesTab },
  { id: "candidatures", label: "Candidatures", icon: ClipboardList, component: RecruitmentsTab },
];

type TabId =
  | "users"
  | "home"
  | "annonces"
  | "podcast"
  | "events"
  | "gallery"
  | "about"
  | "candidatures";

export default function AdminConsole({
  adminName,
  role,
  initialTab,
}: {
  adminName: string;
  role: Role;
  initialTab?: string | null;
}) {
  const tabs = TABS.filter((t) => role === "admin" || !t.adminOnly);
  // Tab survives refresh via /admin?tab=… — server-validated initial value,
  // client mirrors every switch into the URL (no navigation).
  const defaultTab: TabId = role === "admin" ? "users" : "annonces";
  const startTab = (tabs.find((t) => t.id === initialTab)?.id ?? defaultTab) as TabId;
  const [tab, setTabState] = useState<TabId>(startTab);
  const setTab = (next: TabId) => {
    setTabState(next);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/admin?tab=${next}`);
    }
  };
  // Back/Forward change the URL without a navigation — follow it so the
  // rendered tab never disagrees with the address bar.
  useEffect(() => {
    const onPopState = () => {
      const param = new URLSearchParams(window.location.search).get("tab");
      const resolved = (tabs.find((t) => t.id === param)?.id ?? defaultTab) as TabId;
      setTabState(resolved);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const Active = tabs.find((t) => t.id === tab)?.component ?? AnnoncesIdeesTab;

  return (
    <div className="pt-8 sm:pt-12 pb-10 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div className="space-y-1.5">
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#755B18]">
          Console DTC — {adminName} · {role === "admin" ? "Admin" : "Bureau"}
        </p>
        <h1 className="font-heading font-semibold text-2xl sm:text-4xl text-[#16233A] tracking-tight">
          Administration du Club
        </h1>
      </div>

        {/* Tab bar (horizontal scroll on mobile) */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1"
        role="tablist"
        aria-label="Sections de la console"
      >
        {tabs.map((option) => {
          const isActive = tab === option.id;
          return (
            <button
              key={option.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(option.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? "bg-[#EFECE4] text-[#755B18] border border-[#755B18]/30 shadow-md"
                  : "text-[#5C6672] hover:text-[#16233A] border border-transparent hover:bg-[#EFECE4]"
              }`}
            >
              <option.icon className="w-3.5 h-3.5" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      <Active viewerRole={role} />
    </div>
  );
}
