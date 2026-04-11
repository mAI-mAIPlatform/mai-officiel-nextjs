import { tool } from "ai";
import { z } from "zod";
import { createProject, getProjectsByUser } from "@/lib/db/queries";

export function createProjectTool(userId: string) {
  return tool({
    description:
      "Créer un nouveau projet IA pour l'utilisateur. À utiliser quand le prompt demande explicitement de créer un projet.",
    inputSchema: z.object({
      name: z.string().min(1).max(120).describe("Nom du projet à créer"),
      instructions: z
        .string()
        .max(5000)
        .optional()
        .describe("Instructions ou objectif principal du projet"),
      connectionMode: z
        .enum(["project_tool", "without_tool"])
        .optional()
        .describe(
          "project_tool = créer via l'outil ; without_tool = proposer un plan sans créer réellement"
        ),
    }),
    execute: async ({ name, instructions, connectionMode }) => {
      const normalizedName = name.trim();
      if (!normalizedName) {
        return {
          success: false,
          message: "Nom de projet manquant.",
        };
      }

      if (connectionMode === "without_tool") {
        return {
          success: true,
          mode: "Faire sans l'outil",
          effect: "Connexion aux Projets",
          preview: {
            name: normalizedName,
            instructions: instructions?.trim() || null,
          },
        };
      }

      const projects = await getProjectsByUser(userId);
      const alreadyExists = projects.some(
        (project) =>
          project.name.trim().toLowerCase() === normalizedName.toLowerCase()
      );

      if (alreadyExists) {
        return {
          success: false,
          effect: "Connexion aux Projets",
          message: "Un projet avec ce nom existe déjà.",
        };
      }

      const [created] = await createProject({
        userId,
        name: normalizedName,
        instructions: instructions?.trim() || undefined,
      });

      return {
        success: true,
        effect: "Connexion aux Projets",
        mode: "project_tool",
        project: {
          id: created.id,
          name: created.name,
          instructions: created.instructions,
        },
      };
    },
  });
}
