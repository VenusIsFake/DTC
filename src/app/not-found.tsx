import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-16 sm:pt-24 pb-16 px-4 max-w-xl mx-auto text-center space-y-4">
      <p className="text-6xl sm:text-8xl font-heading font-semibold text-dtc-gold">
        404
      </p>
      <h1 className="text-xl sm:text-3xl font-heading font-semibold text-dtc-ink">
        Page introuvable
      </h1>
      <p className="text-sm text-dtc-inkMuted leading-relaxed">
        La page que vous cherchez n&apos;existe pas ou a été déplacée. Laissez votre voix vous guider vers l&apos;accueil.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm bg-dtc-ink text-dtc-paper hover:bg-dtc-steel transition-colors mt-2"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
