"use client";

import { useEffect, useMemo, useState } from "react";
import { getQuizzlyInventory, getQuizzlyProfile } from "@/lib/quizzly/actions";
import { BarChart3, Clock3, Flame, Gem, Sparkles, Target } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";

type StatCard = { label: string; value: string };
type ErrorAnalyticsItem = {
  subject: string;
  subTheme: string;
  questionType: string;
  difficulty: string;
  isCorrect: boolean;
  createdAt: string;
};
type WeakQuestion = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

const ERROR_ANALYTICS_KEY = "mai.quizzly.error-analytics.v1";

function rateColor(rate: number) {
  if (rate < 0.25) return "bg-emerald-500";
  if (rate < 0.45) return "bg-lime-500";
  if (rate < 0.65) return "bg-amber-500";
  return "bg-rose-500";
}

export default function QuizzlyStatsPage() {
  const [cards, setCards] = useState<StatCard[]>([]);
  const [advancedStats, setAdvancedStats] = useState({
    bestScore: "—",
    fastestQuiz: "—",
    longestStreak: "—",
    diamondsNet: "—",
  });
  const [analytics, setAnalytics] = useState<ErrorAnalyticsItem[]>([]);
  const [weakQuiz, setWeakQuiz] = useState<WeakQuestion[]>([]);
  const [weakIndex, setWeakIndex] = useState(0);
  const [weakCorrect, setWeakCorrect] = useState(0);
  const [weakCompleted, setWeakCompleted] = useState(false);
  const [encouragement, setEncouragement] = useState("");
  const [loadingWeakQuiz, setLoadingWeakQuiz] = useState(false);
  const { language } = useLanguage();

  const reloadAnalytics = () => {
    try {
      setAnalytics(JSON.parse(localStorage.getItem(ERROR_ANALYTICS_KEY) ?? "[]"));
    } catch {
      setAnalytics([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      const [profile, inventory] = await Promise.all([
        getQuizzlyProfile(),
        getQuizzlyInventory(),
      ]);

      const getQty = (key: string) =>
        inventory.find((item) => item.itemKey === key)?.quantity ?? 0;

      setCards([
        { label: "Quiz joués", value: String(getQty("stats:quiz-played")) },
        {
          label: "Taux de réussite",
          value:
            getQty("stats:quiz-played") > 0
              ? `${Math.min(100, Math.round((getQty("stats:total-correct") / (getQty("stats:quiz-played") * 5)) * 100))}%`
              : "0%",
        },
        { label: "Meilleur streak", value: String(profile.streak) },
        { label: "Diamants gagnés", value: String(getQty("stats:diamonds-earned")) },
        { label: "Diamants dépensés", value: String(getQty("stats:diamonds-spent")) },
        { label: "XP actuelle", value: String(profile.xp) },
      ]);

      const bestScore = getQty("stats:best-score");
      const fastestQuizSec = getQty("stats:fastest-quiz-sec");
      const bestStreak = Math.max(profile.streak, getQty("stats:best-streak"));
      const diamondsNet = getQty("stats:diamonds-earned") - getQty("stats:diamonds-spent");

      setAdvancedStats({
        bestScore: bestScore > 0 ? `${bestScore} pts` : t("quizzly.stats.soon", language),
        fastestQuiz:
          fastestQuizSec > 0
            ? `${Math.floor(fastestQuizSec / 60)}m ${String(fastestQuizSec % 60).padStart(2, "0")}s`
            : t("quizzly.stats.soon", language),
        longestStreak: bestStreak > 0 ? `${bestStreak}` : t("quizzly.stats.soon", language),
        diamondsNet: `${diamondsNet >= 0 ? "+" : ""}${diamondsNet}`,
      });

      reloadAnalytics();
    };

    load();
  }, [language]);

  const grouped = useMemo(() => {
    const buckets = new Map<string, { key: string; label: string; errors: number; total: number }>();
    for (const item of analytics) {
      const key = `${item.subject}__${item.subTheme}__${item.questionType}__${item.difficulty}`;
      const label = `${item.subject} · ${item.subTheme} · ${item.questionType} · ${item.difficulty}`;
      const entry = buckets.get(key) ?? { key, label, errors: 0, total: 0 };
      entry.total += 1;
      if (!item.isCorrect) entry.errors += 1;
      buckets.set(key, entry);
    }
    return Array.from(buckets.values()).map((entry) => ({
      ...entry,
      errorRate: entry.total > 0 ? entry.errors / entry.total : 0,
    }));
  }, [analytics]);

  const topWeakSubthemes = useMemo(() => {
    const map = new Map<string, { subTheme: string; errors: number; total: number }>();
    for (const item of analytics) {
      const key = `${item.subject}__${item.subTheme}`;
      const prev = map.get(key) ?? { subTheme: `${item.subject} · ${item.subTheme}`, errors: 0, total: 0 };
      prev.total += 1;
      if (!item.isCorrect) prev.errors += 1;
      map.set(key, prev);
    }
    return Array.from(map.values())
      .sort((a, b) => b.errors - a.errors || b.total - a.total)
      .slice(0, 10);
  }, [analytics]);

  const startWeakPointsQuiz = async () => {
    if (topWeakSubthemes.length === 0) return;
    setLoadingWeakQuiz(true);
    const picked = topWeakSubthemes.slice(0, Math.min(5, Math.max(3, topWeakSubthemes.length))).map((item) => item.subTheme);
    const averageErrorRate = picked.reduce((total, label) => {
      const found = topWeakSubthemes.find((row) => row.subTheme === label);
      return total + ((found?.errors ?? 0) / Math.max(1, found?.total ?? 1));
    }, 0) / Math.max(1, picked.length);
    const difficulty = averageErrorRate > 0.65 ? "Facile" : averageErrorRate > 0.4 ? "Moyen" : "Difficile";
    const [subject] = picked[0]?.split(" · ") ?? ["Mathématiques"];

    try {
      const res = await fetch("/api/quizzly/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: "3ème",
          subject,
          difficulty,
          count: 6,
          chapter: "Révision ciblée",
          themePrompt: `Mode Mes points faibles: ${picked.join(" ; ")}`,
          questionTypes: ["qcm"],
        }),
      });
      const data = (await res.json()) as { questions?: WeakQuestion[]; error?: string };
      if (!res.ok || !data.questions || data.questions.length === 0) {
        throw new Error(data.error ?? "Impossible de générer le quiz ciblé");
      }
      setWeakQuiz(data.questions);
      setWeakIndex(0);
      setWeakCorrect(0);
      setWeakCompleted(false);
      setEncouragement("");
    } finally {
      setLoadingWeakQuiz(false);
    }
  };

  const registerWeakQuizAnswer = async (choice: number) => {
    const current = weakQuiz[weakIndex];
    if (!current) return;
    const isCorrect = choice === current.correctAnswerIndex;
    if (isCorrect) setWeakCorrect((prev) => prev + 1);

    const targetSubtheme = topWeakSubthemes[Math.min(topWeakSubthemes.length - 1, weakIndex % Math.max(1, topWeakSubthemes.length))]?.subTheme ?? "Général";
    const [subject, subTheme] = targetSubtheme.split(" · ");
    const entry: ErrorAnalyticsItem = {
      subject: subject ?? "Mathématiques",
      subTheme: subTheme ?? targetSubtheme,
      questionType: "qcm",
      difficulty: "Adaptatif",
      isCorrect,
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem(ERROR_ANALYTICS_KEY) ?? "[]") as ErrorAnalyticsItem[];
    localStorage.setItem(ERROR_ANALYTICS_KEY, JSON.stringify([entry, ...existing].slice(0, 4000)));

    if (weakIndex >= weakQuiz.length - 1) {
      setWeakCompleted(true);
      reloadAnalytics();
      try {
        const progress = Math.round((weakCorrect + (isCorrect ? 1 : 0)) / Math.max(1, weakQuiz.length) * 100);
        const response = await fetch("/api/quizzly/encouragement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: subject ?? "Mathématiques",
            progressPercent: progress,
            weakThemes: topWeakSubthemes.slice(0, 3).map((item) => item.subTheme),
          }),
        });
        const data = (await response.json()) as { message?: string };
        setEncouragement(data.message ?? `Tu progresses bien sur ${subject ?? "ta matière"}, continue !`);
      } catch {
        setEncouragement(`Tu as progressé de ${Math.round((weakCorrect + (isCorrect ? 1 : 0)) / Math.max(1, weakQuiz.length) * 100)}% sur tes points faibles, continue comme ça !`);
      }
      return;
    }
    setWeakIndex((prev) => prev + 1);
  };

  const chartData = useMemo(
    () => cards.filter((card) => /Quiz|Diamants|XP/.test(card.label)),
    [cards]
  );

  const currentWeakQuestion = weakQuiz[weakIndex];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-slate-800">Statistiques</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-black text-slate-800">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-slate-800">
          <BarChart3 className="h-5 w-5 text-violet-600" /> Matières & performances
        </h2>
        <div className="space-y-2">
          {chartData.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-violet-500" style={{ width: `${Math.min(100, Number.parseInt(item.value, 10) || 0)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600"><Target className="mb-2 h-4 w-4" />{t("quizzly.stats.bestScore", language)}: {advancedStats.bestScore}</div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600"><Clock3 className="mb-2 h-4 w-4" />{t("quizzly.stats.fastestQuiz", language)}: {advancedStats.fastestQuiz}</div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600"><Flame className="mb-2 h-4 w-4" />{t("quizzly.stats.longestStreak", language)}: {advancedStats.longestStreak}</div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600"><Gem className="mb-2 h-4 w-4" />{t("quizzly.stats.netDiamonds", language)}: {advancedStats.diamondsNet}</div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-black text-slate-800">Analyse des erreurs récurrentes</h2>
        <div className="space-y-2">
          {grouped.slice(0, 12).map((row) => (
            <div key={row.key} className="rounded-xl border border-slate-100 p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">{row.label}</span>
                <span className="font-black text-slate-700">{Math.round(row.errorRate * 100)}% d'erreurs</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className={`h-2 rounded-full ${rateColor(row.errorRate)}`} style={{ width: `${Math.round(row.errorRate * 100)}%` }} />
              </div>
            </div>
          ))}
          {grouped.length === 0 ? <p className="text-sm text-slate-500">Aucune donnée d'erreur disponible pour l'instant.</p> : null}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-black text-slate-800">Top 10 sous-thèmes avec le plus d'erreurs</h2>
        <div className="space-y-2">
          {topWeakSubthemes.map((row) => {
            const ratio = row.errors / Math.max(1, row.total);
            return (
              <div key={row.subTheme}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <span>{row.subTheme}</span>
                  <span>{row.errors} erreurs / {row.total} questions</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className={`h-3 rounded-full ${rateColor(ratio)}`} style={{ width: `${Math.max(6, Math.round(ratio * 100))}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <button className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40" disabled={loadingWeakQuiz || topWeakSubthemes.length === 0} onClick={startWeakPointsQuiz} type="button">
          {loadingWeakQuiz ? "Génération en cours…" : "Mes points faibles"}
        </button>
      </div>

      {currentWeakQuestion && !weakCompleted && (
        <div className="rounded-3xl border border-violet-100 bg-violet-50 p-5 shadow-sm">
          <h3 className="mb-2 text-lg font-black text-violet-800">Session de révision ciblée</h3>
          <p className="mb-3 text-sm text-violet-700">Question {weakIndex + 1}/{weakQuiz.length}</p>
          <p className="mb-3 font-bold text-slate-800">{currentWeakQuestion.question}</p>
          <div className="space-y-2">
            {currentWeakQuestion.options.map((option, optionIndex) => (
              <button key={`${option}-${optionIndex}`} className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-left text-sm hover:border-violet-400" onClick={() => registerWeakQuizAnswer(optionIndex)} type="button">
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {weakCompleted && (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
          <h3 className="text-lg font-black text-emerald-800">Progression après « Mes points faibles »</h3>
          <p className="mt-2 text-sm text-emerald-700">Réussite session ciblée: {Math.round((weakCorrect / Math.max(1, weakQuiz.length)) * 100)}%</p>
          <p className="mt-2 text-sm text-slate-700"><Sparkles className="mr-1 inline h-4 w-4 text-emerald-600" />{encouragement}</p>
        </div>
      )}
    </div>
  );
}
