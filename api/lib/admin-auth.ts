/** Gemeinsame Admin-PIN-Prüfung für Server-Endpoints (kein Default-PIN). */
export type AdminPinResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; error: string };

export function requireAdminPin(pin: unknown): AdminPinResult {
  const expected = process.env.ADMIN_PIN;
  if (!expected) {
    return { ok: false, status: 503, error: 'Admin ist noch nicht eingerichtet.' };
  }
  if (String(pin ?? '') !== expected) {
    return { ok: false, status: 401, error: 'PIN falsch.' };
  }
  return { ok: true };
}

export function setNoStore(res: { setHeader: (k: string, v: string) => void }) {
  res.setHeader('Cache-Control', 'no-store');
}
