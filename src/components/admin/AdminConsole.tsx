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
  Images,
  ShieldCheck,
} from "lucide-react";
import UsersTab from "@/components/admin/UsersTab";
import AnnouncementsTab from "@/components/admin/AnnouncementsTab";
import IdeasTab from "@/components/admin/IdeasTab";
import PodcastTab from "@/components/admin/PodcastTab";
import EventsTab from "@/components/admin/EventsTab";
import AboutTab from "@/components/admin/AboutTab";
import CommitteesTab from "@/components/admin/CommitteesTab";
import GalleryTab from "@/components/admin/GalleryTab";

const TABS = [
  { id: "users", label: "Utilisateurs", icon: Users, component: UsersTab },
  { id: "annonces", label: "Annonces", icon: Megaphone, component: AnnouncementsTab },
  { id: "idees", label: "Idées", icon: Lightbulb, component: IdeasTab },
  { id: "podcast", label: "Podcast Studio", icon: Radio, component: PodcastTab },
  { id: "events", label: "Événements", icon: CalendarDays, component: EventsTab },
  { id: "gallery", label: "Galerie", icon: Images, component: GalleryTab },
  { id: "about", label: "À propos", icon: FileText, component: AboutTab },
  { id: "committees", label: "Commissions & listes", icon: Building2, component: CommitteesTab },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminConsole({ adminName }: { adminName: string }) {
  const [tab, setTab] = useState<TabId>("users");
  const Active = TABS.find((t) => t.id === tab)?.component ?? UsersTab;

  return (
    <div className="pt-8 sm:pt-12 pb-10 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div className="space-y-1.5">
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#8A6D1F]">
          Console DTC — {adminName}
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
                  ? "bg-[#EFECE4] text-[#8A6D1F] border border-[#8A6D1F]/30 shadow-md"
                  : "text-[#5C6672] hover:text-[#16233A] border border-transparent hover:bg-[#EFECE4]"
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
