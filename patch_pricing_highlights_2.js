const fs = require('fs');
const file = 'app/(chat)/pricing/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove Expliquer buttons
content = content.replace(/<Button\n\s*className="w-full"\n\s*onClick=\{\(\) =>\n\s*setExplainPlan\(planItem\.key as Exclude<PlanKey, "free">\)\n\s*\}\n\s*variant="outline"\n\s*>\n\s*Expliquer\n\s*<\/Button>/g, '');
content = content.replace(/<Button\s*className="w-full"\s*onClick=\{\(\) =>\s*setExplainPlan\(planItem\.key as Exclude<PlanKey, "free">\)\s*\}\s*variant="outline"\s*>\s*Expliquer\s*<\/Button>/g, '');

const regex = /const highlightsByPlan: Record<PlanKey, string\[\]> = \{[\s\S]*?\};\n/;
const replacement = `const highlightsByPlan: Record<PlanKey, string[]> = {
  free: [
    "20 messages / heure",
    "Idéal pour découvrir mAI",
    "Free débloque la réflexion légère",
    "Jusqu'à 5 fichiers / jour",
    "10 recherches web / jour",
  ],
  plus: [
    "50 messages / heure",
    "IA plus confortable au quotidien",
    "10 fichiers / jour",
    "Tâches planifiées avancées",
    "20 recherches web / jour",
  ],
  pro: [
    "75 messages / heure",
    "Pro débloque la réflexion moyenne",
    "20 fichiers / jour",
    "Mémoire IA renforcée",
    "35 recherches web / jour",
  ],
  max: [
    "100 messages / heure",
    "Max débloque la réflexion approfondie",
    "50 fichiers / jour",
    "Capacité maximale mAI",
    "50 recherches web / jour",
  ],
};\n`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
