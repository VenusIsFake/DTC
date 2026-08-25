"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize, ExternalLink } from "lucide-react";
import { TedxTalk } from "@/data/tedxData";
import { useOverlayDialog } from "@/hooks/useOverlayDialog";

interface VideoPlayerModalProps {
  talk: TedxTalk | null;
  onClose: () => void;
}

interface IOSVideo extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
  webkitRequestFullscreen?: () => void;
}

export default function VideoPlayerModal({ talk, onClose }: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useOverlayDialog<HTMLDivElement>(talk !== null, onClose);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Default to muted for universal Safari autoplay compliance

  // Always start muted: iOS rejects unmuted autoplay, so an unmuted state
  // carried over from a previous open would leave the next talk stuck on its poster.
  useEffect(() => {
    if (talk && videoRef.current) {
      videoRef.current.muted = true;
      setIsMuted(true);
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [talk]);

  if (!talk) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMute = !videoRef.current.muted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const toggleFullscreen = () => {
    const v = videoRef.current as IOSVideo | null;
    if (!v) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
      return;
    }
    try {
      if (v.requestFullscreen) {
        v.requestFullscreen().catch(() => {});
      } else if (v.webkitEnterFullscreen) {
        v.webkitEnterFullscreen(); // Native iOS Safari fullscreen
      } else if (v.webkitRequestFullscreen) {
        v.webkitRequestFullscreen();
      }
    } catch {
      // iOS throws InvalidStateError when already fullscreen or metadata is not loaded yet.
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Backdrop overlay click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={talk.topic}
        className="relative z-10 w-full max-w-2xl bg-[#0B132B] border border-[#385A75]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90dvh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          data-autofocus
          className="absolute top-2.5 right-2.5 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/60 text-white hover:text-[#D4AF37] hover:bg-black/80 transition-all focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Video Reel Player (720x1280 Aspect 9:16) */}
        <div className="relative w-full md:w-1/2 bg-black flex items-center justify-center aspect-[9/16] max-h-[440px] md:max-h-[600px] overflow-hidden group">
          <video
            ref={videoRef}
            src={talk.videoUrl}
            poster={talk.posterUrl}
            autoPlay
            playsInline
            webkit-playsinline="true"
            muted={isMuted}
            controls={false}
            loop
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Video Control Bar Overlay */}
          <div className="absolute bottom-0 inset-x-0 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              onClick={togglePlay}
              className="w-11 h-11 flex items-center justify-center rounded-full text-white hover:text-[#D4AF37] transition-colors focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
              aria-label={isPlaying ? "Pause" : "Lecture"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="w-11 h-11 flex items-center justify-center rounded-full text-white hover:text-[#D4AF37] transition-colors focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                aria-label={isMuted ? "Activer le son" : "Couper le son"}
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-amber-400" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleFullscreen}
                className="w-11 h-11 flex items-center justify-center rounded-full text-white hover:text-[#D4AF37] transition-colors focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                aria-label="Plein écran"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Talk Details & Notes */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-3 sm:space-y-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                TEDxFMDC · Extrait {talk.extractNumber}/8
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1B2E4B] text-[#94A3B8]">
                {talk.language}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-heading font-bold text-white leading-snug">
              {talk.topic}
            </h2>

            <div className="text-xs sm:text-sm font-semibold text-[#CBD5E1]">
              Orateur: <span className="text-[#D4AF37]">{talk.speaker}</span>
            </div>

            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              {talk.description}
            </p>
          </div>

          <div className="pt-3 sm:pt-4 border-t border-[#385A75]/30 space-y-2.5">
            <a
              href={talk.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#1B2E4B] hover:bg-[#1B2E4B]/80 text-white hover:text-[#D4AF37] border border-[#385A75]/40 text-xs font-semibold transition-all shadow-sm active:scale-95"
            >
              <span>Voir le Reel officiel sur Instagram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <p className="text-[10px] sm:text-[11px] text-center text-[#94A3B8]">
              Enregistré en direct à l&apos;Amphithéâtre FMDC Casablanca · 22 Nov 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
