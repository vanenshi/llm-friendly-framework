// ✓ llm-12 — this file IS the config module (allow-listed), reads once, validates, exports typed.
const raw = process.env.API_URL;
if (!raw) throw new Error("API_URL missing");
export const env = { apiUrl: raw };
