import { requireAdminPin, setNoStore } from './lib/admin-auth.js';
import {
  buildDuellFailureLog,
  fetchDuellStatsRpc,
  userFacingDuellError
} from './lib/duell-stats.js';

type VercelReq = {
  method?: string;
  body?: { pin?: unknown };
};

type VercelRes = {
  status: (code: number) => VercelRes;
  json: (body: unknown) => void;
  setHeader: (k: string, v: string) => void;
};

export default async function handler(req: VercelReq, res: VercelRes) {
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

  const baseUrl = process.env.SUPABASE_DUELL_URL;
  const secret = process.env.SUPABASE_DUELL_SECRET_KEY;
  if (!baseUrl || !secret) {
    res.status(503).json({ error: 'Parkbank-Duell-Stats sind noch nicht angebunden.' });
    return;
  }

  try {
    const stats = await fetchDuellStatsRpc(baseUrl, secret);
    res.status(200).json(stats);
  } catch (err) {
    // Nur sichere Felder – niemals Secret, PIN oder Request-Body
    console.error('[admin-parkbank]', buildDuellFailureLog(err, { baseUrl, secret }));
    res.status(502).json({ error: userFacingDuellError(err) });
  }
}
