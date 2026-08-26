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
        className={`relative inline-block rounded-full overflow-hidden border border-[#755B18]/40 shrink-0 ${className}`}
        style={{ width: dimension, height: dimension }}
      >
        <Image src={src} alt={name ?? "Avatar"} fill sizes={`${size}px`} className="object-cover" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full bg-[#EFECE4] border border-[#DCD7CB]/60 text-[#755B18] font-bold shrink-0 ${className}`}
      style={{ width: dimension, height: dimension, fontSize: Math.max(10, size * 0.38) }}
    >
      {initials(name)}
    </span>
  );
}
