import { tool } from "ai";
import { z } from "zod";
import { createAgent, getAgentsByUser } from "@/lib/db/queries";

export function createMaiTool(userId: string) {
  return tool({
    description:
      "Créer un mAI spécialisé pour l'utilisateur. À utiliser quand le prompt demande de créer un assistant personnalisé.",
    inputSchema: z.object({
      name: z.string().min(1).max(120).describe("Nom du mAI"),
      description: z.string().max(500).optional(),
      instructions: z.string().max(8000).optional(),
      model: z.string().max(120).optional(),
      connectionMode: z
        .enum(["mai_tool", "without_tool"])
        .optional()
        .describe(
          "mai_tool = créer via l'outil ; without_tool = proposer un plan sans créer réellement"
        ),
    }),
    execute: async ({
      name,
      description,
      instructions,
      model,
      connectionMode,
    }) => {
      const normalizedName = name.trim();
      if (!normalizedName) {
        return {
          success: false,
          message: "Nom du mAI manquant.",
        };
      }

      if (connectionMode === "without_tool") {
        return {
          success: true,
          mode: "Faire sans l'outil",
          effect: "Connexion aux mAIs",
          preview: {
            name: normalizedName,
            description: description?.trim() || null,
            instructions: instructions?.trim() || null,
            model: model?.trim() || "openai/gpt-5.4",
          },
        };
      }

      const agents = await getAgentsByUser(userId);
      const alreadyExists = agents.some(
        (agent) =>
          agent.name.trim().toLowerCase() === normalizedName.toLowerCase()
      );

      if (alreadyExists) {
        return {
          success: false,
          effect: "Connexion aux mAIs",
          message: "Un mAI avec ce nom existe déjà.",
        };
      }

      const [created] = await createAgent({
        userId,
        name: normalizedName,
        description: description?.trim() || undefined,
        systemPrompt: instructions?.trim() || undefined,
        baseModel: model?.trim() || "openai/gpt-5.4",
      });

      return {
        success: true,
        effect: "Connexion aux mAIs",
        mode: "mai_tool",
        mai: {
          id: created.id,
          name: created.name,
          description: created.description,
          instructions: created.systemPrompt,
          model: created.baseModel,
        },
      };
    },
  });
}
