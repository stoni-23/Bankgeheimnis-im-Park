import { setVip, stripeClient, userFromAuthHeader } from './_lib/abo';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Nur POST.' });
    return;
  }
  try {
    const user = await userFromAuthHeader(req.headers.authorization);
    const sessionId = req.body?.sessionId;
    if (!user || typeof sessionId !== 'string') {
      res.status(401).json({ error: 'Anmeldung fehlt.' });
      return;
    }
    const session = await stripeClient().checkout.sessions.retrieve(sessionId);
    if (session.client_reference_id !== user.id || session.status !== 'complete') {
      res.status(403).json({ error: 'Zahlung gehört nicht zu diesem Konto.' });
      return;
    }
    const customer = typeof session.customer === 'string' ? session.customer : undefined;
    await setVip(user.id, true, customer);
    res.status(200).json({ ok: true });
  } catch {
    res.status(503).json({ error: 'Ausweis konnte nicht aktiviert werden.' });
  }
}
