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
    <div className="pt-8 sm:pt-12 pb-10 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-12">
      {/* Header Banner */}
      <div className="max-w-2xl mx-auto space-y-2 sm:space-y-4">
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#755B18]">Archives Visuelles & Moments Forts</p>
        <h1 className="font-heading font-semibold text-3xl sm:text-5xl text-[#16233A] tracking-tight">
          Galerie Média
        </h1>
        <p className="text-xs sm:text-base text-[#5C6672] leading-relaxed">
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
                ? "bg-[#755B18] text-[#F7F5F0] shadow-md shadow-[#755B18]/20 scale-105"
                : "glass-card text-[#3D4A58] hover:text-[#16233A] hover:border-[#DCD7CB]"
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
            className="glass-card glass-card-hover rounded-xl sm:rounded-lg overflow-hidden border border-[#DCD7CB]/40 flex flex-col group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#755B18]"
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
                  <Maximize2 className="w-3 h-3 text-[#755B18]" />
                  <span>Agrandir</span>
                </span>
              </div>
            </div>

            {/* Metadata Info */}
            <div className="p-2.5 sm:p-4 space-y-1 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[9px] sm:text-[11px] font-bold text-[#755B18] block uppercase tracking-wider">
                  {item.categoryLabel}
                </span>
                <h3 className="text-xs sm:text-sm font-heading font-bold text-[#16233A] group-hover:text-[#755B18] transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-[#5C6672] line-clamp-2 mt-0.5">
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
