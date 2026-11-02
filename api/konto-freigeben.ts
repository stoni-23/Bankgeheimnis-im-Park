import { supabaseUrl } from './lib/abo';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Nur POST.' });
    return;
  }
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email.includes('@')) {
    res.status(400).json({ error: 'E-Mail fehlt.' });
    return;
  }
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    res.status(503).json({ error: 'Freischalten ist noch nicht eingerichtet.' });
    return;
  }
  const headers = {
    Authorization: `Bearer ${secret}`,
    apikey: secret,
    'Content-Type': 'application/json'
  };
  try {
    let found: { id: string; email?: string } | undefined;
    for (let page = 1; page <= 10 && !found; page += 1) {
      const list = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=200`, { headers });
      if (!list.ok) throw new Error('liste');
      const body = await list.json();
      const users = Array.isArray(body.users) ? body.users : [];
      found = users.find((user: { email?: string }) => (user.email || '').toLowerCase() === email);
      if (users.length < 200) break;
    }
    if (!found) {
      res.status(404).json({ error: 'Konto nicht gefunden.' });
      return;
    }
    const update = await fetch(`${supabaseUrl}/auth/v1/admin/users/${found.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ email_confirm: true })
    });
    if (!update.ok) throw new Error('update');
    res.status(200).json({ ok: true });
  } catch {
    res.status(503).json({ error: 'Konto ließ sich nicht freischalten.' });
  }
}
