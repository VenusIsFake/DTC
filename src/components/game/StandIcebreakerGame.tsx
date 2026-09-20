"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dices,
  Copy,
  Check,
  Sparkles,
  Flame,
  ThumbsUp,
  SmilePlus,
  Globe,
} from "lucide-react";
import {
  CATEGORY_CONFIG,
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
  const [lang, setLang] = useState<"fr" | "en">("fr");
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
    }, 180);
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
    const qText = lang === "fr" ? currentQuestion.question : currentQuestion.questionEn;
    const hText = lang === "fr" ? currentQuestion.hint : currentQuestion.hintEn;
    const shareText = `[Dentalk Club FMDC] ${qText} (${hText})`;
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
  const catLabel = lang === "fr" ? catConfig.label : catConfig.labelEn;
  const questionText = lang === "fr" ? currentQuestion.question : currentQuestion.questionEn;
  const hintText = lang === "fr" ? currentQuestion.hint : currentQuestion.hintEn;

  return (
    <div className={`w-full ${compact ? "space-y-3.5" : "space-y-4"}`}>
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-dtc-wash/70 border border-dtc-line/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-dtc-gold text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold tracking-wide uppercase text-dtc-goldDark font-heading">
                {lang === "fr" ? "Mini-Jeu Stand DTC" : "DTC Stand Mini-Game"}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-dtc-ink border border-dtc-line/60">
                {lang === "fr" ? "100 Cartes" : "100 Cards"}
              </span>
            </div>
            <p className="text-xs text-dtc-inkMuted font-medium">
              {lang === "fr"
                ? "Brise la glace avec les membres du bureau devant toi !"
                : "Break the ice with the bureau members right in front of you!"}
            </p>
          </div>
        </div>

        {/* Right tools: Language toggle & Counter */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-dtc-line/40">
          {/* FR / EN Language Switcher */}
          <div
            className="flex items-center p-0.5 rounded-lg bg-white border border-dtc-line/70 shadow-xs"
            role="group"
            aria-label="Language switcher"
          >
            <button
              type="button"
              onClick={() => setLang("fr")}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                lang === "fr"
                  ? "bg-dtc-gold text-white shadow-xs"
                  : "text-dtc-inkMuted hover:text-dtc-ink"
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                lang === "en"
                  ? "bg-dtc-gold text-white shadow-xs"
                  : "text-dtc-inkMuted hover:text-dtc-ink"
              }`}
            >
              EN
            </button>
          </div>

          {/* Seen counter pill */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-dtc-ink bg-white px-2.5 py-1 rounded-lg border border-dtc-line/70 whitespace-nowrap shadow-xs">
            <span className="text-dtc-inkMuted">
              {lang === "fr" ? "Explorées :" : "Explored:"}
            </span>
            <span className="font-bold text-dtc-goldDark">{seenIds.length}/100</span>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-xs">
        <button
          type="button"
          onClick={() => handleCategoryChange("all")}
          className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 whitespace-nowrap ${
            category === "all"
              ? "bg-dtc-ink text-white shadow-xs"
              : "bg-white hover:bg-dtc-wash text-dtc-ink border border-dtc-line/70"
          }`}
        >
          🎲 {lang === "fr" ? "Aléatoire" : "All Random"}
        </button>
        {(Object.keys(CATEGORY_CONFIG) as IcebreakerCategory[]).map((catKey) => {
          const cfg = CATEGORY_CONFIG[catKey];
          const isSelected = category === catKey;
          const label = lang === "fr" ? cfg.label : cfg.labelEn;
          return (
            <button
              key={catKey}
              type="button"
              onClick={() => handleCategoryChange(catKey)}
              className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 flex items-center gap-1.5 whitespace-nowrap ${
                isSelected
                  ? "bg-dtc-gold text-white font-semibold shadow-xs"
                  : "bg-white hover:bg-dtc-wash text-dtc-ink border border-dtc-line/70"
              }`}
            >
              <span>{cfg.emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Question Card */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-white border-2 ${
          catConfig.borderClass
        } p-5 sm:p-7 shadow-sm transition-all duration-300 ${
          animating ? "opacity-30 scale-[0.99]" : "opacity-100 scale-100"
        }`}
      >
        {/* Card Header: Category badge + Card index */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${catConfig.badgeClass}`}
          >
            <span>{catConfig.emoji}</span>
            <span>{catLabel}</span>
          </span>

          <span className="text-xs font-mono font-medium text-dtc-inkMuted bg-dtc-wash/80 px-2 py-0.5 rounded-md border border-dtc-line/50">
            #{currentQuestion.id}
          </span>
        </div>

        {/* Question Text */}
        <div className="min-h-[75px] sm:min-h-[85px] flex items-center my-3">
          <p className="font-heading font-semibold text-dtc-ink text-base sm:text-lg lg:text-xl leading-relaxed">
            « {questionText} »
          </p>
        </div>

        {/* Hint / Stand Tip Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-dtc-wash/75 border border-dtc-line/70 flex items-start gap-2.5 text-dtc-ink">
          <span className="text-sm shrink-0 select-none mt-0.5">💡</span>
          <p className="text-xs leading-relaxed text-dtc-ink">
            <strong className="font-bold text-dtc-goldDark">
              {lang === "fr" ? "Conseil pour le stand : " : "Stand tip: "}
            </strong>
            <span className="text-dtc-inkMuted font-medium">{hintText}</span>
          </p>
        </div>

        {/* Reaction Bar */}
        <div className="mt-4 pt-3 border-t border-dtc-line/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[11px] font-medium text-dtc-inkMuted">
            {lang === "fr" ? "Verdict avec le bureau :" : "Bureau reaction:"}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setReaction("agree")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 text-xs font-medium ${
                reaction === "agree"
                  ? "bg-emerald-700 text-white shadow-xs font-semibold"
                  : "bg-dtc-wash hover:bg-emerald-50 text-dtc-ink border border-dtc-line/50"
              }`}
            >
              <ThumbsUp className="w-3 h-3 text-emerald-600" />
              <span>{lang === "fr" ? "D'accord" : "Agree"}</span>
            </button>
            <button
              type="button"
              onClick={() => setReaction("debate")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 text-xs font-medium ${
                reaction === "debate"
                  ? "bg-rose-700 text-white shadow-xs font-semibold"
                  : "bg-dtc-wash hover:bg-rose-50 text-dtc-ink border border-dtc-line/50"
              }`}
            >
              <Flame className="w-3 h-3 text-rose-500" />
              <span>{lang === "fr" ? "Débat chaud !" : "Hot take!"}</span>
            </button>
            <button
              type="button"
              onClick={() => setReaction("fun")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 text-xs font-medium ${
                reaction === "fun"
                  ? "bg-amber-600 text-white shadow-xs font-semibold"
                  : "bg-dtc-wash hover:bg-amber-50 text-dtc-ink border border-dtc-line/50"
              }`}
            >
              <SmilePlus className="w-3 h-3 text-amber-600" />
              <span>{lang === "fr" ? "Hilarant" : "Hilarious"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={drawNext}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-heading font-semibold text-sm bg-dtc-gold text-white shadow-sm hover:brightness-110 active:scale-[0.99] transition-all"
        >
          <Dices className="w-4 h-4" />
          <span>{lang === "fr" ? "Tirer une autre carte" : "Draw next card"}</span>
        </button>

        <button
          type="button"
          onClick={copyQuestion}
          title={lang === "fr" ? "Copier la question" : "Copy question"}
          aria-label={lang === "fr" ? "Copier la question" : "Copy question"}
          className="p-3.5 rounded-xl border border-dtc-line bg-white hover:bg-dtc-wash text-dtc-ink transition-all active:scale-95 shrink-0 shadow-xs"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4 text-dtc-inkMuted" />
          )}
        </button>
      </div>
    </div>
  );
}
