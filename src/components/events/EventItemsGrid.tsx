"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import type { EventPageItem } from "@/lib/types";
import { useOverlayDialog } from "@/hooks/useOverlayDialog";
import { parseYouTubeId } from "@/lib/format";

/** Talks grid + video modal for a dynamic event page (local MP4 or YouTube). */
export default function EventItemsGrid({ items }: { items: EventPageItem[] }) {
  const [active, setActive] = useState<EventPageItem | null>(null);
  const dialogRef = useOverlayDialog<HTMLDivElement>(active !== null, () => setActive(null));
  const activeYouTube = active ? parseYouTubeId(active.video_url) : null;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {items.map((item) => {
          const isYouTube = Boolean(parseYouTubeId(item.video_url));
          return (
            <button
              key={item.id}
              onClick={() => setActive(item)}
              aria-label={`Regarder : ${item.title}`}
              className="glass-card glass-card-hover rounded-xl sm:rounded-lg overflow-hidden border border-[#DCD7CB]/40 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#755B18]"
            >
              <div className="relative aspect-video w-full bg-black">
                {item.poster_url ? (
                  <Image
                    src={item.poster_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#EFECE4]/60">
                    <Play className="w-8 h-8 text-[#755B18] fill-current" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#755B18] text-[#F7F5F0] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
                  </div>
                </div>
                {isYouTube && (
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/80 text-white">
                    YouTube
                  </span>
                )}
              </div>
              <div className="p-3.5 sm:p-4 space-y-1">
                {item.speaker && (
                  <span className="text-[11px] sm:text-xs font-semibold text-[#755B18] block truncate">
                    {item.speaker}
                  </span>
                )}
                <h3 className="text-sm sm:text-base font-heading font-bold text-[#16233A] group-hover:text-[#755B18] transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-[11px] sm:text-xs text-[#5C6672] line-clamp-2">{item.description}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Vidéo — ${active.title}`}
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fadeIn"
        >
          <div className="absolute inset-0" onClick={() => setActive(null)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-4xl space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                {active.speaker && (
                  <p className="text-xs font-semibold text-[#755B18] truncate">{active.speaker}</p>
                )}
                <h3 className="text-sm sm:text-lg font-heading font-bold text-[#16233A] truncate">{active.title}</h3>
              </div>
              <button
                onClick={() => setActive(null)}
                aria-label="Fermer"
                data-autofocus
                className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-red-600/90 text-white hover:bg-red-600 transition-colors shadow-lg active:scale-95"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-xl sm:rounded-lg overflow-hidden border border-[#DCD7CB]/50 bg-black shadow-lg">
              {activeYouTube ? (
                <iframe
                  key={active.id}
                  src={`https://www.youtube.com/embed/${activeYouTube}?rel=0&playsinline=1`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                // iOS invariants: muted + playsInline + webkit-playsinline.
                <video
                  key={active.id}
                  src={active.video_url}
                  poster={active.poster_url || undefined}
                  controls
                  autoPlay
                  muted
                  playsInline
                  webkit-playsinline="true"
                  className="w-full h-full object-contain bg-black"
                />
              )}
            </div>

            {active.description && (
              <p className="text-xs sm:text-sm text-[#3D4A58] leading-relaxed px-1">{active.description}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
