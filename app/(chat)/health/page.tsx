"use client";

import { AlertTriangle, Archive, Copy, Lock, Pin, Search, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { chatModels } from "@/lib/ai/models";

type HealthEntry = {
  id: string;
  title: string;
  question: string;
  answer: string;
  createdAt: string;
  pinned?: boolean;
  archived?: boolean;
  locked?: boolean;
};

export default function HealthPage() {
  const [message, setMessage] = useState("");
  const [modelId, setModelId] = useState("gpt-5.4-mini");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HealthEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = history.find((item) => item.id === selectedId) ?? null;
  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return history;
    }
    return history.filter((item) => `${item.title} ${item.question}`.toLowerCase().includes(query));
  }, [history, search]);

  const analyze = async () => {
    if (!message.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/health/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, modelId }),
      });
      const payload = await response.json();
      if (!response.ok) {
        return;
      }

      const entry: HealthEntry = {
        id: crypto.randomUUID(),
        title: message.slice(0, 48),
        question: message,
        answer: payload.analysis ?? "",
        createdAt: new Date().toISOString(),
      };
      setHistory((current) => [entry, ...current]);
      setSelectedId(entry.id);
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  const importFile = async (file: File) => {
    const text = await file.text();
    setMessage((current) => (current ? `${current}\n\n${text.slice(0, 12000)}` : text.slice(0, 12000)));
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl gap-4 overflow-y-auto p-4 md:p-8">
      <aside className="liquid-glass w-full max-w-sm rounded-2xl p-4">
        <h2 className="text-lg font-semibold">Historique Health</h2>
        <label className="mt-3 flex h-10 items-center gap-2 rounded-lg border border-border/60 px-2">
          <Search className="size-4 text-muted-foreground" />
          <input className="w-full bg-transparent text-sm outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une discussion..." value={search} />
        </label>
        <div className="mt-3 space-y-2">
          {filteredHistory.map((item) => (
            <button className="w-full rounded-lg border border-border/60 p-2 text-left text-xs hover:border-primary/40" key={item.id} onClick={() => setSelectedId(item.id)} type="button">
              <p className="font-semibold">{item.title}</p>
              <p className="text-muted-foreground">{new Date(item.createdAt).toLocaleString("fr-FR")}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="rounded border px-1.5 py-0.5" onClick={(event) => { event.stopPropagation(); setHistory((current) => current.map((entry) => entry.id === item.id ? { ...entry, locked: !entry.locked } : entry)); }}><Lock className="inline size-3" /> verrouiller</span>
                <span className="rounded border px-1.5 py-0.5" onClick={(event) => { event.stopPropagation(); navigator.clipboard.writeText(`${item.question}\n\n${item.answer}`); }}><Copy className="inline size-3" /> copier</span>
                <span className="rounded border px-1.5 py-0.5" onClick={(event) => { event.stopPropagation(); const blob = new Blob([`${item.question}\n\n${item.answer}`], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${item.title}.txt`; a.click(); URL.revokeObjectURL(url); }}><Upload className="inline size-3" /> exporter</span>
                <span className="rounded border px-1.5 py-0.5" onClick={(event) => { event.stopPropagation(); setHistory((current) => current.map((entry) => entry.id === item.id ? { ...entry, pinned: !entry.pinned } : entry)); }}><Pin className="inline size-3" /> épingler</span>
                <span className="rounded border px-1.5 py-0.5" onClick={(event) => { event.stopPropagation(); setHistory((current) => current.map((entry) => entry.id === item.id ? { ...entry, archived: !entry.archived } : entry)); }}><Archive className="inline size-3" /> archiver</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="liquid-glass flex-1 rounded-2xl p-4">
        <h1 className="text-3xl font-bold">Health</h1>
        <div className="mt-3 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-sm">
          <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="size-4" /> Avertissement médical</p>
          <p>Cette IA ne remplace pas un professionnel de santé.</p>
        </div>

        <label className="mt-4 block text-sm">Modèle IA
          <select className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-background px-2" onChange={(event) => setModelId(event.target.value)} value={modelId}>
            {chatModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
          </select>
        </label>

        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm">
          <Upload className="size-4" /> Importer un fichier
          <input className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) { importFile(file); } }} type="file" />
        </label>

        <textarea className="mt-3 h-40 w-full rounded-xl border border-border/60 bg-background/60 p-3 text-sm" onChange={(event) => setMessage(event.target.value)} placeholder="Posez votre question santé, ou importez un document..." value={message} />
        <Button className="mt-3" onClick={analyze} type="button">{loading ? "Analyse..." : "Analyser"}</Button>

        <article className="mt-4 rounded-xl border border-border/60 bg-background/60 p-3 text-sm">
          {selected ? <pre className="whitespace-pre-wrap">{selected.answer}</pre> : "Sélectionnez un échange dans l'historique."}
        </article>
      </section>
    </div>
  );
}
