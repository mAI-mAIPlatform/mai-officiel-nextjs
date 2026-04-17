const fs = require('fs');
const file = 'app/(chat)/settings/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<Button\s*className="rounded-full"\s*onClick=\{handleSortSettings\}\s*size="sm"\s*type="button"\s*variant="outline"\s*>\s*<ListPlus className="mr-1 size-4" \/>\s*Trier les paramètres\s*<\/Button>/g;

content = content.replace(regex, '');

const regex2 = /const handleSortSettings = \(\) => \{[\s\S]*?\}\;\n\n/g;

content = content.replace(regex2, '');

fs.writeFileSync(file, content);
