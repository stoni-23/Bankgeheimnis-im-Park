import { setVip, supabaseUrl } from './lib/abo.js';
import { requireAdminPin, setNoStore } from './lib/admin-auth.js';

export default async function handler(req: any, res: any) {
  setNoStore(res);
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Nur POST.' });
    return;
  }
  const auth = requireAdminPin(req.body?.pin);
  if (!auth.ok) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    res.status(503).json({ error: 'Konten sind noch nicht angebunden.' });
    return;
  }
  const headers = {
    Authorization: `Bearer ${secret}`,
    apikey: secret,
    'Content-Type': 'application/json'
  };

  try {
    if (req.body?.action === 'vip') {
      const userId = String(req.body.userId || '');
      if (!userId) {
        res.status(400).json({ error: 'Nutzer fehlt.' });
        return;
      }
      await setVip(userId, req.body.vip === true);
      res.status(200).json({ ok: true });
      return;
    }

    const collected: Array<{
      id: string;
      name: string;
      email: string;
      isVip: boolean;
      memberSince: string;
      status: 'active';
    }> = [];
    for (let page = 1; page <= 10; page += 1) {
      const list = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=200`, { headers });
      if (!list.ok) throw new Error('liste');
      const body = await list.json();
      const users = Array.isArray(body.users) ? body.users : [];
      for (const user of users) {
        const created = String(user.created_at || '');
        collected.push({
          id: user.id,
          name: user.user_metadata?.name || (user.email || '').split('@')[0] || 'Konto',
          email: user.email || '',
          isVip: user.app_metadata?.vip === true,
          memberSince: created.slice(0, 10) || '',
          status: 'active'
        });
      }
      if (users.length < 200) break;
    }
    collected.sort((a, b) => b.memberSince.localeCompare(a.memberSince));
    res.status(200).json({ users: collected });
  } catch {
    res.status(500).json({ error: 'Konten konnten nicht geladen werden.' });
  }
}
