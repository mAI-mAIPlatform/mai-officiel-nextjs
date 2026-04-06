"use client";

import { useChat } from "@ai-sdk/react";
import {
  Copy,
  FileText,
  PenTool,
  RefreshCw,
  SendHorizonal,
  Settings2,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Ecri20Page() {
  const [tone, setTone] = useState("Professionnel");
  const [format, setFormat] = useState("Post LinkedIn");
  const [documentContent, setDocumentContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    append,
  } = useChat({
    api: "/api/chat", // Utilisation de l'API de chat standard
    body: {
      id: "ecri20-" + Date.now(),
      systemInstruction: `Tu es Ecri20, une IA de rédaction augmentée. Ton objectif est d'aider l'utilisateur à rédiger du contenu.
      Les préférences actuelles de l'utilisateur sont :
      - Ton : ${tone}
      - Format : ${format}

      Adapte TOUTES tes réponses à ce ton et ce format. Propose des brouillons complets ou des améliorations de textes existants.`,
    },
  });

  // Pour synchroniser le dernier message de l'IA vers l'éditeur de droite, on pourrait ajouter un bouton
  // "Utiliser ce texte" sur les messages, mais pour rester simple, l'utilisateur peut copier-coller
  // ou on peut auto-remplir si le document est vide.

  const handleExport = (type: "txt" | "json" | "docx" | "pdf") => {
    if (!documentContent) return;

    // Simplification : pour l'instant, on exporte en TXT ou JSON côté client.
    // Pour DOCX/PDF, il faudrait soit une lib client (comme jspdf), soit un appel API.
    let content = documentContent;
    let mime = "text/plain";
    const filename = `ecri20-export.${type}`;

    if (type === "json") {
      content = JSON.stringify(
        {
          content: documentContent,
          tone,
          format,
          date: new Date().toISOString(),
        },
        null,
        2
      );
      mime = "application/json";
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="liquid-glass flex h-full w-full flex-col gap-4 overflow-hidden p-4 md:p-6">
      {/* Header & Sélecteurs */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card/70 p-4 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <PenTool className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Ecri20</h1>
            <p className="text-xs text-muted-foreground">
              IA de rédaction augmentée.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-background/50 border border-border/50 rounded-lg p-1">
            <Settings2 className="size-4 ml-2 text-muted-foreground" />
            <select
              className="bg-transparent text-sm font-medium focus:outline-none p-1 border-r border-border/50 pr-2"
              onChange={(e) => setTone(e.target.value)}
              value={tone}
            >
              <option value="Professionnel">Professionnel</option>
              <option value="Amical">Amical</option>
              <option value="Créatif">Créatif</option>
              <option value="Chill">Chill</option>
            </select>
            <select
              className="bg-transparent text-sm font-medium focus:outline-none p-1"
              onChange={(e) => setFormat(e.target.value)}
              value={format}
            >
              <option value="Post LinkedIn">Post LinkedIn</option>
              <option value="Email">Email</option>
              <option value="Chapitre de roman">Chapitre de roman</option>
              <option value="Essai académique">Essai académique</option>
            </select>
          </div>

          <Button
            onClick={() => setMessages([])}
            size="sm"
            title="Nouvelle session"
            variant="outline"
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </header>

      {/* Main Content : Split View */}
      <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden">
        {/* Left Panel: Chat Interface */}
        <div className="flex flex-col w-full md:w-1/3 rounded-2xl border border-border/50 bg-card/70 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <PenTool className="size-8 mb-2 opacity-50" />
                <p className="text-sm">
                  Que souhaitez-vous écrire aujourd'hui ?
                </p>
                <p className="text-xs mt-2 opacity-70">
                  L'IA s'adaptera au ton "{tone}" et au format "{format}".
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  key={m.id}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border border-border/50 whitespace-pre-wrap"
                    }`}
                  >
                    {m.content}
                    {m.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/10 justify-end">
                        <button
                          className="text-[10px] uppercase tracking-wider font-semibold opacity-70 hover:opacity-100 flex items-center gap-1"
                          onClick={() =>
                            setDocumentContent((prev) =>
                              prev ? prev + "\n\n" + m.content : m.content
                            )
                          }
                        >
                          <Copy className="size-3" /> Transférer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-background border border-border/50 rounded-2xl px-4 py-2 text-sm text-muted-foreground animate-pulse">
                  Ecri20 réfléchit...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-background/50 border-t border-border/50">
            <form
              className="flex items-center gap-2 relative"
              onSubmit={handleSubmit}
            >
              <input
                className="w-full bg-background border border-border/50 rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                disabled={isLoading}
                onChange={handleInputChange}
                placeholder="Donnez vos instructions..."
                value={input}
              />
              <Button
                className="absolute right-1 size-8 rounded-lg"
                disabled={isLoading || !input.trim()}
                size="icon"
                type="submit"
              >
                <SendHorizonal className="size-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Right Panel: Document Editor */}
        <div className="flex flex-col w-full md:w-2/3 rounded-2xl border border-border/50 bg-card/70 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-border/50 bg-background/30">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Document Final</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden lg:inline-block mr-2">
                Exporter :
              </span>
              <Button
                className="h-7 px-2 text-xs"
                onClick={() => handleExport("txt")}
                size="sm"
                variant="outline"
              >
                .TXT
              </Button>
              <Button
                className="h-7 px-2 text-xs"
                onClick={() => handleExport("json")}
                size="sm"
                variant="outline"
              >
                .JSON
              </Button>
              <Button
                className="h-7 px-2 text-xs"
                onClick={() => handleExport("docx")}
                size="sm"
                variant="outline"
              >
                .DOCX
              </Button>
              <Button
                className="h-7 px-2 text-xs"
                onClick={() => handleExport("pdf")}
                size="sm"
                variant="outline"
              >
                .PDF
              </Button>
            </div>
          </div>

          <div className="flex-1 p-4 bg-background/50">
            <textarea
              className="w-full h-full bg-transparent border-none resize-none focus:outline-none p-4 text-sm leading-relaxed"
              onChange={(e) => setDocumentContent(e.target.value)}
              placeholder="Votre document structuré apparaîtra ici. Vous pouvez le modifier directement ou transférer les réponses de l'IA avec le bouton 'Transférer'."
              ref={textareaRef}
              value={documentContent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
