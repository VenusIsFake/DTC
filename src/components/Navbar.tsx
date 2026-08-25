"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X, Mic, ExternalLink, LogIn, LogOut, User, Users, ShieldCheck, ShieldAlert } from "lucide-react";
import type { NavItem } from "@/data/siteConfig";
import { siteConfig } from "@/data/siteConfig";
import { useAuth } from "@/components/auth/AuthProvider";
import UserAvatar from "@/components/UserAvatar";

export default function Navbar({ navItems }: { navItems: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, profile, loading, dbReady, isAdmin, isBanned, signOut, openAuth } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // The navbar never unmounts across navigations, so drawers must be closed
  // explicitly on route change.
  useEffect(() => {
    setIsOpen(false);
    setMenuOpen(false);
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

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest("[data-user-menu]")) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const accountLinks = [
    { href: "/espace", label: "Mon espace", icon: User },
    { href: "/espace/annuaire", label: "Annuaire", icon: Users },
    ...(isAdmin ? [{ href: "/admin", label: "Console", icon: ShieldCheck }] : []),
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[#0B132B]/95 backdrop-blur-md border-b border-[#385A75]/30 shadow-lg shadow-black/20 py-2 sm:py-3"
          : "bg-transparent py-2.5 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
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
        <nav className="hidden lg:flex items-center gap-0.5 bg-[#0F172A]/70 backdrop-blur-md border border-[#385A75]/30 px-2.5 py-1.5 rounded-full shadow-inner">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 xl:px-3 py-1.5 rounded-full text-[11px] xl:text-xs font-medium transition-all duration-200 ${
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

        {/* Right: auth + CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-3">
            {dbReady && !user && !loading && (
              <button
                onClick={() => openAuth()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Se connecter</span>
              </button>
            )}
            {user && (
              <div className="relative" data-user-menu>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="Menu du compte"
                  className="flex items-center gap-2 px-1.5 py-1 rounded-full border border-[#385A75]/50 hover:border-[#D4AF37]/50 bg-[#0F172A]/70 transition-all"
                >
                  <UserAvatar name={profile?.full_name} src={profile?.avatar_url} size={28} />
                  <span className="max-w-[110px] truncate text-xs font-semibold text-white hidden xl:inline">
                    {profile?.full_name?.split(" ")[0] ?? "Membre"}
                  </span>
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+8px)] w-52 glass-card rounded-xl border border-[#385A75]/50 shadow-2xl p-1.5 space-y-0.5 animate-fadeIn"
                  >
                    <div className="px-2.5 py-2 border-b border-[#385A75]/30 mb-1">
                      <p className="text-xs font-bold text-white truncate">{profile?.full_name || "Membre DTC"}</p>
                      <p className="text-[10px] text-[#94A3B8] truncate">{profile?.email || user.email}</p>
                      {isBanned && (
                        <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-red-400">
                          <ShieldAlert className="w-3 h-3" /> Compte suspendu
                        </p>
                      )}
                    </div>
                    {accountLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        role="menuitem"
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-[#E2E8F0] hover:bg-[#1B2E4B] hover:text-[#D4AF37] transition-colors"
                      >
                        <link.icon className="w-3.5 h-3.5" />
                        <span>{link.label}</span>
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      role="menuitem"
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-[#94A3B8] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            )}

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

          {/* Mobile: compact auth button */}
          {dbReady && !user && !loading && (
            <button
              onClick={() => openAuth()}
              aria-label="Se connecter"
              className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border border-[#D4AF37]/50 text-[#D4AF37] active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Se connecter</span>
            </button>
          )}
          {user && (
            <Link
              href="/espace"
              aria-label="Mon espace"
              className="lg:hidden active:scale-95"
              onClick={() => setIsOpen(false)}
            >
              <UserAvatar name={profile?.full_name} src={profile?.avatar_url} size={32} />
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 -m-1 rounded-lg text-[#E2E8F0] hover:text-white hover:bg-[#1B2E4B]/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            aria-label={isOpen ? "Fermer le menu de navigation" : "Ouvrir le menu de navigation"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
          >
            {isOpen ? <X className="w-5 h-5 text-[#D4AF37]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div
          id="mobile-nav"
          className="lg:hidden bg-[#0B132B]/98 backdrop-blur-xl border-b border-[#385A75]/40 px-4 pt-2.5 pb-5 space-y-1.5 mt-2 shadow-2xl max-h-[80dvh] overflow-y-auto"
        >
          {navItems.map((item) => {
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
          <div className="pt-2 border-t border-[#385A75]/30 mt-2 space-y-1.5">
            {user ? (
              <>
                {accountLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#E2E8F0] hover:bg-white/5 hover:text-[#D4AF37] transition-all"
                  >
                    <link.icon className="w-4 h-4 text-[#D4AF37]" />
                    <span>{link.label}</span>
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#94A3B8] hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : null}
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
