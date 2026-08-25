"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Maximize2, X, ZoomIn, ZoomOut, RotateCcw, Sparkles } from "lucide-react";
import { useOverlayDialog } from "@/hooks/useOverlayDialog";

export default function InfographicViewer({
  imageUrl = "/media/team/bureau_executif_2025_2026.jpg",
  label = "Mandat 2025–2026",
}: {
  imageUrl?: string;
  label?: string;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useOverlayDialog<HTMLDivElement>(isFullscreen, () => setIsFullscreen(false));

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  // Keep the image anchored to the stage at any zoom level instead of
  // letting a strong swipe throw it entirely off-screen.
  const clampPosition = (x: number, y: number) => {
    const stage = stageRef.current;
    if (!stage || zoomLevel <= 1) return { x: 0, y: 0 };
    const maxX = ((zoomLevel - 1) * stage.clientWidth) / 2;
    const maxY = ((zoomLevel - 1) * stage.clientHeight) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition(clampPosition(e.clientX - dragStartRef.current.x, e.clientY - dragStartRef.current.y));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
      setPosition(
        clampPosition(e.touches[0].clientX - dragStartRef.current.x, e.touches[0].clientY - dragStartRef.current.y)
      );
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <>
      {/* On-Page Showcase Card */}
      <div className="glass-card p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#385A75]/40 shadow-2xl relative overflow-hidden space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              <Sparkles className="w-3 h-3" />
              <span>{label}</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-heading font-extrabold text-white">
              Organigramme Officiel du Bureau Exécutif
            </h3>
            <p className="text-[11px] sm:text-sm text-[#94A3B8]">
              Visualisation officielle des pôles et des responsables de section linguistique.
            </p>
          </div>

          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:px-4 rounded-xl bg-[#1B2E4B] hover:bg-[#1B2E4B]/80 text-white hover:text-[#D4AF37] border border-[#385A75]/40 text-xs font-semibold transition-all shadow-sm self-start sm:self-auto active:scale-95"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Inspecter l&apos;organigramme</span>
          </button>
        </div>

        {/* The Infographic Container */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Agrandir l'organigramme du bureau exécutif en plein écran"
          onClick={toggleFullscreen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleFullscreen();
            }
          }}
          className="relative w-full max-w-3xl mx-auto aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#385A75]/50 shadow-2xl bg-black cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
        >
          <Image
            src={imageUrl}
            alt={`${label} — Bureau Exécutif Dentalk Club FMDC`}
            fill
            sizes="(max-width: 1024px) 100vw, 768px"
            className="object-contain group-hover:scale-[1.02] transition-transform duration-300"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3 sm:p-4 pointer-events-none">
            <span className="text-xs font-semibold text-white bg-black/70 px-3 py-1.5 rounded-full border border-[#D4AF37]/40 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Cliquer pour inspecter en plein écran</span>
            </span>
          </div>
        </div>
      </div>

      {/* Fullscreen Inspection Lightbox Modal */}
      {isFullscreen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Organigramme du Bureau Exécutif en plein écran"
          className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl animate-fadeIn select-none"
        >
          {/* Backdrop Click Dismiss */}
          <div className="absolute inset-0" onClick={() => setIsFullscreen(false)} />

          {/* Top Control Bar */}
          <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-20 flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-[#1B2E4B]/90 text-white hover:text-[#D4AF37] border border-[#385A75]/50 transition-colors shadow-lg active:scale-95"
              aria-label="Zoom avant"
            >
              <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => {
                setZoomLevel((z) => {
                  const next = Math.max(z - 0.25, 0.75);
                  if (next <= 1) setPosition({ x: 0, y: 0 });
                  return next;
                });
              }}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-[#1B2E4B]/90 text-white hover:text-[#D4AF37] border border-[#385A75]/50 transition-colors shadow-lg active:scale-95"
              aria-label="Zoom arrière"
            >
              <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleReset}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-[#1B2E4B]/90 text-white hover:text-[#D4AF37] border border-[#385A75]/50 transition-colors shadow-lg active:scale-95"
              aria-label="Réinitialiser le zoom"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setIsFullscreen(false)}
              data-autofocus
              className="w-11 h-11 flex items-center justify-center rounded-full bg-red-600/90 text-white hover:bg-red-600 transition-colors shadow-lg active:scale-95"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div
            ref={stageRef}
            className={`relative z-10 w-full max-w-5xl max-h-[88dvh] aspect-square overflow-hidden flex items-center justify-center p-2 ${
              zoomLevel > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
            }`}
            style={{ touchAction: zoomLevel > 1 ? "none" : "auto" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
              className="relative w-full h-full"
            >
              <Image
                src={imageUrl}
                alt={`${label} — Bureau Exécutif plein écran`}
                fill
                sizes="100vw"
                className="object-contain pointer-events-none"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
