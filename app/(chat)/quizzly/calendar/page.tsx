"use client";

import { useEffect, useMemo, useState } from "react";
import { getQuizzlyProfile, updateQuizzlyProfile } from "@/lib/quizzly/actions";
import { toast } from "sonner";

const MONTHLY_CALENDAR_KEY = "mai.quizzly.monthly-calendar.v1";
const MONTHLY_TITLE_KEY = "mai.quizzly.monthly-title.v1";
const MONTHLY_AVATAR_KEY = "mai.quizzly.monthly-avatar.v1";

type MonthlyState = {
  monthKey: string;
  claimedDays: number[];
  streak: number;
  lastClaimDate: string;
};

const toDateKey = (date = new Date()) => date.toISOString().slice(0, 10);
const toMonthKey = (date = new Date()) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

function rewardForStreak(day: number) {
  if (day >= 30) return { diamonds: 100, stars: 0, booster: "legendary_booster", avatar: "avatar-lunaire", title: "Héros du mois" };
  if (day >= 21) return { diamonds: 75, stars: 0, booster: null, avatar: null, title: null };
  if (day >= 14) return { diamonds: 50, stars: 0, booster: "booster_x1.5", avatar: null, title: null };
  if (day >= 10) return { diamonds: 35, stars: 0, booster: null, avatar: null, title: null };
  if (day >= 7) return { diamonds: 20, stars: 1, booster: null, avatar: null, title: null };
  if (day >= 3) return { diamonds: 10, stars: 0, booster: null, avatar: null, title: null };
  return { diamonds: 5, stars: 0, booster: null, avatar: null, title: null };
}

export default function QuizzlyMonthlyCalendarPage() {
  const [profile, setProfile] = useState<{ diamonds: number; stars: number } | null>(null);
  const [state, setState] = useState<MonthlyState | null>(null);

  const today = new Date();
  const monthKey = toMonthKey(today);
  const daysInMonth = new Date(today.getUTCFullYear(), today.getUTCMonth() + 1, 0).getDate();

  useEffect(() => {
    getQuizzlyProfile().then((p) => setProfile({ diamonds: p.diamonds, stars: p.stars }));
    try {
      const parsed = JSON.parse(localStorage.getItem(MONTHLY_CALENDAR_KEY) ?? "{}") as MonthlyState;
      if (!parsed.monthKey || parsed.monthKey !== monthKey) {
        setState({ monthKey, claimedDays: [], streak: 0, lastClaimDate: "" });
        return;
      }
      setState(parsed);
    } catch {
      setState({ monthKey, claimedDays: [], streak: 0, lastClaimDate: "" });
    }
  }, [monthKey]);

  const saveState = (next: MonthlyState) => {
    setState(next);
    localStorage.setItem(MONTHLY_CALENDAR_KEY, JSON.stringify(next));
  };

  const claimToday = async () => {
    if (!state || !profile) return;
    const dateKey = toDateKey();
    const dayNumber = Number(dateKey.slice(8, 10));
    if (state.claimedDays.includes(dayNumber)) {
      toast.error("Récompense mensuelle déjà récupérée aujourd'hui.");
      return;
    }

    const previousDate = state.lastClaimDate;
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const wasConsecutive = previousDate === toDateKey(yesterday);
    const nextStreak = wasConsecutive ? state.streak + 1 : 1;

    const reward = rewardForStreak(nextStreak);
    await updateQuizzlyProfile({ diamonds: profile.diamonds + reward.diamonds, stars: profile.stars + reward.stars });
    setProfile((prev) => (prev ? { diamonds: prev.diamonds + reward.diamonds, stars: prev.stars + reward.stars } : prev));

    if (reward.avatar) localStorage.setItem(MONTHLY_AVATAR_KEY, `${monthKey}:${reward.avatar}`);
    if (reward.title) localStorage.setItem(MONTHLY_TITLE_KEY, `${monthKey}:${reward.title}`);

    const next: MonthlyState = {
      monthKey,
      claimedDays: [...state.claimedDays, dayNumber].sort((a, b) => a - b),
      streak: nextStreak,
      lastClaimDate: dateKey,
    };
    saveState(next);

    const nextReward = rewardForStreak(nextStreak + 1);
    toast.success(`Jour ${nextStreak} validé ✅ +${reward.diamonds}💎${reward.stars > 0 ? ` +${reward.stars}⭐` : ""}. Prochain jalon: ${nextReward.diamonds}💎.`);
  };

  const completionRate = useMemo(() => {
    if (!state) return 0;
    return Math.round((state.claimedDays.length / daysInMonth) * 100);
  }, [state, daysInMonth]);

  if (!state) return <div className="py-20 text-center">Chargement du calendrier…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-slate-800">Calendrier mensuel de connexion</h1>
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">Mois en cours: <span className="font-bold">{monthKey}</span> · Streak actuelle: <span className="font-black text-violet-700">{state.streak} jours</span></p>
        <div className="mt-2 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-violet-600" style={{ width: `${completionRate}%` }} /></div>
      </div>
      <button className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white" onClick={claimToday} type="button">Réclamer la récompense du jour</button>
      <div className="grid grid-cols-7 gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const claimed = state.claimedDays.includes(day);
          return (
            <div key={`day-${day}`} className={`flex h-12 items-center justify-center rounded-lg border text-sm font-bold transition ${claimed ? "border-emerald-300 bg-emerald-100 text-emerald-700 animate-pulse" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
              {day} {claimed ? "✓" : ""}
            </div>
          );
        })}
      </div>
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
        Jalon spécial: jour 7 (+20💎 +1⭐), jour 14 (+50💎 + booster), jour 21 (+75💎), jour 30 (+100💎 + avatar mensuel + titre temporaire).
      </div>
    </div>
  );
}
