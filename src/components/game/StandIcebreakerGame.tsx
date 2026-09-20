"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dices,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Flame,
  ThumbsUp,
  SmilePlus,
  Share2,
} from "lucide-react";
import {
  CATEGORY_CONFIG,
  ICEBREAKER_QUESTIONS,
  IcebreakerCategory,
  IcebreakerQuestion,
  getRandomIcebreakerQuestion,
} from "@/data/icebreakerQuestions";

interface StandIcebreakerGameProps {
  /** Optional initial category */
  initialCategory?: IcebreakerCategory | "all";
  /** Compact styling when embedded inside modal or activation card */
  compact?: boolean;
}

export default function StandIcebreakerGame({
  initialCategory = "all",
  compact = false,
}: StandIcebreakerGameProps) {
  const [category, setCategory] = useState<IcebreakerCategory | "all">(initialCategory);
  const [seenIds, setSeenIds] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<IcebreakerQuestion>(() =>
    getRandomIcebreakerQuestion(initialCategory)
  );
  const [copied, setCopied] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [reaction, setReaction] = useState<"agree" | "debate" | "fun" | null>(null);

  // Pick next question
  const drawNext = useCallback(() => {
    setAnimating(true);
    setReaction(null);
    setTimeout(() => {
      const next = getRandomIcebreakerQuestion(category, seenIds);
      setCurrentQuestion(next);
      setSeenIds((prev) => (prev.includes(next.id) ? prev : [...prev, next.id]));
      setAnimating(false);
    }, 200);
  }, [category, seenIds]);

  // When category changes, pick fresh question
  const handleCategoryChange = (newCat: IcebreakerCategory | "all") => {
    setCategory(newCat);
    setReaction(null);
    setAnimating(true);
    setTimeout(() => {
      const next = getRandomIcebreakerQuestion(newCat, seenIds);
      setCurrentQuestion(next);
      setSeenIds((prev) => (prev.includes(next.id) ? prev : [...prev, next.id]));
      setAnimating(false);
    }, 150);
  };

  const copyQuestion = () => {
    if (!currentQuestion) return;
    const shareText = `[DTC Stand Icebreaker] ${currentQuestion.question} — ${currentQuestion.hint}`;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Ensure current question is marked as seen on first mount
  useEffect(() => {
    if (currentQuestion && !seenIds.includes(currentQuestion.id)) {
      setSeenIds((prev) => [...prev, currentQuestion.id]);
    }
  }, [currentQuestion, seenIds]);

  const catConfig = CATEGORY_CONFIG[currentQuestion.category];

  return (
    <div className={`w-full ${compact ? "space-y-4" : "space-y-5"}`}>
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-2 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-dtc-gold/15 via-dtc-gold/5 to-transparent border border-dtc-gold/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-dtc-gold text-dtc-paper flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-dtc-goldDark">
                Mini-Jeu Stand DTC
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-dtc-gold/20 text-dtc-ink font-semibold">
                100 Cartes
              </span>
            </div>
            <p className="text-xs text-dtc-inkMuted font-medium">
              Brise la glace avec les membres du bureau devant toi !
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-dtc-inkMuted bg-dtc-cream/70 px-2.5 py-1 rounded-md border border-dtc-line/40">
          <span>Explorées :</span>
          <span className="text-dtc-goldDark font-bold">{seenIds.length}/100</span>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar text-xs">
        <button
          type="button"
          onClick={() => handleCategoryChange("all")}
          className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 ${
            category === "all"
              ? "bg-dtc-ink text-dtc-paper shadow-sm"
              : "bg-dtc-cream hover:bg-dtc-cream/80 text-dtc-inkMuted border border-dtc-line/40"
          }`}
        >
          🎲 Aléatoire
        </button>
        {(Object.keys(CATEGORY_CONFIG) as IcebreakerCategory[]).map((catKey) => {
          const cfg = CATEGORY_CONFIG[catKey];
          const isSelected = category === catKey;
          return (
            <button
              key={catKey}
              type="button"
              onClick={() => handleCategoryChange(catKey)}
              className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? "bg-dtc-gold text-dtc-paper font-semibold shadow-sm"
                  : "bg-dtc-cream hover:bg-dtc-cream/80 text-dtc-inkMuted border border-dtc-line/40"
              }`}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Question Card */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-dtc-cream/40 dark:from-dtc-paper dark:to-dtc-navy/30 border-2 ${catConfig.borderClass} p-5 sm:p-7 shadow-md transition-all duration-300 ${
          animating ? "opacity-40 scale-[0.98]" : "opacity-100 scale-100"
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${catConfig.badgeClass}`}
          >
            <span>{catConfig.emoji}</span>
            <span>{catConfig.label}</span>
          </span>

          <span className="text-[11px] font-mono text-dtc-inkMuted/80 font-medium">
            Carte #{currentQuestion.id}
          </span>
        </div>

        {/* Question Text */}
        <div className="min-h-[90px] sm:min-h-[105px] flex items-center my-2">
          <p className="font-heading font-semibold text-dtc-ink text-base sm:text-lg lg:text-xl leading-snug">
            « {currentQuestion.question} »
          </p>
        </div>

        {/* Mission / Hint prompt */}
        <div className="mt-4 p-3 rounded-xl bg-dtc-cream/80 dark:bg-dtc-navy/50 border border-dtc-line/50 flex items-start gap-2.5">
          <span className="text-sm shrink-0 mt-0.5">💡</span>
          <div className="text-xs text-dtc-inkMuted leading-relaxed">
            <strong className="text-dtc-ink font-semibold">Conseil pour le stand : </strong>
            {currentQuestion.hint}
          </div>
        </div>

        {/* Mini Reactions: Agree / Debate / Laugh */}
        <div className="mt-4 pt-3 border-t border-dtc-line/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[11px] text-dtc-inkMuted font-medium">
            Verdict avec le bureau :
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setReaction("agree")}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium ${
                reaction === "agree"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>D&apos;accord</span>
            </button>
            <button
              type="button"
              onClick={() => setReaction("debate")}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium ${
                reaction === "debate"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-rose-500/10 text-rose-700 hover:bg-rose-500/20"
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Débat chaud !</span>
            </button>
            <button
              type="button"
              onClick={() => setReaction("fun")}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium ${
                reaction === "fun"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
              }`}
            >
              <SmilePlus className="w-3 h-3" />
              <span>Hilarant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Control Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={drawNext}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-heading font-semibold text-sm bg-dtc-gold text-dtc-paper shadow-md shadow-dtc-gold/25 hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Dices className="w-4 h-4 animate-bounce" />
          <span>Tirer une autre carte</span>
        </button>

        <button
          type="button"
          onClick={copyQuestion}
          title="Copier la question pour la partager"
          aria-label="Copier la question"
          className="p-3.5 rounded-xl border border-dtc-line/60 bg-dtc-cream/70 hover:bg-dtc-cream text-dtc-ink transition-all active:scale-95 shrink-0"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Mobile Counter Info */}
      <div className="sm:hidden flex items-center justify-between text-[11px] text-dtc-inkMuted px-1">
        <span>Cartes vues lors de ta visite :</span>
        <span className="font-bold text-dtc-goldDark">{seenIds.length}/100</span>
      </div>
    </div>
  );
}
