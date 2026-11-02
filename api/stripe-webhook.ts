import { setVip, stripeClient } from './lib/abo.js';

export const config = { api: { bodyParser: false } };

function readBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    res.status(503).end();
    return;
  }
  try {
    const body = await readBody(req);
    const event = stripeClient().webhooks.constructEvent(body, req.headers['stripe-signature'], secret);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as { client_reference_id?: string; customer?: string };
      if (session.client_reference_id) {
        await setVip(session.client_reference_id, true, session.customer);
      }
    }
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as { status?: string; metadata?: { user_id?: string }; customer?: string };
      if (sub.metadata?.user_id) {
        const active = sub.status === 'active' || sub.status === 'trialing';
        await setVip(sub.metadata.user_id, active, typeof sub.customer === 'string' ? sub.customer : undefined);
      }
    }
    res.status(200).json({ received: true });
  } catch {
    res.status(400).end();
  }
}
