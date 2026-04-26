import { hordeTextModelOptions } from "@/lib/ai/horde-models";

export type AffordableModelOption = {
  id: string;
  label: string;
};

export const affordableTextModels: AffordableModelOption[] = [
  { id: "openai/gpt-5.4", label: "GPT-5.4" },
  { id: "openai/gpt-5.4-mini", label: "GPT-5.4 Mini" },
  { id: "openai/gpt-5.4-nano", label: "GPT-5.4 Nano" },
  { id: "openai/gpt-5.2", label: "GPT-5.2" },
  { id: "openai/gpt-5.1", label: "GPT-5.1" },
  { id: "openai/gpt-5", label: "GPT-5" },
  { id: "openai/gpt-oss-120b", label: "GPT-OSS-120B" },
  { id: "azure/deepseek-v3.2", label: "DeepSeek-V3.2" },
  { id: "azure/kimi-k2.5", label: "Kimi K2.5" },
  { id: "azure/kimi-k2.6", label: "Kimi K2.6" },
  { id: "azure/mistral-large-3", label: "Mistral Large 3" },
  { id: "anthropic/claude-opus-4-7", label: "Claude Opus 4.7" },
  { id: "anthropic/claude-opus-4-6", label: "Claude Opus 4.6" },
  { id: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
  { id: "anthropic/claude-haiku-4-5", label: "Claude Haiku 4.5" },
  { id: "claude/claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
  ...hordeTextModelOptions,
  { id: "ollama/qwen3:14b", label: "Qwen3:14b" },
  { id: "ollama/llama3.1:8b", label: "Llama3.1:8b" },
  { id: "ollama/mixtral:8x7b", label: "Mixtral:8x7b" },
  { id: "ollama/deepseek-r1", label: "DeepSeek-R1" },
  { id: "ollama/gemma2:9b", label: "Gemma2:9b" },
];

export const affordableImageModels: AffordableModelOption[] = [
  { id: "horde/stable_diffusion", label: "Stable Diffusion" },
  { id: "horde/AbsoluteReality", label: "AbsoluteReality" },
  { id: "horde/Realistic Vision", label: "Realistic Vision" },
  { id: "horde/Juggernaut XL", label: "Juggernaut XL" },
  { id: "horde/SDXL 1.0", label: "SDXL 1.0" },
  { id: "horde/DreamShaper", label: "DreamShaper" },
  { id: "horde/Anything v5", label: "Anything v5" },
  { id: "horde/ChilloutMix", label: "ChilloutMix" },
  { id: "horde/Deliberate", label: "Deliberate" },
  { id: "horde/Stable Cascade 1.0", label: "Stable Cascade 1.0" },
  { id: "horde/AbyssOrangeMix-AfterDark", label: "AbyssOrangeMix-AfterDark" },
  { id: "horde/WAI-NSFW-illustrious-SDXL", label: "WAI-NSFW-illustrious-SDXL" },
  { id: "horde/Animagine XL", label: "Animagine XL" },
  { id: "horde/ZavyChromaXL", label: "ZavyChromaXL" },
  { id: "horde/Realism Engine", label: "Realism Engine" },
  { id: "horde/Inkpunk Diffusion", label: "Inkpunk Diffusion" },
  { id: "horde/MeinaMix", label: "MeinaMix" },
];
