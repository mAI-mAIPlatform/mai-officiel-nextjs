import assert from "node:assert/strict";
import { test } from "node:test";
import { extractTextFromResponsesPayload } from "@/lib/ai/external-providers";

test("extractTextFromResponsesPayload - lit les deltas d'événements JSON", () => {
  const streamEvents = [
    JSON.stringify({ type: "response.output_text.delta", delta: "Salut" }),
    JSON.stringify({ type: "response.output_text.delta", delta: " !" }),
    JSON.stringify({ type: "response.completed" }),
  ];

  assert.equal(extractTextFromResponsesPayload(streamEvents), "Salut !");
});

test("extractTextFromResponsesPayload - fallback output_text", () => {
  assert.equal(
    extractTextFromResponsesPayload({ output_text: "  Bonjour  " }),
    "Bonjour"
  );
});

test("extractTextFromResponsesPayload - fallback output structuré", () => {
  assert.equal(
    extractTextFromResponsesPayload({
      output: [
        {
          content: [
            { type: "output_text", text: "Hello" },
            { type: "output_text", text: " world" },
          ],
        },
      ],
    }),
    "Hello world"
  );
});
