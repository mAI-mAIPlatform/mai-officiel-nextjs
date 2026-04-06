import { put } from "@vercel/blob";
import { generateText } from "ai";
import { load } from "cheerio"; // ignore rule here or just change it if we only use load
import mammoth from "mammoth";
import { NextResponse } from "next/server";
import pdf from "pdf-parse";
import { getProviderAndModel } from "@/lib/ai/models";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const url = formData.get("url") as string | null;
    const file = formData.get("file") as File | null;

    let extractedText = "";
    let imageBlobUrl = "";

    // 1. Gérer l'URL
    if (url) {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = load(html);
        extractedText += "--- Contenu de l'URL ---\n";
        extractedText += $("body").text().replace(/\s+/g, " ").trim();
      } catch (e) {
        console.error("Erreur scraping:", e);
        return NextResponse.json(
          { error: "Impossible de lire l'URL." },
          { status: 400 }
        );
      }
    }

    // 2. Gérer le Fichier
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileType = file.type;

      // Upload persistant vers Vercel Blob
      try {
        const blob = await put(file.name, file, { access: "public" });
        imageBlobUrl = blob.url; // Garder l'URL au cas où c'est une image
      } catch (e) {
        console.error("Erreur upload blob:", e);
      }

      if (fileType === "application/pdf") {
        try {
          const pdfData = await pdf(buffer);
          extractedText += `\n\n--- Contenu du PDF ---\n${pdfData.text}`;
        } catch (e) {
          console.error("Erreur PDF:", e);
          return NextResponse.json(
            { error: "Erreur lecture PDF." },
            { status: 400 }
          );
        }
      } else if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        try {
          const docxData = await mammoth.extractRawText({ buffer });
          extractedText += `\n\n--- Contenu du DOCX ---\n${docxData.value}`;
        } catch (e) {
          console.error("Erreur DOCX:", e);
          return NextResponse.json(
            { error: "Erreur lecture DOCX." },
            { status: 400 }
          );
        }
      } else if (fileType === "text/plain") {
        extractedText += `\n\n--- Contenu TXT ---\n${buffer.toString("utf-8")}`;
      } else if (fileType.startsWith("image/")) {
        // Pour les images, on laissera le modèle multimodal s'en charger si possible
        // On s'assure d'avoir l'URL de l'image (Vercel Blob)
      } else {
        return NextResponse.json(
          { error: "Format non supporté." },
          { status: 400 }
        );
      }
    }

    if (!extractedText.trim() && !file?.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Aucun contenu à analyser." },
        { status: 400 }
      );
    }

    // 3. Appel à l'IA pour générer le rapport
    const { model, provider } = getProviderAndModel();

    const systemPrompt = `Tu es un analyseur de documents expert.
Ton rôle est d'analyser le contenu fourni (texte extrait ou image) et de générer un rapport structuré strict.
Le rapport DOIT contenir exactement ces sections :
- **Résumé** : (Un résumé concis de 3 à 5 phrases)
- **Points clés** : (Une liste à puces des éléments les plus importants)
- **Analyse de sentiment** : (Le ton global du document, positif, négatif, neutre, ou nuancé, avec une justification d'une phrase)
- **Conclusion** : (Une phrase de synthèse)

Ne rajoute pas de texte avant ou après ce rapport.`;

    // Préparation des messages. Si c'est une image, on ajoute l'image.
    const messages: any[] = [];
    if (file && file.type.startsWith("image/") && imageBlobUrl) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyse cette image et fais le rapport demandé.",
          },
          { type: "image", image: imageBlobUrl },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: `Voici le texte à analyser :\n\n${extractedText.slice(0, 100_000)}`, // Limite approximative
      });
    }

    const result = await generateText({
      model: provider(model),
      system: systemPrompt,
      messages,
    });

    return NextResponse.json({ report: result.text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
