export type HordeTextModelOption = {
  id: string;
  label: string;
};

export const HORDE_TEXT_MODEL_NAMES = [
  "aphrodite/TheDrummer/Behemoth-R1-123B-v2-w4a16",
  "aphrodite/TheDrummer/Cydonia-24B-v4.3",
  "aphrodite/TheDrummer/Skyfall-31B-v4.1",
  "koboldcpp/allura-org/Qwen3.6-35B-A3B-Anko",
  "koboldcpp/Cydonia-24B-v4.3",
  "koboldcpp/Dark-Nexus-24B-v2.0.i1-Q5_K_M",
  "koboldcpp/debug-Gemmasutra-Mini-2B-v1.i1-Q4_K_M",
  "koboldcpp/digo-prayudha/unsloth-llama-3.2-1b-gguf",
  "koboldcpp/Falcon-H1R-Tiny-90M",
  "koboldcpp/G4-MeroMero-26B-A4B",
  "koboldcpp/gemma-4-26B-A4B-it",
  "koboldcpp/gemma-4-26B-A4B-it-uncensored-heretic",
  "koboldcpp/gemma-4-E4B-it-Q4_K_M",
  "koboldcpp/Impish_Magic_24B",
  "koboldcpp/Judas-Uncensored-3.2-1B.Q8",
  "koboldcpp/KobbleTiny-1.1B",
  "koboldcpp/L3-8B-Stheno-v3.2",
  "koboldcpp/L3-Super-Nova-RP-8B",
  "koboldcpp/LFM2.5-1.2B-Instruct",
  "koboldcpp/Llama-3-Lumimaid-8B-v0.1",
  "koboldcpp/Magidonia-24B-v4.3",
  "koboldcpp/mini-magnum-12b-v1.1",
  "koboldcpp/Ministral-3-8B-Instruct-2512",
  "koboldcpp/Mistral-Nemo-12B-Mag-Mell-R1.Q6_K",
  "koboldcpp/mradermacher/Cerebras-GPT-111M-instruction-GGUF",
  "koboldcpp/mradermacher/pythia-70m-deduped.f16.gguf",
  "koboldcpp/pygmalion-2-7b.Q4_K_M",
  "koboldcpp/Qwen3.6-35B-A3B-Uncensored",
  "koboldcpp/Qwen_Qwen3-0.6B-IQ4_XS",
  "koboldcpp/Rocinante-X-12B-v1",
  "koboldcpp/tencent/HY-MT1.5-1.8B",
  "koboldcpp/TheDrummer_Cydonia-24B-v4.3-Q4_K_M",
  "koboldcpp/TheDrummer/Skyfall-31B-v4.2",
  "koboldcpp/WizzGPTv8",
  "l3-8b-stheno-v3.2",
  "slm/testing-Kai-0.35B-Instruct.Q8_0.gguf",
] as const;

export const hordeTextModelOptions: HordeTextModelOption[] =
  HORDE_TEXT_MODEL_NAMES.map((name) => ({
    id: `horde/${name}`,
    label: name,
  }));

export const hordeModelMapping: Record<string, string> = Object.fromEntries(
  hordeTextModelOptions.map((option) => [option.id, option.label])
);
