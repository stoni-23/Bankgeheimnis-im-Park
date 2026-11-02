import Stripe from 'stripe';

export const supabaseUrl = 'https://espbxuhqaveurnzviglt.supabase.co';
const supabasePublishable = 'sb_publishable_35bLvwrzE1y0prcVXB3KCg_UK9FcLUb';

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY fehlt');
  return new Stripe(key);
}

export function priceId() {
  const id = process.env.STRIPE_PRICE_ID;
  if (!id) throw new Error('STRIPE_PRICE_ID fehlt');
  return id;
}

export async function userFromAuthHeader(header: string | undefined) {
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice(7);
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabasePublishable
    }
  });
  if (!response.ok) return null;
  return response.json() as Promise<{
    id: string;
    email?: string;
    app_metadata?: { vip?: boolean; stripe_customer?: string };
  }>;
}

export async function setVip(userId: string, vip: boolean, stripeCustomer?: string) {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error('SUPABASE_SECRET_KEY fehlt');
  const headers = {
    Authorization: `Bearer ${secret}`,
    apikey: secret,
    'Content-Type': 'application/json'
  };
  const currentResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, { headers });
  if (!currentResponse.ok) throw new Error('Nutzer nicht gefunden');
  const current = await currentResponse.json();
  const app_metadata = { ...(current.app_metadata || {}), vip };
  if (stripeCustomer) app_metadata.stripe_customer = stripeCustomer;
  const update = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ app_metadata })
  });
  if (!update.ok) throw new Error('Ausweis konnte nicht gespeichert werden');
}
