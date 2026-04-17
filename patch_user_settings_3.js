const fs = require('fs');
const file = 'components/chat/user-settings-dialog.tsx';
let content = fs.readFileSync(file, 'utf8');

const voiceSectionRegex = /<section className="rounded-2xl border border-border\/60 bg-background\/40 p-4 shadow-\[var\(--shadow-card\)\] backdrop-blur-xl">\s*<div className="flex items-center gap-2">\s*<Volume2 className="size-4 text-cyan-400" \/>[\s\S]*?Autoriser les notifications PWA \(iPhone\/Android\)\s*<\/button>\s*<\/section>/;
content = content.replace(voiceSectionRegex, '');

content = content.replace(/type VoiceSettings = \{\n  captionsEnabled: boolean;\n  interfaceMode: "liquid" \| "minimal";\n  pitch: number;\n  rate: number;\n  voiceURI: string;\n\};\n\nconst VOICE_SETTINGS_STORAGE_KEY = "mai.voice.settings.v1";\n\nconst DEFAULT_VOICE_SETTINGS: VoiceSettings = \{\n  captionsEnabled: true,\n  interfaceMode: "liquid",\n  pitch: 1,\n  rate: 1,\n  voiceURI: "",\n\};\n/, '');

content = content.replace(/  const \[voiceSettings, setVoiceSettings\] = useLocalStorage<VoiceSettings>\(\n    VOICE_SETTINGS_STORAGE_KEY,\n    DEFAULT_VOICE_SETTINGS\n  \);\n/, '');

content = content.replace(/  const \[availableVoices, setAvailableVoices\] = useState<SpeechSynthesisVoice\[\]>\(\n    \[\]\n  \);\n/, '');

content = content.replace(/  useEffect\(\(\) => \{\n    if \(typeof window === "undefined" \|\| !\("speechSynthesis" in window\)\) \{\n      return;\n    \}\n\n    const loadVoices = \(\) => \{\n      setAvailableVoices\(window.speechSynthesis.getVoices\(\)\);\n    \};\n\n    loadVoices\(\);\n    window.speechSynthesis.addEventListener\("voiceschanged", loadVoices\);\n\n    return \(\) => \{\n      window.speechSynthesis.removeEventListener\("voiceschanged", loadVoices\);\n    \};\n  \}, \[\]\);\n/, '');

content = content.replace(/  useEffect\(\(\) => \{\n    window.dispatchEvent\(\n      new CustomEvent\("mai:voice-settings-updated", \{\n        detail: voiceSettings,\n      \}\),\n    \);\n  \}, \[voiceSettings\]\);\n/, '');

fs.writeFileSync(file, content);
