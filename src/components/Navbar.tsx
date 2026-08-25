"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X, Mic, ExternalLink } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // The navbar never unmounts across navigations, so the drawer must be
  // closed explicitly on route change, outside taps and Escape.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest("header")) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("click", onDocClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[#0B132B]/95 backdrop-blur-md border-b border-[#385A75]/30 shadow-lg shadow-black/20 py-2 sm:py-3"
          : "bg-transparent py-2.5 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-[#D4AF37]/50 shadow-md group-hover:border-[#D4AF37] transition-all shrink-0">
            <Image
              src="/logo.png"
              alt="Dentalk Club FMDC Logo"
              fill
              sizes="(max-width: 640px) 32px, 40px"
              className="object-cover"
              priority
            />
          </div>
          <div>
            <span className="font-heading font-extrabold text-sm sm:text-xl tracking-wider text-white flex items-center gap-1">
              DENTALK <span className="text-[#D4AF37]">CLUB</span>
            </span>
            <span className="text-[9px] sm:text-xs text-[#94A3B8] font-medium tracking-widest block uppercase">
              FMDC CASABLANCA
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0F172A]/70 backdrop-blur-md border border-[#385A75]/30 px-3 py-1.5 rounded-full shadow-inner">
          {siteConfig.navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#1B2E4B] text-[#D4AF37] shadow-sm font-semibold border border-[#D4AF37]/30"
                    : "text-[#E2E8F0] hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Button */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#0B132B] hover:brightness-110 transition-all shadow-md shadow-[#D4AF37]/10"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Instagram</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-3 -m-1 rounded-lg text-[#E2E8F0] hover:text-white hover:bg-[#1B2E4B]/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          aria-label={isOpen ? "Fermer le menu de navigation" : "Ouvrir le menu de navigation"}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
        >
          {isOpen ? <X className="w-5 h-5 text-[#D4AF37]" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div id="mobile-nav" className="md:hidden bg-[#0B132B]/98 backdrop-blur-xl border-b border-[#385A75]/40 px-4 pt-2.5 pb-5 space-y-1.5 mt-2 shadow-2xl">
          {siteConfig.navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#1B2E4B] text-[#D4AF37] border-l-4 border-[#D4AF37] font-semibold"
                    : "text-[#E2E8F0] hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#385A75]/30 mt-2">
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#0B132B] shadow-md"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Suivre @dentalkclub_fmdc</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
