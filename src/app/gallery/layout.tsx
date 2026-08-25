import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galerie Média",
  description:
    "Archives visuelles officielles du Dentalk Club FMDC : TEDxFMDC, coulisses du Let's Talk Podcast, trophées d'éloquence et vie du club.",
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Galerie Média | Dentalk Club FMDC",
    description:
      "Photos et moments forts officiels du Dentalk Club FMDC : scène TEDxFMDC, studio podcast, trophées et vie associative.",
    url: "/gallery",
  },
};

export default function GalleryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
