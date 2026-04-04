import { auth } from "@/app/(auth)/auth";

const COMET_API_BASE_URL =
  process.env.COMET_API_BASE_URL ?? "https://api.cometapi.com/v1";
const GEMINI_API_BASE_URL =
  process.env.GEMINI_API_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta";

const cometTextModels = new Set(["gpt-5.4-nano", "gpt-5.4-mini"]);
const cometImageModels = new Set([
  "flux-2-max",
  "kling-image",
  "flux-2-pro",
  "flux-2-flex",
]);
const geminiCheapModels = new Set([
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
]);

const cometKeys = [process.env.COMET_API_KEY_1, process.env.COMET_API_KEY_2].filter(
  Boolean
) as string[];
const geminiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

type StudioRequest = {
  action: "text" | "generate-image" | "edit-image";
  model: string;
  prompt: string;
  image?: string;
};

function extractTextFromGemini(data: any): string {
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part: { text?: string }) => part.text ?? "")
    .join("\n")
    .trim();
}

function extractImagePayload(data: any): { imageUrl?: string; imageBase64?: string } {
  const firstData = data?.data?.[0];

  if (typeof firstData?.url === "string") {
    return { imageUrl: firstData.url };
  }

  if (typeof firstData?.b64_json === "string") {
    return { imageBase64: firstData.b64_json };
  }

  if (typeof data?.image_url === "string") {
    return { imageUrl: data.image_url };
  }

  if (typeof data?.output?.[0]?.url === "string") {
    return { imageUrl: data.output[0].url };
  }

  return {};
}

async function withFallback<T>(
  calls: Array<() => Promise<T>>,
  errorLabel: string
): Promise<T> {
  let lastError: unknown = null;

  for (const call of calls) {
    try {
      return await call();
    } catch (error) {
      lastError = error;
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : "Erreur inconnue";
  throw new Error(`${errorLabel}: ${message}`);
}

async function cometChatCompletion(
  model: string,
  prompt: string
): Promise<{ provider: string; text: string }> {
  if (!cometTextModels.has(model)) {
    throw new Error("Modèle CometAPI texte non supporté");
  }

  if (cometKeys.length === 0) {
    throw new Error("Aucune clé CometAPI configurée");
  }

  const calls = cometKeys.map((apiKey, index) => async () => {
    const response = await fetch(`${COMET_API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`CometAPI clé ${index + 1} a échoué (${response.status})`);
    }

    const data = await response.json();
    const text =
      data?.choices?.[0]?.message?.content ?? data?.output_text ?? "";

    if (!text) {
      throw new Error(`CometAPI clé ${index + 1} a renvoyé une réponse vide`);
    }

    return { provider: `cometapi-${index + 1}`, text };
  });

  return withFallback(calls, "Échec fallback CometAPI texte");
}

async function geminiTextCompletion(
  model: string,
  prompt: string
): Promise<{ provider: string; text: string }> {
  if (!geminiCheapModels.has(model)) {
    throw new Error("Modèle Gemini non supporté");
  }

  if (geminiKeys.length === 0) {
    throw new Error("Aucune clé Gemini configurée");
  }

  const calls = geminiKeys.map((apiKey, index) => async () => {
    const response = await fetch(
      `${GEMINI_API_BASE_URL}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini clé ${index + 1} a échoué (${response.status})`);
    }

    const data = await response.json();
    const text = extractTextFromGemini(data);

    if (!text) {
      throw new Error(`Gemini clé ${index + 1} a renvoyé une réponse vide`);
    }

    return { provider: `gemini-${index + 1}`, text };
  });

  return withFallback(calls, "Échec fallback Gemini");
}

async function cometImage(
  action: "generate-image" | "edit-image",
  model: string,
  prompt: string,
  image?: string
): Promise<{ provider: string; imageUrl?: string; imageBase64?: string }> {
  if (!cometImageModels.has(model)) {
    throw new Error("Modèle CometAPI image non supporté");
  }

  if (cometKeys.length === 0) {
    throw new Error("Aucune clé CometAPI configurée");
  }

  const endpoint =
    action === "edit-image"
      ? `${COMET_API_BASE_URL}/images/edits`
      : `${COMET_API_BASE_URL}/images/generations`;

  const calls = cometKeys.map((apiKey, index) => async () => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        ...(image ? { image } : {}),
        size: "1024x1024",
      }),
    });

    if (!response.ok) {
      throw new Error(`CometAPI image clé ${index + 1} a échoué (${response.status})`);
    }

    const data = await response.json();
    const parsed = extractImagePayload(data);

    if (!parsed.imageBase64 && !parsed.imageUrl) {
      throw new Error(`CometAPI image clé ${index + 1} réponse invalide`);
    }

    return { provider: `cometapi-${index + 1}`, ...parsed };
  });

  return withFallback(calls, "Échec fallback CometAPI image");
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: StudioRequest;
  try {
    body = (await request.json()) as StudioRequest;
  } catch {
    return Response.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const prompt = body.prompt?.trim();

  if (!prompt) {
    return Response.json({ error: "Le prompt est requis" }, { status: 400 });
  }

  try {
    if (body.action === "text") {
      if (cometTextModels.has(body.model)) {
        const result = await cometChatCompletion(body.model, prompt);
        return Response.json({ type: "text", ...result });
      }

      if (geminiCheapModels.has(body.model)) {
        const result = await geminiTextCompletion(body.model, prompt);
        return Response.json({ type: "text", ...result });
      }

      return Response.json({ error: "Modèle texte non supporté" }, { status: 400 });
    }

    if (body.action === "generate-image" || body.action === "edit-image") {
      const result = await cometImage(body.action, body.model, prompt, body.image);
      return Response.json({ type: "image", ...result });
    }

    return Response.json({ error: "Action non supportée" }, { status: 400 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erreur studio" },
      { status: 500 }
    );
  }
}
