// ✗ llm-12 — config read outside the one config module; a missing value fails at first use, not at startup.
export const apiUrl = process.env.API_URL;
