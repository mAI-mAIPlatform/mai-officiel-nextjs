const fs = require('fs');
const file = 'components/chat/multimodal-input.tsx';
let content = fs.readFileSync(file, 'utf8');

// Also remove mai:voice-submit event listener logic
content = content.replace(/  useEffect\(\(\) => \{\n    const voiceSubmitHandler = \(event: Event\) => \{\n      const customEvent = event as CustomEvent<\{ chatId\?: string; text\?: string \}>;\n      const text = customEvent.detail\?.text\?.trim\(\);\n      if \(!text \|\| status !== "ready"\) \{\n        return;\n      \}\n\n      setInput\(text\);\n      void \(sendMessage as UseChatHelpers<ChatMessage>\["sendMessage"\]\)\(\{\n        role: "user",\n        parts: \[\{ type: "text", text \}\],\n      \}\);\n    \};\n\n    window.addEventListener\("mai:voice-submit", voiceSubmitHandler as EventListener\);\n    return \(\) =>\n      window.removeEventListener\(\n        "mai:voice-submit",\n        voiceSubmitHandler as EventListener\n      \);\n  \}, \[sendMessage, setInput, status\]\);\n/, '');

fs.writeFileSync(file, content);
