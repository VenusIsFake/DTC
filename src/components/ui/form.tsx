"use client";

import React from "react";

/** Shared form styling bits for club-platform modals & admin console. */

export const inputClass =
  "w-full px-3 py-2 rounded-lg bg-white border border-[#DCD7CB]/50 text-sm text-[#16233A] placeholder:text-[#5F6774] focus:outline-none focus:border-[#755B18]/60 focus:ring-2 focus:ring-[#755B18]/20 disabled:opacity-50";

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
      <label htmlFor={htmlFor} className="text-[11px] font-semibold text-[#3D4A58] block">
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-[#5F6774]">{hint}</p>}
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
      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md font-bold text-xs sm:text-sm bg-[#755B18] text-[#F7F5F0] hover:brightness-110 shadow-md shadow-[#755B18]/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${props.className ?? ""}`}
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
      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md font-semibold text-xs border border-[#DCD7CB]/60 text-[#3D4A58] hover:border-[#755B18]/50 hover:text-[#755B18] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

const badgeStyles: Record<string, string> = {
  gold: "bg-[#755B18]/15 text-[#755B18] border-[#755B18]/30",
  blue: "bg-blue-600/10 text-blue-700 border-blue-500/30",
  green: "bg-emerald-600/10 text-emerald-700 border-emerald-600/30",
  red: "bg-red-500/15 text-red-700 border-red-500/30",
  gray: "bg-slate-500/10 text-slate-600 border-slate-500/30",
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
