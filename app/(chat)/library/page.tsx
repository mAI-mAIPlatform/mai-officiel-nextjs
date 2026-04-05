"use client";

import {
  FileImage,
  FileText,
  FileType,
  Pencil,
  Pin,
  PinOff,
  Search,
  ShieldAlert,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LibraryAssetType = "image" | "document";
type LibraryAssetSource = "device" | "mai-library";

type LibraryAsset = {
  id: string;
  name: string;
  type: LibraryAssetType;
  source: LibraryAssetSource;
  createdAt: string;
  pinned: boolean;
  mimeType: string;
  url: string;
  objectUrl?: string;
};

const STORAGE_KEY = "mai.library.assets";

const initialAssets: LibraryAsset[] = [
  {
    id: "sample-image-1",
    name: "Inspiration studio.png",
    type: "image",
    source: "mai-library",
    createdAt: new Date().toISOString(),
    pinned: true,
    mimeType: "image/png",
    url: "/images/demo-thumbnail.png",
  },
  {
    id: "sample-doc-1",
    name: "Plan produit Q2.txt",
    type: "document",
    source: "mai-library",
    createdAt: new Date().toISOString(),
    pinned: false,
    mimeType: "text/plain",
    url: "",
  },
];

export default function LibraryPage() {
  const [assets, setAssets] = useState<LibraryAsset[]>(initialAssets);
  const [searchTerm, setSearchTerm] = useState("");
  const [importSource, setImportSource] =
    useState<LibraryAssetSource>("device");
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const [renamingAssetId, setRenamingAssetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [previewAssetId, setPreviewAssetId] = useState<string | null>(null);
  const [previewTextContent, setPreviewTextContent] = useState("");
  const trackedObjectUrlsRef = useRef<Set<string>>(new Set());

  const planLimits: Record<string, number> = {
    Free: 20,
    "mAI+": 30,
    Pro: 50,
    "mAI Max": 100,
  };
  const [currentPlan, setCurrentPlan] = useState<string>("Free");
  const maxStorage = planLimits[currentPlan];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAssets));
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setAssets(parsed);
      }
    } catch {
      setAssets(initialAssets);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    const currentObjectUrls = new Set(
      assets.map((asset) => asset.objectUrl).filter(Boolean) as string[]
    );

    trackedObjectUrlsRef.current.forEach((url) => {
      if (!currentObjectUrls.has(url)) {
        URL.revokeObjectURL(url);
      }
    });

    trackedObjectUrlsRef.current = currentObjectUrls;
  }, [assets]);

  useEffect(() => {
    return () => {
      trackedObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      trackedObjectUrlsRef.current.clear();
    };
  }, []);

  const filteredAssets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const base = [...assets].sort(
      (a, b) => Number(b.pinned) - Number(a.pinned)
    );
    if (!normalizedSearch) {
      return base;
    }
    return base.filter((asset) =>
      `${asset.name} ${asset.type} ${asset.source}`
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [assets, searchTerm]);

  const previewAsset = useMemo(
    () => assets.find((asset) => asset.id === previewAssetId) ?? null,
    [assets, previewAssetId]
  );

  const previewUrl = previewAsset?.objectUrl ?? previewAsset?.url ?? "";
  const isImagePreview = Boolean(previewAsset?.mimeType.startsWith("image/"));
  const isTextPreview =
    previewAsset?.mimeType.startsWith("text/") ||
    previewAsset?.mimeType === "application/json" ||
    previewAsset?.name.toLowerCase().endsWith(".md");
  const isPdfPreview = previewAsset?.mimeType === "application/pdf";
  const truncatedPreviewText = previewTextContent.slice(0, 12000);

  useEffect(() => {
    if (!previewAsset || !previewUrl) {
      return;
    }

    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = previewAsset.name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [previewAsset, previewUrl]);

  useEffect(() => {
    const loadTextPreview = async () => {
      if (!previewAsset || !previewUrl || !isTextPreview) {
        setPreviewTextContent("");
        return;
      }

      try {
        const response = await fetch(previewUrl);
        const text = await response.text();
        setPreviewTextContent(text);
      } catch {
        setPreviewTextContent("Impossible de charger l’aperçu texte.");
      }
    };

    void loadTextPreview();
  }, [previewAsset, previewUrl, isTextPreview]);

  const isSupportedFile = (file: File) => {
    const mimeType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    return (
      [
        "application/pdf",
        "text/plain",
        "text/markdown",
        "image/png",
        "image/jpeg",
      ].includes(mimeType) ||
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md")
    );
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (assets.length >= maxStorage) {
      alert(
        `Limite de stockage atteinte pour le forfait ${currentPlan} (${maxStorage} fichiers). Veuillez mettre à niveau votre forfait.`
      );
      event.target.value = "";
      return;
    }

    if (!isSupportedFile(file)) {
      alert(
        "Format non supporté. Veuillez importer uniquement .pdf, .txt, .md, .png ou .jpeg/.jpg."
      );
      event.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setAssets((current) => [
      {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type.startsWith("image/") ? "image" : "document",
        source: importSource,
        createdAt: new Date().toISOString(),
        pinned: false,
        mimeType: file.type || "application/octet-stream",
        objectUrl,
        url: objectUrl,
      },
      ...current,
    ]);

    event.target.value = "";
  };

  const openRenameEditor = (asset: LibraryAsset) => {
    setRenamingAssetId(asset.id);
    setRenameValue(asset.name);
  };

  const commitRename = () => {
    if (!renamingAssetId || !renameValue.trim()) {
      return;
    }

    setAssets((current) =>
      current.map((asset) =>
        asset.id === renamingAssetId
          ? { ...asset, name: renameValue.trim() }
          : asset
      )
    );
    setRenamingAssetId(null);
    setRenameValue("");
  };

  const handleDelete = () => {
    if (!assetToDelete) {
      return;
    }

    if (previewAssetId === assetToDelete) {
      setPreviewAssetId(null);
    }

    setAssets((current) =>
      current.filter((asset) => asset.id !== assetToDelete)
    );
    setAssetToDelete(null);
  };

  return (
    <div className="liquid-glass flex h-full w-full flex-col gap-5 overflow-y-auto p-6 md:p-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Bibliothèque</h1>
          <p className="text-sm text-muted-foreground">
            Répertoire centralisé de vos photos, documents et créations Studio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-background/50 p-2 backdrop-blur-xl">
          <select
            className="h-9 rounded-xl border border-border/50 bg-background/70 px-3 text-xs font-medium text-amber-500"
            onChange={(event) => setCurrentPlan(event.target.value)}
            value={currentPlan}
          >
            {Object.keys(planLimits).map((plan) => (
              <option key={plan} value={plan}>
                {plan} ({planLimits[plan]} fichiers)
              </option>
            ))}
          </select>
          <span className="mr-2 text-xs font-medium">
            Stockage: {assets.length}/{maxStorage}
          </span>
          <select
            className="h-9 rounded-xl border border-border/50 bg-background/70 px-3 text-xs"
            onChange={(event) =>
              setImportSource(event.target.value as LibraryAssetSource)
            }
            value={importSource}
          >
            <option value="device">Source : Appareil local</option>
            <option value="mai-library">Source : Bibliothèque mAI</option>
          </select>
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-border/60 px-3 text-xs hover:bg-muted/40">
            <UploadCloud className="size-4" /> Importer
            <input
              accept=".pdf,.txt,.md,image/png,image/jpeg"
              className="hidden"
              onChange={handleImport}
              type="file"
            />
          </label>
        </div>
      </header>

      <section className="rounded-2xl border border-border/60 bg-card/65 p-4 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-border/50 bg-background/60 px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            className="w-full bg-transparent text-sm focus:outline-none"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Rechercher un média, un type ou une source..."
            type="search"
            value={searchTerm}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredAssets.map((asset) => (
            <article
              className="liquid-glass rounded-2xl border border-border/50 bg-background/45 p-3"
              key={asset.id}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {asset.type === "image" ? (
                    <FileImage className="size-4" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                  <span>{asset.source === "device" ? "Local" : "mAI"}</span>
                </div>
                <button
                  className="rounded-md p-1 hover:bg-muted"
                  onClick={() =>
                    setAssets((current) =>
                      current.map((currentAsset) =>
                        currentAsset.id === asset.id
                          ? { ...currentAsset, pinned: !currentAsset.pinned }
                          : currentAsset
                      )
                    )
                  }
                  type="button"
                >
                  {asset.pinned ? (
                    <PinOff className="size-4 text-amber-500" />
                  ) : (
                    <Pin className="size-4" />
                  )}
                </button>
              </div>

              <div
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-background"
                onClick={() => setPreviewAssetId(asset.id)}
              >
                {asset.url && asset.type === "image" ? (
                  <Image
                    alt={asset.name}
                    className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    height={144}
                    src={asset.url}
                    unoptimized={asset.url.startsWith("blob:")}
                    width={320}
                  />
                ) : (
                  <div className="flex h-36 items-center justify-center border-border/50 text-xs text-muted-foreground">
                    Cliquer pour prévisualiser
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white">
                    Ouvrir l’aperçu
                  </span>
                </div>
              </div>

              {renamingAssetId === asset.id ? (
                <div className="space-y-2">
                  <input
                    className="h-8 w-full rounded-lg border border-border/60 bg-background/70 px-2 text-sm"
                    onChange={(event) => setRenameValue(event.target.value)}
                    value={renameValue}
                  />
                  <div className="flex gap-2">
                    <Button onClick={commitRename} size="sm" variant="outline">
                      Valider
                    </Button>
                    <Button
                      onClick={() => setRenamingAssetId(null)}
                      size="sm"
                      variant="ghost"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="line-clamp-2 text-sm font-medium">{asset.name}</p>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">
                Ajouté le {new Date(asset.createdAt).toLocaleString()}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <Button
                  onClick={() => openRenameEditor(asset)}
                  size="sm"
                  variant="outline"
                >
                  <Pencil className="mr-1 size-3.5" /> Renommer
                </Button>
                <Button
                  className="text-red-500 hover:text-red-500"
                  onClick={() => setAssetToDelete(asset.id)}
                  size="sm"
                  variant="outline"
                >
                  <Trash2 className="mr-1 size-3.5" /> Supprimer
                </Button>
              </div>
            </article>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
            Aucun média trouvé. Essayez une autre recherche ou importez un
            fichier.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
          <ShieldAlert className="size-4" />
          <p className="text-xs font-medium">Suppression sécurisée activée</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Les suppressions demandent une confirmation pour éviter les pertes
          accidentelles.
        </p>
      </section>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setAssetToDelete(null);
          }
        }}
        open={Boolean(assetToDelete)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce fichier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Suppression sécurisée : cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setPreviewAssetId(null);
          }
        }}
        open={Boolean(previewAsset)}
      >
        <DialogContent className="liquid-glass max-h-[88vh] max-w-3xl overflow-hidden border border-border/60 bg-card/70 p-0 backdrop-blur-2xl">
          <DialogHeader className="border-b border-border/50 bg-background/40 px-6 py-4">
            <DialogTitle className="line-clamp-1">{previewAsset?.name}</DialogTitle>
            <DialogDescription>
              Aperçu du fichier ({previewAsset?.mimeType || "inconnu"}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-6">
            <div className="max-h-[58vh] overflow-auto rounded-xl border border-border/50 bg-background/40 p-3">
              {previewAsset && isImagePreview && previewUrl ? (
                <Image
                  alt={previewAsset.name}
                  className="mx-auto h-auto max-h-[52vh] w-auto rounded-lg object-contain"
                  height={900}
                  src={previewUrl}
                  unoptimized={previewUrl.startsWith("blob:")}
                  width={1200}
                />
              ) : null}

              {previewAsset && isTextPreview && previewUrl ? (
                <div className="h-[52vh] overflow-auto rounded-md bg-background p-3">
                  <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-foreground/90">
                    {truncatedPreviewText}
                  </pre>
                  {previewTextContent.length > truncatedPreviewText.length ? (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Aperçu tronqué pour préserver les performances.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {previewAsset && isPdfPreview && previewUrl ? (
                <object
                  className="h-[52vh] w-full rounded-md bg-background"
                  data={previewUrl}
                  type="application/pdf"
                >
                  <iframe
                    className="h-[52vh] w-full rounded-md bg-background"
                    src={previewUrl}
                    title={`Aperçu PDF - ${previewAsset.name}`}
                  />
                </object>
              ) : null}

              {previewAsset &&
                !isImagePreview &&
                !isTextPreview &&
                !isPdfPreview && (
                  <div className="flex h-[52vh] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                    <FileType className="size-6" />
                    Aperçu indisponible pour ce format.
                  </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button asChild variant="outline">
                <a
                  download={previewAsset?.name}
                  href={previewUrl || "#"}
                  onClick={(event) => {
                    if (!previewUrl) {
                      event.preventDefault();
                    }
                  }}
                >
                  Télécharger
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
