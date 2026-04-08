"use client";

import {
  FolderKanbanIcon,
  Loader2Icon,
  PlusIcon,
  UploadIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Project = {
  createdAt: string;
  description: string | null;
  id: string;
  image: string | null;
  instructions: string | null;
  memory: string | null;
  name: string;
  updatedAt: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(file);
  });
}

async function readFileAsText(file: File): Promise<string> {
  return file.text();
}

export default function ProjectsPage() {
  const {
    data: projects,
    error,
    mutate,
  } = useSWR<Project[]>("/api/projects", fetcher);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [memory, setMemory] = useState("");
  const [image, setImage] = useState("");

  const logoRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setInstructions("");
    setMemory("");
    setImage("");
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          instructions,
          memory,
          image,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur de création");
      }

      const createdProject = (await res.json()) as Project;
      toast.success("Projet créé avec succès");
      setIsCreateOpen(false);
      resetForm();
      await mutate();
      window.location.href = `/projects/${createdProject.id}`;
    } catch {
      toast.error("Impossible de créer le projet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="liquid-glass flex h-full w-full flex-col overflow-y-auto p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <FolderKanbanIcon className="size-8 text-primary" />
            Projets
          </h1>
          <p className="mt-2 text-muted-foreground">
            Créez et gérez vos projets. Ouvrez un projet pour accéder à Sources,
            Conversations et Tâches.
          </p>
        </div>

        <Dialog onOpenChange={setIsCreateOpen} open={isCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 size-4" />
              Créer un projet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-white text-black dark:bg-white dark:text-black">
            <DialogHeader>
              <DialogTitle>Créer un nouveau projet</DialogTitle>
              <DialogDescription>
                Ajoutez le titre, la description, les instructions IA, les
                sources et un logo.
              </DialogDescription>
            </DialogHeader>
            <form className="mt-4 space-y-5" onSubmit={handleCreateProject}>
              <div className="space-y-2">
                <Label htmlFor="name">Titre du projet</Label>
                <Input
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Refonte site web"
                  required
                  value={name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Objectif et périmètre du projet"
                  rows={2}
                  value={description}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Logo du projet (URL ou fichier)</Label>
                <Input
                  id="image"
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
                      setImage(await readFileAsDataUrl(file));
                      toast.success("Logo importé");
                    } catch {
                      toast.error("Import du logo impossible");
                    }
                  }}
                  ref={logoRef}
                  type="file"
                />
                <Button
                  onClick={() => logoRef.current?.click()}
                  type="button"
                  variant="outline"
                >
                  <UploadIcon className="mr-2 size-4" />
                  Importer le logo
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions IA</Label>
                <Textarea
                  id="instructions"
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Règles globales pour les conversations de ce projet"
                  rows={3}
                  value={instructions}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memory">Sources / connaissances</Label>
                <Textarea
                  id="memory"
                  onChange={(e) => setMemory(e.target.value)}
                  placeholder="Documentation, notes, contexte métier"
                  rows={4}
                  value={memory}
                />
                <input
                  accept=".txt,.md,.csv,.json,.pdf,.doc,.docx"
                  className="hidden"
                  multiple
                  onChange={async (event) => {
                    const files = Array.from(event.target.files ?? []);
                    if (files.length === 0) {
                      return;
                    }
                    try {
                      const contents = await Promise.all(
                        files.map(
                          async (file) =>
                            `\n\n--- ${file.name} ---\n${await readFileAsText(file)}`
                        )
                      );
                      setMemory((prev) =>
                        `${prev}${contents.join("\n")}`.trim()
                      );
                      toast.success("Sources importées dans le projet");
                    } catch {
                      toast.error("Impossible d'importer certains fichiers");
                    }
                  }}
                  ref={sourceRef}
                  type="file"
                />
                <Button
                  onClick={() => sourceRef.current?.click()}
                  type="button"
                  variant="outline"
                >
                  <UploadIcon className="mr-2 size-4" />
                  Importer des fichiers source
                </Button>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => setIsCreateOpen(false)}
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
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          Erreur lors du chargement des projets.
        </div>
      ) : projects ? (
        <div className="liquid-panel rounded-2xl border border-border/40 p-4">
          {projects.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed text-center">
              <FolderKanbanIcon className="mb-4 size-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">Aucun projet</h3>
              <p className="mb-4 mt-1 text-sm text-muted-foreground">
                Vous n'avez pas encore créé de projet.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                Créer mon premier projet
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <Link
                  className="liquid-glass flex items-start gap-3 rounded-xl border border-border/35 p-4 text-left transition hover:border-border/70"
                  href={`/projects/${project.id}`}
                  key={project.id}
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary/10">
                    {project.image ? (
                      <Image
                        alt={`Logo ${project.name}`}
                        className="h-full w-full object-cover"
                        height={40}
                        src={project.image}
                        unoptimized
                        width={40}
                      />
                    ) : (
                      <FolderKanbanIcon className="size-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{project.name}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {project.description || "Aucune description."}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
