import type { Metadata } from "next";
import GalleryClient from "@/components/gallery/GalleryClient";
import { getGalleryImages } from "@/lib/data";

export const metadata: Metadata = {
  title: "Galerie Média",
  description:
    "Archives visuelles du Dentalk Club FMDC : TEDxFMDC, podcasts, débats, vie du club et cérémonies de remise de trophées.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  // DB-driven with static fallback (see src/lib/data.ts) — the gallery can
  // now be curated from the /admin console without a deploy.
  const items = await getGalleryImages();
  return <GalleryClient initialItems={items} />;
}
