import { NextResponse } from "next/server";
import { z } from "zod";

const SpeakyRequestSchema = z.object({
  voice: z.enum(["alloy", "verse", "aria"]).default("alloy"),
  speed: z.number().min(0.5).max(2).default(1),
  style: z.string().trim().max(160).optional(),
  text: z.string().trim().min(1).max(5000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SpeakyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY manquante. Configurez-la pour activer la génération audio téléchargeable.",
        },
        { status: 503 }
      );
    }

    const payload = parsed.data;
    const input = payload.style
      ? `[Style vocal: ${payload.style}]\n${payload.text}`
      : payload.text;

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: payload.voice,
        format: "mp3",
        speed: payload.speed,
        input,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      return NextResponse.json(
        { error: "Échec de génération audio", details },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(arrayBuffer).toString("base64");

    return NextResponse.json({
      audioBase64,
      contentType: "audio/mpeg",
      durationEstimateSec: Math.ceil(payload.text.length / 14),
      voice: payload.voice,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur serveur Speaky",
      },
      { status: 500 }
    );
  }
}
