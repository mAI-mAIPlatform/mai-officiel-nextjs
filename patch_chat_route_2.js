const fs = require('fs');
const file = 'app/(chat)/api/chat/route.ts';
let content = fs.readFileSync(file, 'utf8');

const importRegex = /import \{ checkIpRateLimit \} from "@\/lib\/ratelimit";/;
content = content.replace(importRegex, `import { checkIpRateLimit, checkUserOpusRateLimit } from "@/lib/ratelimit";`);

const chatModelLogicRegex = /    const chatModel =\n\s*selectedChatModel\.startsWith\("agent-"\) \|\|\n\s*!allowedModelIds\.has\(selectedChatModel\)\n\s*\? DEFAULT_CHAT_MODEL\n\s*: selectedChatModel;/;

const logicReplacement = `    const chatModel =
      selectedChatModel.startsWith("agent-") ||
      !allowedModelIds.has(selectedChatModel)
        ? DEFAULT_CHAT_MODEL
        : selectedChatModel;

    if (chatModel === "anthropic/claude-opus-4-7") {
      await checkUserOpusRateLimit(session.user.id);
    }`;

content = content.replace(chatModelLogicRegex, logicReplacement);

fs.writeFileSync(file, content);
