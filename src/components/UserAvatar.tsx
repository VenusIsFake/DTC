import React from "react";
import Image from "next/image";
import { initials } from "@/lib/format";

interface UserAvatarProps {
  name: string | null | undefined;
  src: string | null | undefined;
  size?: number;
  className?: string;
}

/** Round avatar with initials fallback; sizes are exact px on both axes. */
export default function UserAvatar({ name, src, size = 36, className = "" }: UserAvatarProps) {
  const dimension = `${size}px`;
  if (src) {
    return (
      <span
        className={`relative inline-block rounded-full overflow-hidden border border-[#D4AF37]/40 shrink-0 ${className}`}
        style={{ width: dimension, height: dimension }}
      >
        <Image src={src} alt={name ?? "Avatar"} fill sizes={`${size}px`} className="object-cover" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full bg-[#1B2E4B] border border-[#385A75]/60 text-[#D4AF37] font-bold shrink-0 ${className}`}
      style={{ width: dimension, height: dimension, fontSize: Math.max(10, size * 0.38) }}
    >
      {initials(name)}
    </span>
  );
}
