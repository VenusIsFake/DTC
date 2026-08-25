"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Maximize2 } from "lucide-react";
import type { GalleryItem } from "@/data/galleryData";
import ImageLightbox from "@/components/ImageLightbox";

type CategoryFilter = "all" | "tedx" | "podcast" | "debates" | "team" | "awards";

export default function GalleryClient({ initialItems }: { initialItems: GalleryItem[] }) {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const categories = [
    { key: "all", label: "Tous" },
    { key: "tedx", label: "TEDx" },
    { key: "podcast", label: "Podcast" },
    { key: "debates", label: "Débats" },
    { key: "team", label: "Club" },
    { key: "awards", label: "Trophées" },
  ];

  const filteredItems = filter === "all"
    ? initialItems
    : initialItems.filter((item) => item.category === filter);

  return (
    <div className="pt-16 sm:pt-28 pb-10 sm:pb-20 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Archives Visuelles & Moments Forts</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-heading font-extrabold text-white">
          Galerie <span className="gold-gradient-text">Média</span>
        </h1>
        <p className="text-xs sm:text-base text-[#94A3B8] leading-relaxed">
          Plongez dans les souvenirs visuels, les événements académiques et la vie associative de Dentalk Club FMDC.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key as CategoryFilter)}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              filter === cat.key
                ? "bg-[#D4AF37] text-[#0B132B] shadow-md shadow-[#D4AF37]/20 scale-105"
                : "glass-card text-[#CBD5E1] hover:text-white hover:border-[#385A75]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            aria-label={`Agrandir : ${item.title}`}
            onClick={() => setActiveItem(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveItem(item);
              }
            }}
            className="glass-card glass-card-hover rounded-xl sm:rounded-2xl overflow-hidden border border-[#385A75]/40 flex flex-col group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            {/* Image Box */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5 sm:p-4">
                <span className="text-[10px] sm:text-xs font-semibold text-white bg-black/60 px-2 py-0.5 rounded flex items-center gap-1">
                  <Maximize2 className="w-3 h-3 text-[#D4AF37]" />
                  <span>Agrandir</span>
                </span>
              </div>
            </div>

            {/* Metadata Info */}
            <div className="p-2.5 sm:p-4 space-y-1 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[9px] sm:text-[11px] font-bold text-[#D4AF37] block uppercase tracking-wider">
                  {item.categoryLabel}
                </span>
                <h3 className="text-xs sm:text-sm font-heading font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-[#94A3B8] line-clamp-2 mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Component */}
      <ImageLightbox item={activeItem} onClose={() => setActiveItem(null)} />
    </div>
  );
}
