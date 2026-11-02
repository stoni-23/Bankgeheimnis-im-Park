import { priceId, stripeClient, userFromAuthHeader } from './lib/abo.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Nur POST.' });
    return;
  }
  try {
    const user = await userFromAuthHeader(req.headers.authorization);
    if (!user?.email) {
      res.status(401).json({ error: 'Erst anmelden.' });
      return;
    }
    const origin = req.headers.origin || 'https://bankgeheimnis-im-park.vercel.app';
    const customerId = user.app_metadata?.stripe_customer;
    const session = await stripeClient().checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId(), quantity: 1 }],
      client_reference_id: user.id,
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
      success_url: `${origin}/?abo=ok&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?abo=abgebrochen`
    });
    res.status(200).json({ url: session.url });
  } catch {
    res.status(503).json({ error: 'Die Zahlung ist noch nicht freigeschaltet.' });
  }
}
