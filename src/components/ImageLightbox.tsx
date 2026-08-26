"use client";

import React from "react";
import Image from "next/image";
import { X, Calendar, Tag } from "lucide-react";
import { GalleryItem } from "@/data/galleryData";
import { useOverlayDialog } from "@/hooks/useOverlayDialog";

interface ImageLightboxProps {
  item: GalleryItem | null;
  onClose: () => void;
}

export default function ImageLightbox({ item, onClose }: ImageLightboxProps) {
  const dialogRef = useOverlayDialog<HTMLDivElement>(item !== null, onClose);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2.5 sm:p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className="relative z-10 w-full max-w-4xl bg-[#F7F5F0] border border-[#DCD7CB]/50 rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row max-h-[90dvh]"
      >
        <button
          onClick={onClose}
          data-autofocus
          aria-label="Fermer"
          className="absolute top-2.5 right-2.5 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/60 text-white hover:text-[#755B18] hover:bg-black/80 transition-all focus-visible:ring-2 focus-visible:ring-[#755B18]"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Full Image */}
        <div className="relative w-full md:w-3/5 bg-black min-h-[250px] sm:min-h-[300px] md:min-h-[500px]">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-contain"
            priority
          />
        </div>

        {/* Content Info */}
        <div className="w-full md:w-2/5 p-4 sm:p-6 flex flex-col justify-between space-y-3 sm:space-y-4 bg-white">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-[#755B18]/15 text-[#755B18] border border-[#755B18]/30">
                <Tag className="w-3 h-3" />
                <span>{item.categoryLabel}</span>
              </span>
              {item.date && (
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-[#5C6672]">
                  <Calendar className="w-3 h-3 text-[#755B18]" />
                  <span>{item.date}</span>
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-xl font-heading font-bold text-[#16233A] leading-snug">
              {item.title}
            </h3>

            <p className="text-xs sm:text-sm text-[#3D4A58] leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="pt-3 sm:pt-4 border-t border-[#DCD7CB]/30">
            <p className="text-[10px] sm:text-xs text-[#5C6672]">
              Dentalk Club FMDC · Archive Officielle Instagram
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
