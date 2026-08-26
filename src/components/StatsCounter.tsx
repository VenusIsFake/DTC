"use client";

import React from "react";
import Reveal from "@/components/Reveal";
import type { HomeStat } from "@/lib/types";

/**
 * Editorial fact strip: serif figures over hairline column dividers.
 */
export default function StatsCounter({ stats }: { stats: HomeStat[] }) {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <Reveal>
      <div className="max-w-6xl mx-auto border-y border-[#DCD7CB]">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#DCD7CB]">
          {stats.map((stat, idx) => (
            <div
              key={`${stat.label}-${idx}`}
              className={`py-5 sm:py-8 text-center ${
                idx >= 2 ? "border-t border-[#DCD7CB] md:border-t-0" : ""
              }`}
            >
              <div className="font-heading font-semibold text-2xl sm:text-4xl text-[#16233A] tabular-nums tracking-tight">
                {stat.value}
              </div>
              <div className="mt-1 text-[11px] sm:text-xs text-[#5C6672] leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      </Reveal>
    </section>
  );
}
