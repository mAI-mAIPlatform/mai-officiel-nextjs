"use client";

import {
  BotIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { chatModels } from "@/lib/ai/models";

type Agent = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  baseModel: string | null;
  systemPrompt: string | null;
  memory: string | null;
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const expertPresets = [
  "Enseignant",
  "Développeur",
  "Écrivain",
  "Coach",
  "Juridique",
  "Chef",
  "Voyageur",
  "Designer",
  "Analyste",
  "Santé",
  "Cyber",
  "Cinéphile",
  "Musicien",
  "Stratège",
] as const;

const setModelCookie = (value: string) => {
  const maxAge = 60 * 60 * 24 * 365;
  // biome-ignore lint/suspicious/noDocumentCookie: setting model preference client-side intentionally
  document.cookie = `chat-model=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
};

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(file);
  });
}

export default function MaisPage() {
  const router = useRouter();
  const {
    data: agents,
    error,
    mutate,
  } = useSWR<Agent[]>("/api/agents", fetcher);
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [memory, setMemory] = useState("");
  const [image, setImage] = useState("");
  const [baseModel, setBaseModel] = useState(chatModels[0]?.id ?? "");

  const [tone, setTone] = useState("50");
  const [conciseness, setConciseness] = useState("50");
  const [languageRegister, setLanguageRegister] = useState("50");

  const resetForm = () => {
    setName("");
    setDescription("");
    setSystemPrompt("");
    setMemory("");
    setImage("");
    setBaseModel(chatModels[0]?.id ?? "");
    setTone("50");
    setConciseness("50");
    setLanguageRegister("50");
    setEditingAgentId(null);
  };

  const openSettings = (agent: Agent) => {
    setEditingAgentId(agent.id);
    setName(agent.name);
    setDescription(agent.description ?? "");
    setSystemPrompt(agent.systemPrompt ?? "");
    setMemory(agent.memory ?? "");
    setImage(agent.image ?? "");
    setBaseModel(agent.baseModel ?? chatModels[0]?.id ?? "");
    setIsSettingsOpen(true);
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          systemPrompt,
          memory,
          image,
          baseModel,
          tone: Number.parseInt(tone, 10),
          conciseness: Number.parseInt(conciseness, 10),
          languageRegister: Number.parseInt(languageRegister, 10),
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur de création");
      }

      toast.success("mAI créé avec succès");
      setIsOpen(false);
      resetForm();
      mutate();
    } catch {
      toast.error("Impossible de créer le mAI");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgentId) {
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/agents/${editingAgentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          systemPrompt,
          memory,
          image,
          baseModel,
        }),
      });
      if (!res.ok) {
        throw new Error("Erreur de mise à jour");
      }
      toast.success("mAI mis à jour");
      setIsSettingsOpen(false);
      resetForm();
      mutate();
    } catch {
      toast.error("Impossible de modifier le mAI");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    toast("Confirmer la suppression de ce mAI ?", {
      action: {
        label: "Supprimer",
        onClick: async () => {
          try {
            const res = await fetch(`/api/agents/${id}`, { method: "DELETE" });
            if (!res.ok) {
              throw new Error("Erreur");
            }
            toast.success("mAI supprimé");
            if (editingAgentId === id) {
              setIsSettingsOpen(false);
              resetForm();
            }
            mutate();
          } catch {
            toast.error("Impossible de supprimer le mAI");
          }
        },
      },
    });
  };

  return (
    <div className="liquid-glass flex h-full w-full flex-col overflow-y-auto p-8 md:p-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <span className="inline-flex size-9 items-center justify-center rounded-xl border border-black/20 bg-white text-black dark:border-white/20 dark:bg-black dark:text-white">
              <BotIcon className="size-5" />
            </span>
            Mes mAIs
          </h1>
          <p className="mt-2 text-muted-foreground">
            IAs personnalisées avec rôles, personnalités et connaissances
            spécifiques.
          </p>
        </div>

        <Dialog
          onOpenChange={(nextOpen) => {
            setIsOpen(nextOpen);
            if (!nextOpen) {
              resetForm();
            }
          }}
          open={isOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 size-4" />
              Créer un mAI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-white text-black dark:bg-white dark:text-black">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle IA (mAI)</DialogTitle>
            </DialogHeader>
            <form className="mt-4 space-y-6" onSubmit={handleCreateAgent}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du mAI</Label>
                    <Input
                      id="name"
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: mAI Dev Next.js"
                      required
                      value={name}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Spécialiste en React et Tailwind..."
                      value={description}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="baseModel">Modèle de base</Label>
                    <select
                      className="flex h-10 w-full rounded-xl border border-border/60 bg-background px-3 py-1 text-sm"
                      id="baseModel"
                      onChange={(e) => setBaseModel(e.target.value)}
                      value={baseModel}
                    >
                      {chatModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} ({model.provider})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-image">
                      Logo du mAI (URL ou fichier)
                    </Label>
                    <Input
                      id="agent-image"
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://.../logo.png"
                      value={image}
                    />
                    <input
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) {
                          return;
                        }
                        try {
                          const dataUrl = await readFileAsDataUrl(file);
                          setImage(dataUrl);
                          toast.success("Logo importé");
                        } catch {
                          toast.error("Import du logo impossible");
                        }
                      }}
                      ref={logoInputRef}
                      type="file"
                    />
                    <Button
                      onClick={() => logoInputRef.current?.click()}
                      type="button"
                      variant="outline"
                    >
                      <UploadIcon className="mr-2 size-4" />
                      Importer un logo
                    </Button>
                  </div>
                </div>

                <div className="space-y-6 rounded-lg border bg-muted/30 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <SlidersHorizontalIcon className="size-4" />{" "}
                    Personnalisation du Comportement
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Créatif / Libre</span>
                      <span>Ton ({tone}%)</span>
                      <span>Strict / Pro</span>
                    </div>
                    <input
                      className="w-full accent-primary"
                      max="100"
                      min="0"
                      onChange={(e) => setTone(e.target.value)}
                      type="range"
                      value={tone}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Très détaillé</span>
                      <span>Concision ({conciseness}%)</span>
                      <span>Ultra concis</span>
                    </div>
                    <input
                      className="w-full accent-primary"
                      max="100"
                      min="0"
                      onChange={(e) => setConciseness(e.target.value)}
                      type="range"
                      value={conciseness}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Familier</span>
                      <span>Registre Linguistique ({languageRegister}%)</span>
                      <span>Soutenu</span>
                    </div>
                    <input
                      className="w-full accent-primary"
                      max="100"
                      min="0"
                      onChange={(e) => setLanguageRegister(e.target.value)}
                      type="range"
                      value={languageRegister}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemPrompt">
                  Instructions (System Prompt)
                </Label>
                <Textarea
                  id="systemPrompt"
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Tu es un expert en développement web..."
                  rows={4}
                  value={systemPrompt}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memory">
                  Connaissances / Sources supplémentaires
                </Label>
                <Textarea
                  id="memory"
                  onChange={(e) => setMemory(e.target.value)}
                  placeholder="Texte de référence, documentation à utiliser en priorité..."
                  rows={3}
                  value={memory}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Annuler
                </Button>
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting && (
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                  )}
                  Créer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <section className="mb-6 rounded-2xl border border-border/50 bg-card/65 p-4">
        <h2 className="mb-3 text-sm font-semibold">
          mAIs Presets (14 experts)
        </h2>
        <div className="flex flex-wrap gap-2">
          {expertPresets.map((preset) => (
            <button
              className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs transition-colors hover:border-primary/40 hover:text-primary"
              key={preset}
              onClick={() => {
                setIsOpen(true);
                setName(`mAI ${preset}`);
                setDescription(`Assistant expert : ${preset}.`);
                setSystemPrompt(
                  `Tu es un expert ${preset}. Réponds avec précision, pédagogie et structure.`
                );
              }}
              type="button"
            >
              {preset}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          Erreur lors du chargement des mAIs.
        </div>
      ) : agents ? (
        agents.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed text-center">
            <BotIcon className="mb-4 size-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">Aucun mAI</h3>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">
              Créez votre première intelligence artificielle spécialisée.
            </p>
            <Button onClick={() => setIsOpen(true)}>
              Créer mon premier mAI
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div
                className="liquid-glass group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card/70 p-6 shadow-sm transition-all hover:shadow-md"
                key={agent.id}
              >
                <button
                  className="text-left"
                  onClick={() => {
                    setModelCookie(`agent-${agent.id}`);
                    router.push("/");
                  }}
                  type="button"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-black/20 bg-white text-black dark:border-white/20 dark:bg-black dark:text-white">
                    {agent.image ? (
                      <div
                        className="h-8 w-8 rounded-md bg-cover bg-center"
                        style={{ backgroundImage: `url(${agent.image})` }}
                      />
                    ) : (
                      <BotIcon className="size-6" />
                    )}
                  </div>
                  <h3 className="mb-1 font-semibold tracking-tight">
                    {agent.name}
                  </h3>
                  <p className="mb-2 text-xs font-medium text-primary/80">
                    {agent.baseModel}
                  </p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {agent.description || "Aucune description."}
                  </p>
                </button>
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <span className="text-xs text-muted-foreground">
                    Créé le {new Date(agent.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      className="size-8"
                      onClick={() => openSettings(agent)}
                      size="icon"
                      title="Paramètres"
                      type="button"
                      variant="ghost"
                    >
                      <SettingsIcon className="size-4" />
                    </Button>
                    <Button
                      className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(agent.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="flex h-40 items-center justify-center">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      <Dialog onOpenChange={setIsSettingsOpen} open={isSettingsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-white text-black dark:bg-white dark:text-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PencilIcon className="size-4" /> Modifier le mAI
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handleUpdateAgent}>
            <div className="space-y-2">
              <Label htmlFor="set-name">Nom</Label>
              <Input
                id="set-name"
                onChange={(e) => setName(e.target.value)}
                required
                value={name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-description">Description</Label>
              <Input
                id="set-description"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-image">Logo (URL)</Label>
              <Input
                id="set-image"
                onChange={(e) => setImage(e.target.value)}
                value={image}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-base">Modèle de base</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-border/60 bg-background px-3 py-1 text-sm"
                id="set-base"
                onChange={(e) => setBaseModel(e.target.value)}
                value={baseModel}
              >
                {chatModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-system">Instructions IA</Label>
              <Textarea
                id="set-system"
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={4}
                value={systemPrompt}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-memory">Sources</Label>
              <Textarea
                id="set-memory"
                onChange={(e) => setMemory(e.target.value)}
                rows={4}
                value={memory}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button
                className="text-destructive"
                onClick={() => editingAgentId && handleDelete(editingAgentId)}
                type="button"
                variant="ghost"
              >
                <Trash2Icon className="mr-2 size-4" /> Supprimer
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting && (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                )}{" "}
                Enregistrer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
