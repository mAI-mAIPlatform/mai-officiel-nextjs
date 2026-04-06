"use client";

import { useChat } from "@ai-sdk/react";
import { Lightbulb, RefreshCw, SendHorizonal } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export default function BrainstormingPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat", // Utilisation de l'API de chat standard
    body: {
      id: "brainstorming-" + Date.now(),
      systemInstruction: `Tu es un Partenaire de Brainstorming expert. Tu dois agir en Mode Socrate.
      RÈGLES STRICTES :
      1. Ne donne JAMAIS de réponse finale ou fermée dès le début.
      2. Pose TOUJOURS au moins une ou deux questions de relance ou de réflexion pour approfondir l'idée de l'utilisateur.
      3. Tes réponses DOIVENT inclure des visualisations claires, sous forme de listes à puces (bullet points) ou de structures de plans hiérarchisés.
      4. Ton but est de faire émerger l'idée parfaite de l'utilisateur, pas de faire le travail à sa place.
      5. Sois encourageant, curieux et structuré.`,
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="liquid-glass flex h-full w-full flex-col gap-4 overflow-hidden p-4 md:p-10 max-w-4xl mx-auto">
      <header className="flex items-center justify-between rounded-2xl border border-border/50 bg-card/70 p-5 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-3 rounded-xl text-amber-500">
            <Lightbulb className="size-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Brainstorming</h1>
            <p className="text-sm text-muted-foreground">
              Mode Socrate : Réflexion interactive par itérations.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setMessages([])}
          size="icon"
          title="Nouvelle session"
          variant="ghost"
        >
          <RefreshCw className="size-5" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-border/50 bg-card/70 p-4 md:p-6 flex flex-col gap-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Lightbulb className="size-12 mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">
              Quelle est votre idée de départ ?
            </p>
            <p className="text-sm mt-2 max-w-md">
              Lancez un sujet (un projet, un article, un problème). Je vous
              guiderai avec des questions ciblées et des structures claires pour
              le développer.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              key={m.id}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground text-sm"
                    : "bg-background border border-border/50 prose prose-sm dark:prose-invert max-w-none"
                }`}
              >
                {m.role === "user" ? (
                  m.content
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: m.content
                        .replace(/\n\n/g, "</p><p>")
                        .replace(/\n- /g, "<br/>• ")
                        .replace(/\n\*/g, "<br/>• "),
                    }}
                  />
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-background border border-border/50 rounded-2xl px-5 py-4 text-sm text-muted-foreground animate-pulse">
              En pleine réflexion socratique...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 p-2 bg-card/70 rounded-2xl border border-border/50">
        <form
          className="flex items-center gap-2 relative"
          onSubmit={handleSubmit}
        >
          <input
            className="w-full bg-background border border-border/50 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-amber-500/50 transition-colors"
            disabled={isLoading}
            onChange={handleInputChange}
            placeholder="Ex: Je veux créer une application pour les étudiants..."
            value={input}
          />
          <Button
            className="absolute right-2 size-10 rounded-lg bg-amber-500 hover:bg-amber-600 text-white"
            disabled={isLoading || !input.trim()}
            size="icon"
            type="submit"
          >
            <SendHorizonal className="size-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
