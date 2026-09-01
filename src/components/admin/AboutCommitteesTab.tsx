"use client";

import React, { useState } from "react";
import { FileText, Building2 } from "lucide-react";
import AboutTab from "@/components/admin/AboutTab";
import CommitteesTab from "@/components/admin/CommitteesTab";

/** Console tab merging the À propos (sections + mandats) & Commissions sections. */
export default function AboutCommitteesTab() {
  const [section, setSection] = useState<"about" | "committees">("about");

  const sections = [
    { id: "about" as const, label: "Sections & mandats", icon: FileText },
    { id: "committees" as const, label: "Commissions & listes", icon: Building2 },
  ];

  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1"
        role="tablist"
        aria-label="Sous-sections À propos & Commissions"
      >
        {sections.map((option) => {
          const isActive = section === option.id;
          return (
            <button
              key={option.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setSection(option.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? "bg-[#EFECE4] text-[#755B18] border border-[#755B18]/30 shadow-sm"
                  : "text-[#5C6672] hover:text-[#16233A] border border-transparent hover:bg-[#EFECE4]"
              }`}
            >
              <option.icon className="w-3.5 h-3.5" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {section === "about" ? <AboutTab /> : <CommitteesTab />}
    </div>
  );
}
