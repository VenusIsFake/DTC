"use client";

import React, { useState } from "react";
import { Megaphone, Lightbulb } from "lucide-react";
import AnnouncementsTab from "@/components/admin/AnnouncementsTab";
import IdeasTab from "@/components/admin/IdeasTab";

/** Console tab merging the Annonces & Idées sections (pill switch). */
export default function AnnoncesIdeesTab() {
  const [section, setSection] = useState<"annonces" | "idees">("annonces");

  const sections = [
    { id: "annonces" as const, label: "Annonces", icon: Megaphone },
    { id: "idees" as const, label: "Idées", icon: Lightbulb },
  ];

  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-1.5"
        role="tablist"
        aria-label="Sous-sections Annonces & Idées"
      >
        {sections.map((option) => {
          const isActive = section === option.id;
          return (
            <button
              key={option.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setSection(option.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-dtc-wash text-dtc-gold border border-dtc-gold/30 shadow-sm"
                  : "text-dtc-inkMuted hover:text-dtc-ink border border-transparent hover:bg-dtc-wash"
              }`}
            >
              <option.icon className="w-3.5 h-3.5" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {section === "annonces" ? <AnnouncementsTab /> : <IdeasTab />}
    </div>
  );
}
