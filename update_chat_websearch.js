const fs = require('fs');
let code = fs.readFileSync('app/(chat)/api/chat/route.ts', 'utf8');

const imports = `import { checkServerUsageLimit } from "@/lib/server-usage";\n`;
code = code.replace(/import { checkIpRateLimit } from "@\/lib\/ratelimit";/, imports + 'import { checkIpRateLimit } from "@/lib/ratelimit";');

const limitCheck = `
    const canWebSearch = await checkServerUsageLimit(
      session.user.id,
      "websearch",
      "day",
      planDefinitions[plan].limits.webSearchesPerDay
    );

    if ((contextualActions?.isWebSearchEnabled || forceWebSearch) && canWebSearch) {
      activeTools.push("webSearch");
    }
`;

code = code.replace(/    if \(contextualActions\?\.isWebSearchEnabled \|\| forceWebSearch\) {\n      activeTools\.push\("webSearch"\);\n    }/, limitCheck);

fs.writeFileSync('app/(chat)/api/chat/route.ts', code);
