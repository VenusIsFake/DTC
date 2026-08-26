import React from "react";
import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import type { AnnouncementBoardItem } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

/**
 * "Prochain atelier" teaser — rendered only when the board has an upcoming
 * atelier (silent-hidden otherwise, per the resilience rule).
 */
export default function NextAtelierTeaser({ atelier }: { atelier: AnnouncementBoardItem }) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" aria-live="polite">
      <Link
        href="/annonces"
        className="glass-card glass-card-hover rounded-lg border border-[#DCD7CB] p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 group"
      >
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold bg-[#8A6D1F] text-[#F7F5F0] shrink-0 self-start sm:self-center">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Prochain atelier</span>
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <h2 className="text-sm sm:text-lg font-heading font-bold text-[#16233A] truncate group-hover:text-[#8A6D1F] transition-colors">
            {atelier.title}
          </h2>
          <p className="text-[11px] sm:text-xs text-[#5C6672] flex items-center gap-3 flex-wrap">
            {atelier.event_date && (
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-[#8A6D1F]" />
                {formatDateTime(atelier.event_date)}
              </span>
            )}
            {atelier.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#8A6D1F]" />
                {atelier.location}
              </span>
            )}
            <span>{atelier.rsvp_count} participant{atelier.rsvp_count > 1 ? "s" : ""}</span>
          </p>
        </div>
        <span className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#8A6D1F] shrink-0">
          <span>Je participe</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </Link>
    </section>
  );
}
