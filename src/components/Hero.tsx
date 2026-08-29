"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mic } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";

export default function Hero({ eventsVisible = true }: { eventsVisible?: boolean }) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-12 pb-0">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-16 items-center">
        {/* Text column */}
        <div className="max-w-2xl">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#755B18]">
            Faculté de Médecine Dentaire de Casablanca
          </p>

          <h1 className="mt-3 font-heading font-semibold text-4xl sm:text-6xl lg:text-[4.25rem] text-[#16233A] leading-[1.05] tracking-tight">
            Dentalk Club
          </h1>

          <p className="mt-4 font-heading italic text-lg sm:text-2xl text-[#3D4A58]">
            &laquo;&nbsp;{siteConfig.tagline}&nbsp;&raquo;
          </p>

          <p className="mt-4 text-sm sm:text-base text-[#5C6672] leading-relaxed max-w-xl">
            Le club d&apos;éloquence, de débats d&apos;idées et de production multimédia des étudiants
            en médecine dentaire de Casablanca.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={eventsVisible ? "/events" : "/annonces"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold bg-[#16233A] text-[#F7F5F0] hover:bg-[#233753] transition-colors"
            >
              <span>{eventsVisible ? "TEDxFMDC" : "Ateliers"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/podcast"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#16233A] border-b border-[#755B18] pb-0.5 hover:text-[#755B18] transition-colors"
            >
              <Mic className="w-4 h-4 text-[#755B18]" />
              <span>Podcast Let&apos;s Talk</span>
            </Link>
          </div>
        </div>

        {/* Crest column */}
        <div className="hidden lg:flex justify-center items-center pr-4 select-none">
          <div className="relative w-56 xl:w-64 aspect-square">
            <div className="absolute inset-0 rounded-full border border-[#DCD7CB]" />
            <div className="absolute inset-2.5 xl:inset-3 rounded-full border border-[#755B18]/30" />
            <div className="absolute inset-0 m-auto w-36 xl:w-44 h-36 xl:h-44 rounded-full overflow-hidden border border-[#DCD7CB] shadow-sm">
              <Image
                src="/logo.png"
                alt="Dentalk Club FMDC Logo"
                fill
                sizes="(max-width: 1280px) 144px, 176px"
                className="object-cover"
                priority
              />
            </div>
            {/* Arched text following the bottom outer ring curve */}
            <svg
              viewBox="0 0 256 256"
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            >
              <defs>
                <path
                  id="depuis-arc"
                  d="M 35,182 A 108,108 0 0,0 221,182"
                  fill="none"
                />
              </defs>
              <text
                className="font-semibold uppercase fill-[#5C6672]"
                style={{ fontSize: "10.5px", letterSpacing: "0.26em" }}
              >
                <textPath
                  href="#depuis-arc"
                  startOffset="50%"
                  textAnchor="middle"
                >
                  DEPUIS 2024
                </textPath>
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
