export const extensionAiModels = [
  "gpt-5.4-mini",
  "gpt-5.4-nano",
  "gpt-4.1",
  "gpt-4.1-mini",
  "o4-mini",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "claude-3.7-sonnet",
  "mistral-small-latest",
] as const;

export type ExtensionAiModel = (typeof extensionAiModels)[number];

export function buildAiCopilotNote(
  model: ExtensionAiModel,
  scope: string,
  context: string
): string {
  const safeContext = context.trim() || "contexte par défaut";

  return `[${model}] Suggestion ${scope} : priorisez un résultat mesurable, expliquez les hypothèses et validez avec le contexte « ${safeContext} ».`;
}
