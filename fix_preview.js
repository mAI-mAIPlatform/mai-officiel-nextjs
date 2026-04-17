const fs = require('fs');
const file = 'components/chat/preview.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<> <p className="mt-2 text-sm font-medium text-purple-300"> Mode Fant00f4me <\/p> <p className="mt-1 text-xs text-purple-300\/80">\s*Le prochain message ne sera pas enregistré dans l'historique.\s*<\/p>\s*\)\}/,
`<>
  <p className="mt-2 text-sm font-medium text-purple-300">Mode Fantôme</p>
  <p className="mt-1 text-xs text-purple-300/80">
    Le prochain message ne sera pas enregistré dans l'historique.
  </p>
</>
          )}`);

content = content.replace(/title=\{isGhostModeEnabled \? "Mode Fant00f4me actif" : "Mode Fant00f4me"\}/g,
`title={isGhostModeEnabled ? "Mode Fantôme actif" : "Mode Fantôme"}`);

fs.writeFileSync(file, content);
