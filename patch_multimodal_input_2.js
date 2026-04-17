const fs = require('fs');
const file = 'components/chat/multimodal-input.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<Button\s*className=\{cn\(\s*"flex h-8 w-full items-center justify-start gap-2 text-xs font-normal",\s*isReasoningEnabled &&\s*"bg-primary\/10 text-primary hover:bg-primary\/20 hover:text-primary",\s*\)\}\s*onClick=\{\(\) => setIsReasoningEnabled\(!isReasoningEnabled\)\}\s*variant="ghost"\s*>\s*<BrainIcon\s*className=\{\s*isReasoningEnabled \? "text-primary" : "text-muted-foreground"\s*\}\s*size=\{16\}\s*\/>\s*Réflexion\s*<\/Button>\s*\{isReasoningEnabled && \([\s\S]*?\}\)\s*<\/div>\s*<\/div>\s*\)\}/g;

content = content.replace(regex, '');

fs.writeFileSync(file, content);
