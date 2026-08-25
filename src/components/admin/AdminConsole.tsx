"use client";

import React, { useState } from "react";
import {
  Users,
  Megaphone,
  Lightbulb,
  Radio,
  CalendarDays,
  FileText,
  Building2,
  ShieldCheck,
} from "lucide-react";
import UsersTab from "@/components/admin/UsersTab";
import AnnouncementsTab from "@/components/admin/AnnouncementsTab";
import IdeasTab from "@/components/admin/IdeasTab";
import PodcastTab from "@/components/admin/PodcastTab";
import EventsTab from "@/components/admin/EventsTab";
import AboutTab from "@/components/admin/AboutTab";
import CommitteesTab from "@/components/admin/CommitteesTab";

const TABS = [
  { id: "users", label: "Utilisateurs", icon: Users, component: UsersTab },
  { id: "annonces", label: "Annonces", icon: Megaphone, component: AnnouncementsTab },
  { id: "idees", label: "Idées", icon: Lightbulb, component: IdeasTab },
  { id: "podcast", label: "Podcast Studio", icon: Radio, component: PodcastTab },
  { id: "events", label: "Événements", icon: CalendarDays, component: EventsTab },
  { id: "about", label: "À propos", icon: FileText, component: AboutTab },
  { id: "committees", label: "Commissions & listes", icon: Building2, component: CommitteesTab },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminConsole({ adminName }: { adminName: string }) {
  const [tab, setTab] = useState<TabId>("users");
  const Active = TABS.find((t) => t.id === tab)?.component ?? UsersTab;

  return (
    <div className="pt-16 sm:pt-28 pb-10 sm:pb-20 px-3.5 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Console DTC — {adminName}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-white">
          Administration du <span className="gold-gradient-text">Club</span>
        </h1>
      </div>

      {/* Tab bar (horizontal scroll on mobile) */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1"
        role="tablist"
        aria-label="Sections de la console"
      >
        {TABS.map((option) => {
          const isActive = tab === option.id;
          return (
            <button
              key={option.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(option.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? "bg-[#1B2E4B] text-[#D4AF37] border border-[#D4AF37]/30 shadow-md"
                  : "text-[#94A3B8] hover:text-white border border-transparent hover:bg-white/5"
              }`}
            >
              <option.icon className="w-3.5 h-3.5" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      <Active />
    </div>
  );
}
