import { stripeClient, userFromAuthHeader } from './_lib/abo';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Nur POST.' });
    return;
  }
  try {
    const user = await userFromAuthHeader(req.headers.authorization);
    const customer = user?.app_metadata?.stripe_customer;
    if (!user || !customer) {
      res.status(400).json({ error: 'Kein laufendes Abo gefunden.' });
      return;
    }
    const origin = req.headers.origin || 'https://bankgeheimnis-im-park.vercel.app';
    const portal = await stripeClient().billingPortal.sessions.create({
      customer,
      return_url: origin
    });
    res.status(200).json({ url: portal.url });
  } catch {
    res.status(503).json({ error: 'Abo kann gerade nicht geöffnet werden.' });
  }
}
