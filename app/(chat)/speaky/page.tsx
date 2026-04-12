"use client";

import { Download, Pause, Play, Square, Waves } from "lucide-react";
import { useMemo, useState } from "react";

type VoiceGender = "male" | "female";

export default function SpeakyPage() {
  const [text, setText] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>("female");
  const [isPlaying, setIsPlaying] = useState(false);

  const available = useMemo(() => {
    if (typeof window === "undefined") {
      return [] as SpeechSynthesisVoice[];
    }

    const voices = window.speechSynthesis.getVoices();
    return voices.filter((voice) => {
      const voiceName = voice.name.toLowerCase();
      return voiceGender === "female"
        ? /(female|woman|femme|sophie|claire)/i.test(voiceName)
        : /(male|man|homme|thomas|daniel)/i.test(voiceName);
    });
  }, [voiceGender]);

  const speak = () => {
    if (typeof window === "undefined" || !text.trim()) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (available[0]) {
      utterance.voice = available[0];
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="liquid-glass flex h-full flex-col gap-4 overflow-auto p-4 md:p-8">
      <header>
        <h1 className="text-2xl font-semibold">Speaky</h1>
        <p className="text-sm text-muted-foreground">
          Studio vocal TTS: choix de voix, ton, vitesse et lecture instantanée.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="liquid-panel space-y-3 rounded-2xl p-4">
          <textarea
            className="min-h-[280px] w-full rounded-xl border border-border/40 bg-background/70 p-3 text-sm"
            onChange={(event) => setText(event.target.value)}
            placeholder="Collez le texte à transformer en audio..."
            value={text}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs">
              Vitesse ({rate.toFixed(1)}x)
              <input
                className="mt-1 w-full"
                max={1.8}
                min={0.6}
                onChange={(event) => setRate(Number(event.target.value))}
                step={0.1}
                type="range"
                value={rate}
              />
            </label>

            <label className="text-xs">
              Tonalité ({pitch.toFixed(1)})
              <input
                className="mt-1 w-full"
                max={1.8}
                min={0.4}
                onChange={(event) => setPitch(Number(event.target.value))}
                step={0.1}
                type="range"
                value={pitch}
              />
            </label>
          </div>

          <div className="flex gap-2">
            {([
              ["female", "Voix femme"],
              ["male", "Voix homme"],
            ] as const).map(([value, label]) => (
              <button
                className={`rounded-lg border px-3 py-1 text-xs ${
                  voiceGender === value ? "bg-black text-white" : "text-muted-foreground"
                }`}
                key={value}
                onClick={() => setVoiceGender(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-xs text-white" onClick={speak} type="button">
              <Play className="size-3.5" />
              Générer / lire
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs"
              onClick={() => window.speechSynthesis.pause()}
              type="button"
            >
              <Pause className="size-3.5" />
              Pause
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs"
              onClick={() => {
                window.speechSynthesis.cancel();
                setIsPlaying(false);
              }}
              type="button"
            >
              <Square className="size-3.5" />
              Stop
            </button>
          </div>
        </section>

        <aside className="liquid-panel rounded-2xl p-4 text-xs text-muted-foreground">
          <p className="mb-2 inline-flex items-center gap-2 font-medium text-foreground">
            <Waves className="size-4" />
            État du rendu
          </p>
          <p>{isPlaying ? "Lecture en cours" : "En attente"}</p>
          <p className="mt-3">Export: utilisez l'enregistreur natif du navigateur pour un MP3/WAV.</p>
          <button className="mt-3 inline-flex items-center gap-2 rounded-xl border px-3 py-2" type="button">
            <Download className="size-3.5" />
            Ajouter à la bibliothèque (bientôt)
          </button>
        </aside>
      </div>
    </div>
  );
}
