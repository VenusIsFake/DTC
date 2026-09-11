"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X, Instagram, LogIn, LogOut, User, Users, ShieldCheck, ShieldAlert } from "lucide-react";
import type { NavItem } from "@/data/siteConfig";
import { siteConfig } from "@/data/siteConfig";
import { useAuth } from "@/components/auth/AuthProvider";
import UserAvatar from "@/components/UserAvatar";

export default function Navbar({ navItems }: { navItems: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, profile, loading, dbReady, isBureau, isBanned, signOut, openAuth } = useAuth();

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
    ...(isBureau ? [{ href: "/admin", label: "Console", icon: ShieldCheck }] : []),
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-dtc-paper/95 backdrop-blur-sm border-b border-dtc-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 h-16">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-dtc-line group-hover:border-dtc-gold transition-colors shrink-0">
            <Image
              src={siteConfig.assetUrl("/logo.png")}
              alt="Dentalk Club FMDC Logo"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </div>
          <div className="leading-tight">
            <span className="font-heading text-[15px] sm:text-base text-dtc-ink">
              Dentalk <span className="text-dtc-gold">Club</span>
            </span>
            <span className="block text-[10px] sm:text-[11px] text-dtc-inkMuted tracking-[0.14em] uppercase">
              FMDC Casablanca
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/annonces" && pathname.startsWith("/idees"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-[13px] transition-colors pb-0.5 -mb-px border-b ${
                  isActive
                    ? "text-dtc-ink font-semibold border-dtc-gold"
                    : "text-dtc-inkMuted hover:text-dtc-ink border-transparent hover:border-dtc-line"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: auth + social */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-2">
            {dbReady && !user && !loading && (
              <button
                onClick={() => openAuth()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-dtc-ink text-dtc-paper hover:bg-dtc-steel transition-colors"
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
                  className="flex items-center gap-2 px-1.5 py-1 rounded-md border border-dtc-line bg-white hover:border-dtc-gold transition-colors"
                >
                  <UserAvatar name={profile?.full_name} src={profile?.avatar_url} size={28} />
                  <span className="max-w-[110px] truncate text-xs font-semibold text-dtc-ink hidden xl:inline">
                    {profile?.full_name?.split(" ")[0] ?? "Membre"}
                  </span>
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white rounded-lg border border-dtc-line shadow-lg p-1.5 space-y-0.5 animate-drop-in"
                  >
                    <div className="px-2.5 py-2 border-b border-dtc-line mb-1">
                      <p className="text-xs font-bold text-dtc-ink truncate">{profile?.full_name || "Membre DTC"}</p>
                      <p className="text-[10px] text-dtc-inkMuted truncate">{profile?.email || user.email}</p>
                      {isBanned && (
                        <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-red-700">
                          <ShieldAlert className="w-3 h-3" /> Compte suspendu
                        </p>
                      )}
                    </div>
                    {accountLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        role="menuitem"
                        className="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium text-dtc-lineDark hover:bg-dtc-wash hover:text-dtc-ink transition-colors"
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
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium text-dtc-inkMuted hover:bg-red-50 hover:text-red-700 transition-colors"
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
              aria-label="Instagram du club"
              className="flex items-center justify-center w-8 h-8 rounded-md text-dtc-inkMuted hover:text-dtc-gold hover:bg-dtc-wash transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile: compact auth button */}
          {dbReady && !user && !loading && (
            <button
              onClick={() => openAuth()}
              aria-label="Se connecter"
              className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold bg-dtc-ink text-dtc-paper"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Se connecter</span>
            </button>
          )}
          {user && (
            <Link
              href="/espace"
              aria-label="Mon espace"
              className="lg:hidden flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <UserAvatar name={profile?.full_name} src={profile?.avatar_url} size={32} />
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 -m-1 rounded-md text-dtc-ink hover:bg-dtc-wash transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dtc-gold"
            aria-label={isOpen ? "Fermer le menu de navigation" : "Ouvrir le menu de navigation"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div
          id="mobile-nav"
          className="lg:hidden bg-dtc-paper border-b border-dtc-line px-4 pt-2 pb-5 space-y-0.5 shadow-lg max-h-[80dvh] overflow-y-auto animate-drop-in"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/annonces" && pathname.startsWith("/idees"));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-dtc-wash text-dtc-ink font-semibold border-l-2 border-dtc-gold"
                    : "text-dtc-lineDark hover:bg-dtc-wash hover:text-dtc-ink border-l-2 border-transparent"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-dtc-line mt-2 space-y-0.5">
            {user ? (
              <>
                {accountLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-dtc-lineDark hover:bg-dtc-wash hover:text-dtc-ink transition-colors"
                  >
                    <link.icon className="w-4 h-4 text-dtc-gold" />
                    <span>{link.label}</span>
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-dtc-inkMuted hover:bg-red-50 hover:text-red-700 transition-colors"
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
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-md text-xs font-semibold border border-dtc-line text-dtc-lineDark hover:border-dtc-gold hover:text-dtc-gold transition-colors"
            >
              <Instagram className="w-4 h-4" />
              <span>@dentalkclub_fmdc</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
