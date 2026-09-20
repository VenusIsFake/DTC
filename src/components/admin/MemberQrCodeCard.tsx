"use client";

import React, { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Maximize2,
  QrCode as QrIcon,
  RefreshCw,
  Users,
  X,
  Sparkles,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { PrimaryButton, GhostButton } from "@/components/ui/form";

interface MemberQrLinkData {
  id: string;
  token: string;
  uses_count: number;
  created_at: string;
  expires_at: string;
}

export default function MemberQrCodeCard() {
  const [data, setData] = useState<MemberQrLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [rotating, setRotating] = useState(false);

  const loadQrLink = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Base de données indisponible.");
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_or_create_member_qr_link");
      if (rpcError) throw rpcError;
      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (!row || !row.token) throw new Error("Lien introuvable.");
      setData(row as MemberQrLinkData);

      const origin = typeof window !== "undefined" ? window.location.origin : "https://dentalkclubfmdc.com";
      const fullUrl = `${origin}/invitation/${row.token}`;
      const url = await QRCode.toDataURL(fullUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: "#0B132B",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQrLink();
  }, [loadQrLink]);

  const rotateLink = async () => {
    if (
      !window.confirm(
        "Générer un NOUVEAU QR Code Membres ? L'ancien QR code ne permettra plus les nouvelles inscriptions (les membres déjà inscrits conservent leur accès)."
      )
    ) {
      return;
    }
    setRotating(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Base de données indisponible.");
      // Revoke old multi-use link if any
      if (data?.id) {
        await supabase.rpc("revoke_invite_link", { link_id: data.id });
      }
      // Create new multi-use member link
      const { error: createErr } = await supabase.rpc("create_invite_link", {
        new_role: "member",
        p_multi_use: true,
      });
      if (createErr) throw createErr;
      await loadQrLink();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de rotation.");
    } finally {
      setRotating(false);
    }
  };

  const copyUrl = async () => {
    if (!data?.token) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = `${origin}/invitation/${data.token}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  const downloadQrPng = () => {
    if (!qrDataUrl || !data?.token) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `DTC-QR-Code-Membres-${data.token.slice(0, 8)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = data?.token ? `${origin}/invitation/${data.token}` : "";

  return (
    <>
      <div className="glass-card rounded-xl border border-dtc-gold/40 bg-gradient-to-br from-white/90 via-dtc-wash/80 to-amber-500/5 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-dtc-gold/20 text-dtc-gold border border-dtc-gold/30">
                <Sparkles className="w-3 h-3" /> Stand & Événements
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600/15 text-emerald-800 border border-emerald-600/30">
                Usage multiple illimité
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-heading font-bold text-dtc-ink flex items-center gap-2">
              <QrIcon className="w-5 h-5 text-dtc-gold" />
              QR Code d&apos;Adhésion Membres
            </h2>
            <p className="text-xs text-dtc-inkMuted max-w-xl leading-relaxed">
              À afficher sur le stand, projeter en amphi ou imprimer sur les flyers. Tous les étudiants scannent ce même
              QR code pour s&apos;inscrire et accéder directement au club. Ne s&apos;épuise jamais après une utilisation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <GhostButton
              onClick={() => setModalOpen(true)}
              disabled={!qrDataUrl}
              className="!py-1.5 !px-3 !text-xs font-semibold"
              title="Agrandir pour affichage stand / projecteur"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Agrandir</span>
            </GhostButton>
            <GhostButton
              onClick={rotateLink}
              disabled={rotating || loading}
              className="!py-1.5 !px-3 !text-xs font-semibold text-dtc-inkMuted hover:text-red-700"
              title="Révoquer et générer un nouveau QR Code"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${rotating ? "animate-spin" : ""}`} />
              <span>Régénérer</span>
            </GhostButton>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-dtc-gold animate-spin" />
            <p className="text-xs text-dtc-inkMuted font-medium">Génération du QR code...</p>
          </div>
        ) : error ? (
          <p className="text-xs text-red-700 bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</p>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-5 pt-2">
            {/* Visual QR Code frame */}
            <div
              onClick={() => setModalOpen(true)}
              className="cursor-pointer group relative p-3 bg-white rounded-2xl border-2 border-dtc-gold/30 shadow-md hover:border-dtc-gold transition-all duration-300 hover:shadow-lg shrink-0"
              title="Cliquer pour afficher en grand"
            >
              {qrDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="QR Code d'inscription membre DTC"
                  className="w-40 h-40 object-contain rounded-lg"
                />
              )}
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[2px]">
                <Maximize2 className="w-4 h-4" /> Mode Stand
              </div>
            </div>

            {/* QR Metadata & Action Controls */}
            <div className="space-y-3 min-w-0 flex-1 w-full">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-dtc-ink uppercase tracking-wider">Lien permanent d&apos;inscription :</p>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <code className="px-3 py-2 rounded-lg bg-white/90 border border-dtc-line/60 text-xs font-mono font-medium text-dtc-ink select-all break-all truncate w-full">
                    {fullUrl}
                  </code>
                  <PrimaryButton onClick={copyUrl} className="!py-2 !px-3.5 !text-xs shrink-0">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copié !" : "Copier"}</span>
                  </PrimaryButton>
                  <GhostButton onClick={downloadQrPng} className="!py-2 !px-3.5 !text-xs shrink-0" title="Télécharger l'image PNG haute résolution">
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG</span>
                  </GhostButton>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-dtc-inkMuted pt-1">
                <span className="inline-flex items-center gap-1.5 font-semibold text-dtc-ink">
                  <Users className="w-3.5 h-3.5 text-dtc-gold" />
                  {data?.uses_count ?? 0} utilisation{(data?.uses_count ?? 0) > 1 ? "s" : ""}
                </span>
                <span className="text-[11px] text-dtc-inkSoft">
                  • Fonctionne en permanence, même si le mur d&apos;accès public est activé.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stand Presentation Modal (Full screen booth presentation) */}
      {modalOpen && qrDataUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
        >
          <div className="absolute inset-0" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-sm glass-card rounded-2xl border-2 border-dtc-gold/60 p-6 sm:p-8 space-y-5 bg-white text-center shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-dtc-wash text-dtc-inkMuted hover:text-dtc-ink"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-dtc-gold/20 text-dtc-gold">
                DENTALK CLUB FMDC
              </span>
              <h3 className="text-xl font-heading font-bold text-dtc-ink pt-1">
                Rejoins le DTC !
              </h3>
              <p className="text-xs text-dtc-inkMuted">
                Scannez ce QR Code avec votre smartphone pour adhérer immédiatement.
              </p>
            </div>

            <div className="p-4 bg-dtc-wash/50 rounded-2xl border border-dtc-line/40 inline-block shadow-inner mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="QR Code d'adhésion Dentalk Club"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto rounded-xl shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-mono text-dtc-inkMuted truncate max-w-full">
                {fullUrl}
              </p>
              <div className="flex items-center justify-center gap-2">
                <PrimaryButton onClick={copyUrl} className="!py-2 !px-4 !text-xs">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Lien copié !" : "Copier le lien"}</span>
                </PrimaryButton>
                <GhostButton onClick={downloadQrPng} className="!py-2 !px-4 !text-xs">
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger PNG</span>
                </GhostButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
