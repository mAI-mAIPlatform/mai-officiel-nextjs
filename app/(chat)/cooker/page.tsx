"use client";

import { ChefHat, Settings2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { chatModels } from "@/lib/ai/models";
import { cn } from "@/lib/utils";

type Category = "Plat" | "Entrée" | "Dessert";

type CookerDefaults = {
  category: Category;
  includeDefaults: string;
  excludeDefaults: string;
  maxMinutes: number;
  servings: number;
  thermomixMode: boolean;
  modelId: string;
};

const SUGGESTIONS = [
  "risotto champignons", "lasagnes végétariennes", "curry pois chiches", "tarte tatin", "mousse chocolat", "salade niçoise", "ramen poulet", "gratin dauphinois", "soufflé fromage", "tajine légumes", "paella fruits de mer", "gnocchis pesto", "quiche épinards", "velouté potimarron", "poulet citron", "brownie noix", "pavlova fruits rouges", "chili sin carne", "poke bowl", "burger lentilles", "tomates", "basilic", "courgettes", "saumon", "riz", "quinoa", "paprika", "coriandre", "ail", "gingembre",
] as const;

const STORAGE_KEY = "mai.cooker.defaults.v1";

function loadDefaults(): CookerDefaults {
  if (typeof window === "undefined") {
    return {
      category: "Plat",
      includeDefaults: "",
      excludeDefaults: "",
      maxMinutes: 30,
      servings: 4,
      thermomixMode: false,
      modelId: "gpt-5.5",
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      throw new Error("no data");
    }

    const parsed = JSON.parse(raw) as CookerDefaults;
    return {
      category: parsed.category ?? "Plat",
      includeDefaults: parsed.includeDefaults ?? "",
      excludeDefaults: parsed.excludeDefaults ?? "",
      maxMinutes: Number(parsed.maxMinutes) || 30,
      servings: Number(parsed.servings) || 4,
      thermomixMode: Boolean(parsed.thermomixMode),
      modelId: parsed.modelId || "gpt-5.5",
    };
  } catch {
    return {
      category: "Plat",
      includeDefaults: "",
      excludeDefaults: "",
      maxMinutes: 30,
      servings: 4,
      thermomixMode: false,
      modelId: "gpt-5.5",
    };
  }
}

export default function CookerPage() {
  const defaults = useMemo(() => loadDefaults(), []);
  const [description, setDescription] = useState("");
  const [includeIngredients, setIncludeIngredients] = useState(defaults.includeDefaults);
  const [excludeIngredients, setExcludeIngredients] = useState(defaults.excludeDefaults);
  const [maxMinutes, setMaxMinutes] = useState(defaults.maxMinutes);
  const [servings, setServings] = useState(defaults.servings);
  const [category, setCategory] = useState<Category>(defaults.category);
  const [thermomixMode, setThermomixMode] = useState(defaults.thermomixMode);
  const [modelId, setModelId] = useState(defaults.modelId);
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const visibleSuggestions = useMemo(() => [...SUGGESTIONS].sort(() => Math.random() - 0.5).slice(0, 5), []);

  const generateRecipe = async () => {
    if (!description.trim()) {
      setError("Ajoutez une envie de recette.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cooker/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description,
          includeIngredients: includeIngredients.split(",").map((item) => item.trim()).filter(Boolean),
          excludeIngredients: excludeIngredients.split(",").map((item) => item.trim()).filter(Boolean),
          maxPreparationMinutes: maxMinutes,
          servings,
          thermomixMode,
          modelId,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Erreur de génération.");
        return;
      }

      setRecipe(payload.recipe ?? "Aucune recette générée.");
    } catch {
      setError("Le service Cooker est indisponible.");
    } finally {
      setLoading(false);
    }
  };

  const saveDefaults = () => {
    const data: CookerDefaults = {
      category,
      includeDefaults: includeIngredients,
      excludeDefaults: excludeIngredients,
      maxMinutes,
      servings,
      thermomixMode,
      modelId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setShowSettings(false);
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-5 overflow-y-auto p-4 md:p-8">
      <header className="liquid-glass rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ChefHat className="size-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Cooker</h1>
              <p className="text-sm text-muted-foreground">Générez des recettes complètes avec votre modèle IA préféré.</p>
            </div>
          </div>
          <Button onClick={() => setShowSettings((current) => !current)} type="button" variant="outline">
            <Settings2 className="mr-2 size-4" /> Paramètres
          </Button>
        </div>

        {showSettings ? (
          <div className="mt-4 grid gap-3 rounded-xl border border-border/50 bg-background/60 p-4 md:grid-cols-2">
            <label className="text-sm">Modèle IA par défaut
              <select className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-background px-2" onChange={(event) => setModelId(event.target.value)} value={modelId}>
                {chatModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
              </select>
            </label>
            <label className="text-sm">Catégorie
              <select className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-background px-2" onChange={(event) => setCategory(event.target.value as Category)} value={category}>
                <option value="Plat">Plat</option><option value="Entrée">Entrée</option><option value="Dessert">Dessert</option>
              </select>
            </label>
            <label className="text-sm">Ingrédients toujours inclus
              <input className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-background px-2" onChange={(event) => setIncludeIngredients(event.target.value)} value={includeIngredients} />
            </label>
            <label className="text-sm">Ingrédients toujours exclus
              <input className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-background px-2" onChange={(event) => setExcludeIngredients(event.target.value)} value={excludeIngredients} />
            </label>
            <label className="text-sm">Personnes
              <input className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-background px-2" min={1} onChange={(event) => setServings(Number(event.target.value) || 1)} type="number" value={servings} />
            </label>
            <label className="text-sm">Temps max (minutes)
              <input className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-background px-2" min={5} onChange={(event) => setMaxMinutes(Number(event.target.value) || 5)} type="number" value={maxMinutes} />
            </label>
            <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
              <input checked={thermomixMode} onChange={(event) => setThermomixMode(event.target.checked)} type="checkbox" /> Mode Thermomix par défaut
            </label>
            <div className="md:col-span-2"><Button onClick={saveDefaults} type="button">Enregistrer les paramètres</Button></div>
          </div>
        ) : null}
      </header>

      <section className="liquid-glass rounded-2xl p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm md:col-span-2">Que voulez-vous cuisiner ?
            <textarea className="mt-1 h-28 w-full rounded-xl border border-border/60 bg-background/60 p-3" onChange={(event) => setDescription(event.target.value)} placeholder="ex: Une recette de risotto aux champignons..." value={description} />
          </label>
          <label className="text-sm">Ingrédients à inclure
            <input className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-background px-2" onChange={(event) => setIncludeIngredients(event.target.value)} placeholder="ex: poulet, tomates, riz" value={includeIngredients} />
          </label>
          <label className="text-sm">Ingrédients à ne pas mettre
            <input className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-background px-2" onChange={(event) => setExcludeIngredients(event.target.value)} placeholder="ex: arachides, produits laitiers" value={excludeIngredients} />
          </label>
          <label className="text-sm">Personnes
            <input className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-background px-2" min={1} onChange={(event) => setServings(Number(event.target.value) || 1)} type="number" value={servings} />
          </label>
          <label className="text-sm">Temps max
            <input className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-background px-2" min={5} onChange={(event) => setMaxMinutes(Number(event.target.value) || 5)} type="number" value={maxMinutes} />
          </label>
          <label className="text-sm">Catégorie
            <select className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-background px-2" onChange={(event) => setCategory(event.target.value as Category)} value={category}>
              <option value="Plat">Plat</option><option value="Entrée">Entrée</option><option value="Dessert">Dessert</option>
            </select>
          </label>
          <label className="text-sm">Modèle IA
            <select className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-background px-2" onChange={(event) => setModelId(event.target.value)} value={modelId}>
              {chatModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
            </select>
          </label>
          <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
            <input checked={thermomixMode} onChange={(event) => setThermomixMode(event.target.checked)} type="checkbox" />
            Mode Thermomix
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {visibleSuggestions.map((idea) => (
            <button className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary" key={idea} onClick={() => setDescription(idea)} type="button">
              ✨ {idea}
            </button>
          ))}
        </div>

        <Button className="mt-5 w-full" onClick={generateRecipe} type="button">
          <Sparkles className="mr-2 size-4" /> {loading ? "Génération..." : "Générer la recette"}
        </Button>
        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
      </section>

      <section className={cn("liquid-glass rounded-2xl p-5", !recipe && "text-muted-foreground")}>
        {recipe ? <pre className="whitespace-pre-wrap text-sm">{recipe}</pre> : "La recette générée s'affichera ici."}
      </section>
    </div>
  );
}
