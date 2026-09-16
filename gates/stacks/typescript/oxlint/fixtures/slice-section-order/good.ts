// ✓ vs-01 — route, types, then handler.
export const ROUTE = "/orders/cancel";
export type Request = { orderId: string };
export function handle(req: Request) {
  return `${ROUTE}:${req.orderId}`;
}
