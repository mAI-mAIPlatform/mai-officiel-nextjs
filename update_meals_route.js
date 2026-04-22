const fs = require('fs');
let code = fs.readFileSync('app/api/meals/search/route.ts', 'utf8');

const imports = `import { auth } from "@/app/(auth)/auth";
import { getSubscriptionPlan } from "@/lib/db/queries";
import { parsePlanKey, planDefinitions } from "@/lib/subscription";
import { checkServerUsageLimit } from "@/lib/server-usage";\n`;

code = code.replace(/import { NextResponse } from "next\/server";/, 'import { NextResponse } from "next/server";\n' + imports);

const limitCheck = `
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const planKey = await getSubscriptionPlan(session.user.id);
    const plan = parsePlanKey(planKey);
    const maxSearches = planDefinitions[plan].limits.mealsSearchesPerDay;

    const canSearch = await checkServerUsageLimit(
      session.user.id,
      "meals",
      "day",
      maxSearches
    );

    if (!canSearch) {
      return NextResponse.json({ error: "Limite de recherches atteinte pour aujourd'hui" }, { status: 429 });
    }
`;

code = code.replace(/  try {\n    const { query, fileContext }/, `  try {${limitCheck}\n    const { query, fileContext }`);

fs.writeFileSync('app/api/meals/search/route.ts', code);
