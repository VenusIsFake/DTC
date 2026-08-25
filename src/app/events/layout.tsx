import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TEDxFMDC & Débats",
  description:
    "Revivez les 8 extraits vidéo officiels du TEDxFMDC, les Débats en Table et les ateliers d'éloquence du Dentalk Club FMDC à l'Amphithéâtre de Casablanca.",
  alternates: {
    canonical: "/events",
  },
  openGraph: {
    title: "TEDxFMDC & Débats | Dentalk Club FMDC",
    description:
      "Les 8 talks vidéo officiels du TEDxFMDC, débats parlementaires et ateliers de prise de parole des étudiants en médecine dentaire de Casablanca.",
    url: "/events",
  },
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
