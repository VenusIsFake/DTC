"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import { useOverlayDialog } from "@/hooks/useOverlayDialog";
import { GhostButton, PrimaryButton } from "@/components/ui/form";

interface AvatarCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onConfirm: (blob: Blob) => Promise<void>;
}

const VIEWPORT_SIZE = 280;
const CIRCLE_RADIUS = 130;
const CIRCLE_DIAMETER = CIRCLE_RADIUS * 2; // 260px
const OUTPUT_SIZE = 512;

export default function AvatarCropModal({
  isOpen,
  imageSrc,
  onClose,
  onConfirm,
}: AvatarCropModalProps) {
  const dialogRef = useOverlayDialog<HTMLDivElement>(isOpen, onClose);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number; startPanX: number; startPanY: number } | null>(null);
  const [pinchDistance, setPinchDistance] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset state when opening a new image
  useEffect(() => {
    if (!isOpen || !imageSrc) {
      setNaturalSize(null);
      setPan({ x: 0, y: 0 });
      setZoom(1.0);
      setIsDragging(false);
      setDragOrigin(null);
      setPinchDistance(null);
      setError(null);
      setSubmitting(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setPan({ x: 0, y: 0 });
      setZoom(1.0);
      imgRef.current = img;
    };
    img.onerror = () => {
      setError("Impossible de charger l'image sélectionnée.");
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  // Compute maximum allowable pan bounds to keep the circle covered by image pixels
  const getClampedPan = useCallback(
    (targetPan: { x: number; y: number }, targetZoom: number) => {
      if (!naturalSize) return { x: 0, y: 0 };
      const scaleMin = Math.max(
        CIRCLE_DIAMETER / naturalSize.width,
        CIRCLE_DIAMETER / naturalSize.height
      );
      const wDisp = naturalSize.width * scaleMin * targetZoom;
      const hDisp = naturalSize.height * scaleMin * targetZoom;
      const maxPanX = Math.max(0, (wDisp - CIRCLE_DIAMETER) / 2);
      const maxPanY = Math.max(0, (hDisp - CIRCLE_DIAMETER) / 2);

      return {
        x: Math.min(maxPanX, Math.max(-maxPanX, targetPan.x)),
        y: Math.min(maxPanY, Math.max(-maxPanY, targetPan.y)),
      };
    },
    [naturalSize]
  );

  // Live preview drawing onto small 72x72 canvas
  useEffect(() => {
    if (!naturalSize || !imgRef.current || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleMin = Math.max(
      CIRCLE_DIAMETER / naturalSize.width,
      CIRCLE_DIAMETER / naturalSize.height
    );
    const wDisp = naturalSize.width * scaleMin * zoom;
    const hDisp = naturalSize.height * scaleMin * zoom;

    // Viewport coordinates
    const xImg = VIEWPORT_SIZE / 2 + pan.x - wDisp / 2;
    const yImg = VIEWPORT_SIZE / 2 + pan.y - hDisp / 2;

    const circleLeft = (VIEWPORT_SIZE - CIRCLE_DIAMETER) / 2;
    const circleTop = (VIEWPORT_SIZE - CIRCLE_DIAMETER) / 2;

    const ratio = 72 / CIRCLE_DIAMETER;
    const drawX = (xImg - circleLeft) * ratio;
    const drawY = (yImg - circleTop) * ratio;
    const drawW = wDisp * ratio;
    const drawH = hDisp * ratio;

    ctx.clearRect(0, 0, 72, 72);
    ctx.save();
    ctx.beginPath();
    ctx.arc(36, 36, 36, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(imgRef.current, drawX, drawY, drawW, drawH);
    ctx.restore();
  }, [naturalSize, pan, zoom]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOrigin({
      x: e.clientX,
      y: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragOrigin) return;
    const deltaX = e.clientX - dragOrigin.x;
    const deltaY = e.clientY - dragOrigin.y;
    const newPan = getClampedPan(
      {
        x: dragOrigin.startPanX + deltaX,
        y: dragOrigin.startPanY + deltaY,
      },
      zoom
    );
    setPan(newPan);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    setDragOrigin(null);
  };

  // Touch drag & pinch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragOrigin({
        x: touch.clientX,
        y: touch.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
      });
      setPinchDistance(null);
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      setPinchDistance(dist);
      setIsDragging(false);
      setDragOrigin(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isDragging && dragOrigin) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragOrigin.x;
      const deltaY = touch.clientY - dragOrigin.y;
      const newPan = getClampedPan(
        {
          x: dragOrigin.startPanX + deltaX,
          y: dragOrigin.startPanY + deltaY,
        },
        zoom
      );
      setPan(newPan);
    } else if (e.touches.length === 2 && pinchDistance !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const factor = currentDist / pinchDistance;
      const newZoom = Math.min(3.0, Math.max(1.0, zoom * factor));
      setZoom(newZoom);
      setPan((prevPan) => getClampedPan(prevPan, newZoom));
      setPinchDistance(currentDist);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragOrigin(null);
    setPinchDistance(null);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
    const newZoom = Math.min(3.0, Math.max(1.0, zoom + zoomDelta));
    setZoom(newZoom);
    setPan((prevPan) => getClampedPan(prevPan, newZoom));
  };

  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.min(3.0, Math.max(1.0, newZoom));
    setZoom(clampedZoom);
    setPan((prevPan) => getClampedPan(prevPan, clampedZoom));
  };

  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Export cropped area to 512x512 high-res JPEG blob
  const handleConfirm = async () => {
    if (!naturalSize || !imgRef.current) return;
    setSubmitting(true);
    setError(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas non disponible");

      const scaleMin = Math.max(
        CIRCLE_DIAMETER / naturalSize.width,
        CIRCLE_DIAMETER / naturalSize.height
      );
      const wDisp = naturalSize.width * scaleMin * zoom;
      const hDisp = naturalSize.height * scaleMin * zoom;

      // In viewport coords
      const xImg = VIEWPORT_SIZE / 2 + pan.x - wDisp / 2;
      const yImg = VIEWPORT_SIZE / 2 + pan.y - hDisp / 2;
      const circleLeft = (VIEWPORT_SIZE - CIRCLE_DIAMETER) / 2;
      const circleTop = (VIEWPORT_SIZE - CIRCLE_DIAMETER) / 2;

      // Scale up to 512x512 output
      const multiplier = OUTPUT_SIZE / CIRCLE_DIAMETER;
      const outX = (xImg - circleLeft) * multiplier;
      const outY = (yImg - circleTop) * multiplier;
      const outW = wDisp * multiplier;
      const outH = hDisp * multiplier;

      // Fill canvas background
      ctx.fillStyle = "#0B132B";
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      // Draw the positioned image
      ctx.drawImage(imgRef.current, outX, outY, outW, outH);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9);
      });

      if (!blob) throw new Error("Échec de génération de l'image");

      await onConfirm(blob);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la validation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  const scaleMin = naturalSize
    ? Math.max(CIRCLE_DIAMETER / naturalSize.width, CIRCLE_DIAMETER / naturalSize.height)
    : 1;
  const wDisp = naturalSize ? naturalSize.width * scaleMin * zoom : VIEWPORT_SIZE;
  const hDisp = naturalSize ? naturalSize.height * scaleMin * zoom : VIEWPORT_SIZE;
  const imgLeft = VIEWPORT_SIZE / 2 + pan.x - wDisp / 2;
  const imgTop = VIEWPORT_SIZE / 2 + pan.y - hDisp / 2;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Ajuster la photo de profil"
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn"
    >
      <div className="absolute inset-0" onClick={submitting ? undefined : onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md glass-card rounded-2xl sm:rounded-3xl border border-[#385A75]/50 p-5 sm:p-7 space-y-5 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
              Cadrer votre <span className="gold-gradient-text">photo</span>
            </h2>
            <p className="text-[11px] text-[#94A3B8]">
              Glissez pour repositionner et zoomez pour ajuster le cadrage.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1B2E4B]/80 text-[#94A3B8] hover:text-white transition-colors disabled:opacity-50"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Cropper Area */}
        <div className="flex flex-col items-center justify-center">
          <div
            className={`relative rounded-2xl overflow-hidden bg-[#070D1E] border border-[#385A75]/60 select-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            } touch-none`}
            style={{ width: `${VIEWPORT_SIZE}px`, height: `${VIEWPORT_SIZE}px` }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            {/* The Image */}
            {naturalSize && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt="Aperçu cadrage"
                draggable={false}
                className="absolute pointer-events-none"
                style={{
                  width: `${wDisp}px`,
                  height: `${hDisp}px`,
                  left: `${imgLeft}px`,
                  top: `${imgTop}px`,
                  maxWidth: "none",
                }}
              />
            )}

            {/* Circular Mask and Gold Border Overlay */}
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full"
              viewBox={`0 0 ${VIEWPORT_SIZE} ${VIEWPORT_SIZE}`}
            >
              <defs>
                <mask id="avatar-crop-mask">
                  <rect width={VIEWPORT_SIZE} height={VIEWPORT_SIZE} fill="white" />
                  <circle
                    cx={VIEWPORT_SIZE / 2}
                    cy={VIEWPORT_SIZE / 2}
                    r={CIRCLE_RADIUS}
                    fill="black"
                  />
                </mask>
              </defs>
              {/* Outer dimmed vignette */}
              <rect
                width={VIEWPORT_SIZE}
                height={VIEWPORT_SIZE}
                fill="rgba(11, 19, 43, 0.78)"
                mask="url(#avatar-crop-mask)"
              />
              {/* Circular guide ring with gold accent */}
              <circle
                cx={VIEWPORT_SIZE / 2}
                cy={VIEWPORT_SIZE / 2}
                r={CIRCLE_RADIUS}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="2.5"
                className="drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
              />
              {/* Subtle crosshair guide lines */}
              <line
                x1={VIEWPORT_SIZE / 2 - 12}
                y1={VIEWPORT_SIZE / 2}
                x2={VIEWPORT_SIZE / 2 + 12}
                y2={VIEWPORT_SIZE / 2}
                stroke="rgba(212, 175, 55, 0.5)"
                strokeWidth="1.5"
              />
              <line
                x1={VIEWPORT_SIZE / 2}
                y1={VIEWPORT_SIZE / 2 - 12}
                x2={VIEWPORT_SIZE / 2}
                y2={VIEWPORT_SIZE / 2 + 12}
                stroke="rgba(212, 175, 55, 0.5)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

        {/* Controls: Zoom & Real-time Mini Preview */}
        <div className="flex items-center gap-4 bg-[#0F172A]/70 border border-[#385A75]/40 rounded-2xl p-3">
          {/* Mini Live Preview */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#D4AF37] bg-[#1B2E4B] shadow-md shadow-[#D4AF37]/15">
              <canvas
                ref={previewCanvasRef}
                width={72}
                height={72}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[9px] font-semibold text-[#94A3B8]">Aperçu</span>
          </div>

          {/* Zoom Slider and Quick Buttons */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#CBD5E1]">
              <span>Zoom</span>
              <span className="text-[#D4AF37] font-mono">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleZoomChange(zoom - 0.2)}
                disabled={zoom <= 1.0 || submitting}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1B2E4B] text-[#94A3B8] hover:text-white disabled:opacity-30 transition-all active:scale-95"
                aria-label="Dézoomer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.02"
                value={zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                disabled={submitting}
                className="flex-1 h-1.5 bg-[#1B2E4B] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                aria-label="Niveau de zoom"
              />

              <button
                type="button"
                onClick={() => handleZoomChange(zoom + 0.2)}
                disabled={zoom >= 3.0 || submitting}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1B2E4B] text-[#94A3B8] hover:text-white disabled:opacity-30 transition-all active:scale-95"
                aria-label="Zoomer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={submitting || (zoom === 1.0 && pan.x === 0 && pan.y === 0)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1B2E4B] text-[#94A3B8] hover:text-[#D4AF37] disabled:opacity-30 transition-all active:scale-95 ml-0.5"
                title="Réinitialiser le cadrage"
                aria-label="Réinitialiser le cadrage"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"
          >
            {error}
          </p>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <GhostButton type="button" onClick={onClose} disabled={submitting}>
            Annuler
          </GhostButton>
          <PrimaryButton type="button" onClick={handleConfirm} disabled={submitting || !naturalSize}>
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{submitting ? "Enregistrement…" : "Valider la photo"}</span>
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
