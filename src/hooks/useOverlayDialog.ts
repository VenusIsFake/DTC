"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

/**
 * Shared behavior for full-screen overlays (video modal, lightbox, infographic).
 * `overflow: hidden` alone does not stop iOS Safari from scrolling the page
 * behind a fixed overlay, so the body is pinned with position:fixed instead.
 * Also closes on Escape, traps Tab focus inside the dialog while open, and
 * restores both scroll position and focus to the trigger on close.
 */
export function useOverlayDialog<T extends HTMLElement = HTMLDivElement>(
  isActive: boolean,
  onClose: () => void
) {
  const dialogRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isActive) return;

    const body = document.body;
    const scrollY = window.scrollY;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const dialog = dialogRef.current;
    dialog
      ?.querySelector<HTMLElement>("[data-autofocus]")
      ?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab" && dialog) {
        const focusables = Array.from(
          dialog.querySelectorAll<HTMLElement>(FOCUSABLE)
        ).filter((el) => el.offsetParent !== null || el === document.activeElement);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first || !dialog.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else if (
          document.activeElement === last ||
          !dialog.contains(document.activeElement)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      Object.assign(body.style, prev);
      window.scrollTo(0, scrollY);
      previouslyFocused?.focus();
    };
  }, [isActive]);

  return dialogRef;
}
