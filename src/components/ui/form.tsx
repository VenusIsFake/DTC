"use client";

import React from "react";

/** Shared form styling bits for club-platform modals & admin console. */

export const inputClass =
  "w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-[#385A75]/50 text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 disabled:opacity-50";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="text-[11px] font-semibold text-[#CBD5E1] block">
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-[#64748B]">{hint}</p>}
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#0B132B] hover:brightness-110 shadow-md shadow-[#D4AF37]/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full font-semibold text-xs border border-[#385A75]/60 text-[#CBD5E1] hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

const badgeStyles: Record<string, string> = {
  gold: "bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30",
  blue: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  red: "bg-red-500/15 text-red-300 border-red-500/30",
  gray: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export function Badge({
  tone = "gray",
  children,
  className = "",
}: {
  tone?: keyof typeof badgeStyles;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyles[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
