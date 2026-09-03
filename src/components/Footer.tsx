import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Youtube, Award, MapPin, Heart, ArrowUpRight } from "lucide-react";
import type { NavItem } from "@/data/siteConfig";
import { siteConfig } from "@/data/siteConfig";
import type { PartnerCard } from "@/lib/types";

export default function Footer({
  navItems = siteConfig.navItems,
  tagline,
  sponsor,
  partnerClub,
}: {
  navItems?: NavItem[];
  /** Console-edited hero tagline; undefined = default. */
  tagline?: string;
  /** Console-edited partners; empty name hides the card, undefined = default. */
  sponsor?: PartnerCard;
  partnerClub?: PartnerCard;
}) {
  const sponsorCard = sponsor ?? siteConfig.sponsor;
  const partnerCard = partnerClub ?? siteConfig.partnerClub;
  const hasPartnerColumn = Boolean(sponsorCard.name || partnerCard.name);
  return (
    <footer className="bg-[#16233A] text-[#C9CFD9] mt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-6">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${
            hasPartnerColumn ? "lg:grid-cols-4" : "lg:grid-cols-3"
          } gap-6 sm:gap-8 mb-6 sm:mb-8`}
        >
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#3D4A58]">
                <Image
                  src="/logo.png"
                  alt="DTC Logo"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="leading-tight">
                <span className="font-heading text-base text-[#F7F5F0] block">
                  Dentalk <span className="text-[#D4AF37]">Club</span>
                </span>
                <span className="text-[10px] text-[#8E99A8] tracking-[0.14em] uppercase block">
                  FMDC Casablanca
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-[#AEB6C2]">
              Club d&apos;éloquence, débats et événements académiques de la Faculté de Médecine
              Dentaire de Casablanca (UH2C).
            </p>
            <p className="text-xs font-heading italic text-[#D4AF37]">
              &laquo;&nbsp;{tagline?.trim() || siteConfig.tagline}&nbsp;&raquo;
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h3 className="text-[#F7F5F0] font-semibold text-xs sm:text-sm mb-3.5 sm:mb-5 tracking-wide">
              Navigation
            </h3>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex items-center py-1.5 hover:text-[#D4AF37] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Partners & Sponsors (hidden entirely when both removed) */}
          {hasPartnerColumn && (
          <div>
            <h3 className="text-[#F7F5F0] font-semibold text-xs sm:text-sm mb-3.5 sm:mb-5 tracking-wide">
              Partenaires & Sponsors
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              {sponsorCard.name && (
              <div className="p-3 rounded-md bg-[#1E2E47] border border-[#3D4A58]">
                <div className="flex items-center gap-2 text-[#F7F5F0] font-semibold text-xs sm:text-sm">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
                  <span>{sponsorCard.name}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#8E99A8] mt-0.5">
                  {sponsorCard.tagline}
                </p>
              </div>
              )}

              {partnerCard.name && (
              <div className="p-3 rounded-md bg-[#1E2E47] border border-[#3D4A58]">
                <div className="flex items-center gap-2 text-[#F7F5F0] font-semibold text-xs sm:text-sm">
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
                  <span>{partnerCard.name}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#8E99A8] mt-0.5">
                  {partnerCard.tagline}
                </p>
              </div>
              )}
            </div>
          </div>
          )}

          {/* Col 4: Location & Social */}
          <div>
            <h3 className="text-[#F7F5F0] font-semibold text-xs sm:text-sm mb-3.5 sm:mb-5 tracking-wide">
              Campus & Réseaux
            </h3>
            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-start gap-2 text-[11px] sm:text-xs text-[#AEB6C2]">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Faculté de Médecine Dentaire de Casablanca, Rue Abou Al Alaa Zahar, 20250 Casablanca</span>
              </div>

              <div className="pt-1 flex items-center gap-2.5">
                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1E2E47] text-[#F7F5F0] hover:text-[#D4AF37] border border-[#3D4A58] text-xs font-medium transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>

                <a
                  href={siteConfig.youtubeChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1E2E47] text-[#F7F5F0] hover:text-[#D4AF37] border border-[#3D4A58] text-xs font-medium transition-colors"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>YouTube</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="border-t border-[#3D4A58] pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-[#8E99A8] gap-2">
          <p>© 2026 Dentalk Club FMDC. Tous droits réservés.</p>
          <p className="flex items-center gap-1">Fait avec passion par et pour les étudiants de la FMDC</p>
        </div>
      </div>
    </footer>
  );
}
