"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js (client-side caching — see rules.md §10).
 * Production only: dev assets churn too fast to cache usefully.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () => navigator.serviceWorker.register("/sw.js").catch(() => {
      // Caching is an enhancement; registration failure must never break the site.
    });
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
