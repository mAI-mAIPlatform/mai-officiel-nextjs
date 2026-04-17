const fs = require('fs');
const file = 'components/chat/shell.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{ VoiceTopActions \} from ".\/voice-top-actions";\n/, '');
content = content.replace(/<VoiceTopActions chatId=\{chatId\} messages=\{messages\} \/>\n\s*/, '');

fs.writeFileSync(file, content);
