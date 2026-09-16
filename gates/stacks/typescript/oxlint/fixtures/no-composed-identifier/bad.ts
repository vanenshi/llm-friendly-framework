// ✗ llm-01 — grep "/identity/login" finds nothing; the string exists only at runtime.
const module = "identity";
export const ROUTE = `/${module}/login`;
export const errorKey = "Identity." + "InvalidCredentials";
