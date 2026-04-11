"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProjectFormProps = {
  mode: "create" | "edit";
  initialValues?: {
    id: string;
    name: string;
    instructions: string | null;
  };
};

export function ProjectForm({ mode, initialValues }: ProjectFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [instructions, setInstructions] = useState(
    initialValues?.instructions ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Le nom du projet est obligatoire.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const endpoint =
      mode === "create"
        ? "/api/projects"
        : `/api/projects/${initialValues?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, instructions }),
    });

    if (!response.ok) {
      setIsSaving(false);
      setError("Impossible d'enregistrer le projet.");
      return;
    }

    router.push("/projects");
    router.refresh();
  };

  return (
    <form
      className="liquid-panel mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-white/20 p-6 backdrop-blur-2xl"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="project-name">
          Nom du projet
        </label>
        <input
          className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm outline-none transition focus:border-cyan-300"
          id="project-name"
          maxLength={120}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex: Refonte produit Q3"
          required
          value={name}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="project-instructions">
          Instructions globales
        </label>
        <textarea
          className="min-h-40 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm outline-none transition focus:border-cyan-300"
          id="project-instructions"
          maxLength={5000}
          onChange={(event) => setInstructions(event.target.value)}
          placeholder="Contexte, ton et contraintes du projet..."
          value={instructions}
        />
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <button
        className="rounded-xl border border-cyan-300/30 bg-cyan-400/20 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/30 disabled:opacity-50"
        disabled={isSaving}
        type="submit"
      >
        {isSaving
          ? "Enregistrement..."
          : mode === "create"
            ? "Créer le projet"
            : "Mettre à jour"}
      </button>
    </form>
  );
}
