// ✗ tst-04 — renaming the route leaves this test green while hitting a 404.
declare const request: { post(url: string): Promise<unknown> };
export const t = () => request.post("/identity/login");
