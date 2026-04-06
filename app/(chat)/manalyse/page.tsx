"use client";

import { FileText, Link as LinkIcon, Search, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";

export default function MAnalysePage() {
  const { isHydrated } = useSubscriptionPlan();
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim() && !file) {
      setError("Veuillez fournir une URL ou un fichier.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport("");

    const formData = new FormData();
    if (url.trim()) formData.append("url", url);
    if (file) formData.append("file", file);

    try {
      const response = await fetch("/api/manalyse", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setReport(data.report);
      } else {
        setError(data.error || "Une erreur s'est produite lors de l'analyse.");
      }
    } catch (_err) {
      setError("Erreur de connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="liquid-glass flex h-full w-full flex-col gap-5 overflow-y-auto p-6 md:p-10">
      <div className="flex items-center gap-3">
        <Search className="size-8 text-primary" />
        <h1 className="text-3xl font-bold">Analyseur (mAnalyse)</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Scraping web, OCR et extraction de texte (PDF, DOCX, TXT) avec rapport
        structuré par IA.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Colonne gauche : Input */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border/50 bg-card/70 p-5">
            <h2 className="mb-4 font-semibold flex items-center gap-2">
              <LinkIcon className="size-4" /> Analyser une URL
            </h2>
            <input
              className="h-11 w-full rounded-xl border border-border bg-background/60 px-3 text-sm"
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              value={url}
            />
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/70 p-5">
            <h2 className="mb-4 font-semibold flex items-center gap-2">
              <FileText className="size-4" /> Analyser un document
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Formats supportés : PDF, DOCX, TXT, PNG, JPG.
            </p>

            <div
              className="border-2 border-dashed border-border/50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="size-8 text-muted-foreground mb-2" />
              {file ? (
                <p className="text-sm font-medium text-primary">{file.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Cliquez pour importer un fichier
                </p>
              )}
              <input
                accept=".pdf,.docx,.txt,image/png,image/jpeg"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
                type="file"
              />
            </div>

            {file && (
              <Button
                className="mt-2 text-xs w-full"
                onClick={() => setFile(null)}
                size="sm"
                variant="ghost"
              >
                Retirer le fichier
              </Button>
            )}
          </div>

          <Button
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading || (!url && !file) || !isHydrated}
            onClick={handleAnalyze}
          >
            {isLoading ? "Analyse en cours..." : "Générer le rapport"}
          </Button>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
        </div>

        {/* Colonne droite : Output */}
        <div className="rounded-2xl border border-border/50 bg-card/70 p-5 flex flex-col h-[500px]">
          <h2 className="mb-4 font-semibold">Rapport structuré</h2>
          <div className="flex-1 bg-background/50 rounded-xl border border-border/50 p-4 overflow-y-auto">
            {report ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {/* Utilisation simple d'un rendu textuel pour l'instant */}
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {report}
                </pre>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic text-center">
                Le rapport apparaîtra ici après l'analyse.
                <br />
                Il contiendra un Résumé, des Points clés, une Analyse de
                sentiment et une Conclusion.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
