import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-32 pb-20 px-3.5 max-w-xl mx-auto text-center space-y-4">
      <p className="text-6xl sm:text-8xl font-heading font-extrabold gold-gradient-text">
        404
      </p>
      <h1 className="text-xl sm:text-3xl font-heading font-bold text-white">
        Page introuvable
      </h1>
      <p className="text-sm text-[#94A3B8] leading-relaxed">
        La page que vous cherchez n&apos;existe pas ou a été déplacée. Laissez votre voix vous guider vers l&apos;accueil.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#0B132B] hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 transition-all active:scale-95 mt-2"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
