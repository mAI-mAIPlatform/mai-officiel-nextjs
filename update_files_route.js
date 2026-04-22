const fs = require('fs');
let code = fs.readFileSync('app/(chat)/api/files/upload/route.ts', 'utf8');

const imports = `import { getSubscriptionPlan } from "@/lib/db/queries";
import { parsePlanKey, planDefinitions } from "@/lib/subscription";
import { checkServerUsageLimit } from "@/lib/server-usage";\n`;

code = code.replace(/import { auth } from "@\/app\/\(auth\)\/auth";/, imports + 'import { auth } from "@/app/(auth)/auth";');

const limitCheck = `
    const planKey = await getSubscriptionPlan(session.user.id);
    const plan = parsePlanKey(planKey);
    const maxFiles = planDefinitions[plan].limits.filesPerDay;

    const canUpload = await checkServerUsageLimit(
      session.user.id,
      "files",
      "day",
      maxFiles
    );

    if (!canUpload) {
      return NextResponse.json({ error: "Limite de fichiers atteinte pour aujourd'hui" }, { status: 429 });
    }
`;

code = code.replace(/  if \(!session\?\.user\?\.id\) \{\n    return NextResponse\.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\);\n  \}/, `  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
${limitCheck}`);

fs.writeFileSync('app/(chat)/api/files/upload/route.ts', code);
