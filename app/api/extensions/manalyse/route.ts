import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import {
  createStructuredReport,
  extractReadableTextFromHtml,
} from "@/lib/extensions/manalyse";

export const runtime = "nodejs";

const decoder = new TextDecoder("utf-8", { fatal: false });

function fallbackBinaryToText(buffer: ArrayBuffer) {
  return decoder
    .decode(buffer)
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isPrivateOrLocalIpAddress(ipAddress: string) {
  const normalizedIp = ipAddress.toLowerCase();
  const ipVersion = isIP(normalizedIp);

  if (ipVersion === 4) {
    const octets = normalizedIp.split(".").map(Number);
    const [a, b] = octets;

    // Plages privées/locales/réservées IPv4
    if (a === 10 || a === 127 || (a === 169 && b === 254) || a === 0) {
      return true;
    }
    if (a === 172 && b >= 16 && b <= 31) {
      return true;
    }
    if (a === 192 && b === 168) {
      return true;
    }
    if (a === 100 && b >= 64 && b <= 127) {
      return true;
    }
    if (a >= 224) {
      return true;
    }
    if (a === 198 && (b === 18 || b === 19)) {
      return true;
    }

    return false;
  }

  if (ipVersion === 6) {
    if (normalizedIp === "::1" || normalizedIp === "::") {
      return true;
    }

    // IPv4-mappée dans IPv6
    if (normalizedIp.startsWith("::ffff:")) {
      return isPrivateOrLocalIpAddress(normalizedIp.replace("::ffff:", ""));
    }

    // Unique local (fc00::/7) et link-local (fe80::/10)
    if (
      normalizedIp.startsWith("fc") ||
      normalizedIp.startsWith("fd") ||
      normalizedIp.startsWith("fe8") ||
      normalizedIp.startsWith("fe9") ||
      normalizedIp.startsWith("fea") ||
      normalizedIp.startsWith("feb")
    ) {
      return true;
    }
  }

  return false;
}

async function validateExternalUrl(rawUrl: string) {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error("L'URL fournie est invalide.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Seules les URLs HTTP/HTTPS sont autorisées.");
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error("Les URLs avec identifiants intégrés sont interdites.");
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    throw new Error("Les hôtes locaux ne sont pas autorisés.");
  }

  // Défense SSRF : validation des IPs directes et des résolutions DNS.
  if (isIP(hostname) && isPrivateOrLocalIpAddress(hostname)) {
    throw new Error("Adresse IP locale/interne interdite.");
  }

  const resolvedAddresses = await lookup(hostname, { all: true, verbatim: true });
  if (resolvedAddresses.length === 0) {
    throw new Error("Impossible de résoudre le nom de domaine.");
  }

  if (
    resolvedAddresses.some(({ address }) => isPrivateOrLocalIpAddress(address))
  ) {
    throw new Error("Le domaine cible résout vers une adresse interne.");
  }

  return parsedUrl;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const sourceType = formData.get("sourceType")?.toString() || "url";

  let extractedText = "";
  const notes: string[] = [];

  if (sourceType === "url") {
    const targetUrl = formData.get("targetUrl")?.toString();

    if (!targetUrl) {
      return NextResponse.json(
        { error: "Veuillez fournir une URL." },
        { status: 400 }
      );
    }

    let safeTargetUrl: URL;
    try {
      safeTargetUrl = await validateExternalUrl(targetUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "URL refusée pour raisons de sécurité.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    let response: Response;
    try {
      response = await fetch(safeTargetUrl, {
        redirect: "manual",
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      return NextResponse.json(
        { error: "Échec de la récupération de l'URL (timeout/réseau)." },
        { status: 400 }
      );
    }

    if (response.status >= 300 && response.status < 400) {
      return NextResponse.json(
        { error: "Les redirections ne sont pas autorisées." },
        { status: 400 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Impossible de récupérer le contenu de l'URL." },
        { status: 400 }
      );
    }

    const html = await response.text();
    extractedText = extractReadableTextFromHtml(html);
    notes.push("Contenu web nettoyé (balises HTML supprimées). ");
  }

  if (sourceType !== "url") {
    const uploadedFile = formData.get("uploadedFile");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        { error: "Veuillez sélectionner un fichier valide." },
        { status: 400 }
      );
    }

    const fileBuffer = await uploadedFile.arrayBuffer();
    const mimeType = uploadedFile.type;
    const filename = uploadedFile.name.toLowerCase();

    if (mimeType.startsWith("text/") || filename.endsWith(".txt")) {
      extractedText = await uploadedFile.text();
      notes.push("Extraction texte brute réalisée depuis un fichier TXT.");
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      filename.endsWith(".docx")
    ) {
      extractedText = fallbackBinaryToText(fileBuffer);
      notes.push(
        "Extraction DOCX réalisée en mode compatible (texte brut récupéré depuis les flux binaires)."
      );
    } else if (mimeType === "application/pdf" || filename.endsWith(".pdf")) {
      extractedText = fallbackBinaryToText(fileBuffer);
      notes.push(
        "Extraction PDF réalisée en mode léger ; pour des scans complexes, privilégiez un OCR dédié."
      );
    } else if (mimeType.startsWith("image/")) {
      extractedText = `Image détectée: ${uploadedFile.name}. Aucun OCR natif local disponible dans cette version.`;
      notes.push(
        "OCR image: fallback descriptif activé. Ajoutez une transcription pour améliorer la précision."
      );
    } else {
      extractedText = fallbackBinaryToText(fileBuffer);
      notes.push(
        "Type de fichier non standard, extraction en texte brut appliquée."
      );
    }
  }

  const report = createStructuredReport(extractedText);

  return NextResponse.json({
    report,
    extractedText,
    notes,
  });
}
