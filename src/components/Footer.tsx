import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Youtube, Award, MapPin, Heart, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";

export default function Footer() {
  return (
    <footer className="bg-[#070C1B] border-t border-[#385A75]/30 pt-10 sm:pt-16 pb-8 sm:pb-12 text-[#94A3B8]">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 mb-6 sm:mb-12">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-2.5 sm:space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-[#D4AF37]">
                <Image
                  src="/logo.png"
                  alt="DTC Logo"
                  fill
                  sizes="(max-width: 640px) 36px, 44px"
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-heading font-extrabold text-base sm:text-lg text-white tracking-wider block">
                  DENTALK <span className="text-[#D4AF37]">CLUB</span>
                </span>
                <span className="text-[10px] sm:text-xs text-[#94A3B8] font-medium tracking-widest block uppercase">
                  FMDC CASABLANCA
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-[#CBD5E1]">
              Club d&apos;éloquence, débats et événements académiques de la Faculté de Médecine Dentaire de Casablanca (UH2C).
            </p>
            <p className="text-[11px] sm:text-xs font-semibold text-[#D4AF37] italic">
              &ldquo;{siteConfig.tagline}&rdquo;
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h3 className="text-white font-heading font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2.5 sm:mb-4 border-l-2 border-[#D4AF37] pl-2">
              Navigation
            </h3>
            <ul className="space-y-1.5 sm:space-y-2.5 text-xs sm:text-sm">
              {siteConfig.navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5"
                  >
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Partners & Sponsors */}
          <div>
            <h3 className="text-white font-heading font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2.5 sm:mb-4 border-l-2 border-[#D4AF37] pl-2">
              Partenaires & Sponsors
            </h3>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="p-2.5 sm:p-3 rounded-lg bg-[#1B2E4B]/40 border border-[#385A75]/30">
                <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
                  <span>{siteConfig.sponsor.name}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#94A3B8] mt-0.5">
                  {siteConfig.sponsor.tagline}
                </p>
              </div>

              <div className="p-2.5 sm:p-3 rounded-lg bg-[#1B2E4B]/40 border border-[#385A75]/30">
                <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
                  <span>{siteConfig.partnerClub.name}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#94A3B8] mt-0.5">
                  {siteConfig.partnerClub.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* Col 4: Location & Social */}
          <div>
            <h3 className="text-white font-heading font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2.5 sm:mb-4 border-l-2 border-[#D4AF37] pl-2">
              Campus & Réseaux
            </h3>
            <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-2 text-[11px] sm:text-xs text-[#CBD5E1]">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Faculté de Médecine Dentaire de Casablanca, Rue Abou Al Alaa Zahar, 20250 Casablanca</span>
              </div>

              <div className="pt-1 flex items-center gap-2.5">
                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B2E4B] text-white hover:text-[#D4AF37] border border-[#385A75]/40 text-xs font-medium transition-all"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>

                <a
                  href={siteConfig.youtubeChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B2E4B] text-white hover:text-[#D4AF37] border border-[#385A75]/40 text-xs font-medium transition-all"
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
        <div className="border-t border-[#385A75]/20 pt-4 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-[#94A3B8] gap-2 sm:gap-4">
          <p>© 2026 Dentalk Club FMDC. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            Fait avec passion par et pour les étudiants de la FMDC
          </p>
        </div>
      </div>
    </footer>
  );
}
