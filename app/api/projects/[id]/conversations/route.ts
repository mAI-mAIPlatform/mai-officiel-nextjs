import { generateText } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { allowedModelIds, DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { getLanguageModel } from "@/lib/ai/providers";
import { getProjectById } from "@/lib/db/queries";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const project = await getProjectById(id);
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const body = (await request.json()) as {
      message?: string;
      modelId?: string;
    };
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "Message vide" }, { status: 400 });
    }

    const selectedModel = body.modelId ?? DEFAULT_CHAT_MODEL;
    const chatModel = selectedModel.startsWith("agent-")
      ? DEFAULT_CHAT_MODEL
      : allowedModelIds.has(selectedModel)
        ? selectedModel
        : DEFAULT_CHAT_MODEL;

    const { text } = await generateText({
      model: getLanguageModel(chatModel),
      system: [
        `Tu assistes l'utilisateur sur son projet "${project.name}".`,
        project.description ? `Description: ${project.description}` : "",
        project.instructions ? `Instructions: ${project.instructions}` : "",
        project.memory ? `Sources du projet: ${project.memory}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
      prompt: message,
    });

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "Erreur IA" }, { status: 500 });
  }
}
