// ✓ tst-04 — the slice's ROUTE const is the only spelling of the path.
declare const request: { post(url: string): Promise<unknown> };
const Login = { ROUTE: "/identity/login" };
export const t = () => request.post(Login.ROUTE);
