const fs = require('fs');
const file = 'components/chat/user-settings-dialog.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /  useEffect\(\(\) => \{\n    window.dispatchEvent\(\n      new CustomEvent\("mai:voice-settings-updated", \{\n        detail: voiceSettings,\n      \}\)\n    \);\n  \}, \[voiceSettings\]\);\n/g;

content = content.replace(regex, '');

fs.writeFileSync(file, content);
