import type { Metadata } from "next";
import { redirect } from "next/navigation";
import GalleryClient from "@/components/gallery/GalleryClient";
import { getGalleryImages, getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Galerie Média",
  description:
    "Archives visuelles du Dentalk Club FMDC : TEDxFMDC, podcasts, débats, vie du club et cérémonies de remise de trophées.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const [settings, items] = await Promise.all([getSiteSettings(), getGalleryImages()]);
  if (!settings.gallery_visible) {
    redirect("/");
  }
  return <GalleryClient initialItems={items} />;
}
