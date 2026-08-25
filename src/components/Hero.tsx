"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Sparkles, ArrowRight, Mic, Calendar } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";

export default function Hero() {
  return (
    <section className="relative pt-20 sm:pt-28 pb-2 sm:pb-10 px-3.5 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Decorative Lighting Gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[600px] h-[240px] sm:h-[600px] bg-[#1B2E4B]/40 rounded-full blur-[70px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[160px] sm:w-[350px] h-[160px] sm:h-[350px] bg-[#D4AF37]/10 rounded-full blur-[50px] sm:blur-[120px] pointer-events-none" />
      
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1B2E4B15_1px,transparent_1px),linear-gradient(to_bottom,#1B2E4B15_1px,transparent_1px)] bg-[size:2rem_2rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-3 sm:space-y-6">
        {/* Top Official Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B2E4B]/90 border border-[#D4AF37]/40 shadow-inner">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          <span className="text-[10px] sm:text-xs font-semibold text-[#CBD5E1] tracking-wide">
            Faculté de Médecine Dentaire de Casablanca
          </span>
        </div>

        {/* Central Logo & Emblem */}
        <div className="animate-fade-in-up animation-delay-100 flex justify-center">
          <div className="relative w-16 h-16 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-[#1B2E4B] via-[#D4AF37]/40 to-[#385A75] shadow-xl shadow-[#0B132B]/80 group">
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-inner bg-[#0B132B]">
              <Image
                src="/logo.png"
                alt="Dentalk Club FMDC Logo"
                fill
                sizes="(max-width: 640px) 64px, 128px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
          </div>
        </div>

        {/* Main Title & Slogan */}
        <div className="animate-fade-in-up animation-delay-200 space-y-1.5 sm:space-y-3">
          <h1 className="text-2xl sm:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-white leading-tight">
            DENTALK <span className="gold-gradient-text">CLUB</span>
          </h1>
          <p className="text-xs sm:text-xl text-[#E2E8F0] font-medium italic max-w-2xl mx-auto px-2">
            &ldquo;{siteConfig.tagline}&rdquo;
          </p>
          <p className="text-[11px] sm:text-base text-[#94A3B8] max-w-2xl mx-auto leading-relaxed px-2">
            Le club d&apos;éloquence, débats d&apos;idées et production multimédia des étudiants en médecine dentaire de Casablanca.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="animate-fade-in-up animation-delay-300 flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-1 px-1">
          <Link
            href="/events"
            className="flex items-center gap-1.5 px-3.5 sm:px-7 py-2 sm:py-3.5 rounded-full font-semibold text-xs sm:text-sm bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#D4AF37] text-[#0B132B] hover:brightness-110 shadow-md shadow-[#D4AF37]/20 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>TEDxFMDC</span>
          </Link>

          <Link
            href="/podcast"
            className="flex items-center gap-1.5 px-3.5 sm:px-6 py-2 sm:py-3.5 rounded-full font-semibold text-xs sm:text-sm bg-[#1B2E4B] text-white hover:text-[#D4AF37] border border-[#385A75]/50 hover:border-[#D4AF37]/50 transition-all hover:bg-[#1B2E4B]/80 active:scale-95"
          >
            <Mic className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Podcast</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <Link
            href="/about"
            className="flex items-center gap-1.5 px-3 sm:px-6 py-2 sm:py-3.5 rounded-full font-semibold text-xs sm:text-sm bg-transparent text-[#CBD5E1] hover:text-white border border-[#385A75]/30 hover:border-[#385A75] transition-all active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>À Propos</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
