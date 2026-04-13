## 2024-05-18 - [Fix environment variable leakage in code interpreter]
**Vulnerability:** All process environment variables (`...process.env`) were passed directly to spawned child processes executing user-provided code.
**Learning:** Exposing full `process.env` in `spawn`/`exec` environments poses a critical security risk by allowing malicious code access to secrets like database URLs or API keys.
**Prevention:** explicitly pass only strictly necessary, non-sensitive environment variables (such as `PATH`) when spawning processes to execute untrusted code.
