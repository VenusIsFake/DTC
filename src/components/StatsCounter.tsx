"use client";

import React from "react";
import { siteConfig } from "@/data/siteConfig";
import { Users, FileText, Video, Radio } from "lucide-react";

export default function StatsCounter() {
  const icons = [Users, FileText, Video, Radio];

  return (
    <section className="relative z-20 pt-1 pb-4 sm:py-6 px-3.5 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
          {siteConfig.stats.map((stat, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <div
                key={stat.label}
                className="glass-card glass-card-hover p-2.5 sm:p-5 rounded-xl sm:rounded-2xl text-center space-y-0.5 sm:space-y-2 border border-[#385A75]/35 relative overflow-hidden group transition-all"
              >
                <div className="absolute top-0 right-0 w-14 sm:w-24 h-14 sm:h-24 bg-[#D4AF37]/5 rounded-full blur-lg sm:blur-2xl group-hover:bg-[#D4AF37]/10 transition-all pointer-events-none" />
                <div className="inline-flex p-1 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#1B2E4B]/80 text-[#D4AF37] mb-0.5">
                  <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>
                <div className="text-base sm:text-2xl lg:text-3xl font-heading font-extrabold text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-[#94A3B8] leading-tight">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
