import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { requireAdminPin, setNoStore } from '../api/lib/admin-auth.ts';
import {
  duellServiceHeaders,
  fetchDuellStatsRpc,
  normalizeDuellStats
} from '../api/lib/duell-stats.ts';
import handler from '../api/admin-parkbank.ts';

type ResCapture = {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
  status: (code: number) => ResCapture;
  json: (body: unknown) => void;
  setHeader: (k: string, v: string) => void;
};

function mockRes(): ResCapture {
  const res: ResCapture = {
    statusCode: 0,
    body: null,
    headers: {},
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
    },
    setHeader(k: string, v: string) {
      this.headers[k] = v;
    }
  };
  return res;
}

const envKeys = ['ADMIN_PIN', 'SUPABASE_DUELL_URL', 'SUPABASE_DUELL_SECRET_KEY'] as const;
const saved: Record<string, string | undefined> = {};

afterEach(() => {
  for (const key of envKeys) {
    if (key in saved) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
      delete saved[key];
    }
  }
});

function stashEnv() {
  for (const key of envKeys) {
    if (!(key in saved)) saved[key] = process.env[key];
  }
}

describe('requireAdminPin', () => {
  it('liefert 503 wenn ADMIN_PIN fehlt', () => {
    stashEnv();
    delete process.env.ADMIN_PIN;
    const result = requireAdminPin('1870');
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 503);
  });

  it('liefert 401 bei falschem PIN', () => {
    stashEnv();
    process.env.ADMIN_PIN = 'geheim';
    const result = requireAdminPin('falsch');
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 401);
  });

  it('akzeptiert konfigurierten PIN', () => {
    stashEnv();
    process.env.ADMIN_PIN = 'geheim';
    assert.deepEqual(requireAdminPin('geheim'), { ok: true });
  });
});

describe('setNoStore', () => {
  it('setzt Cache-Control no-store', () => {
    const res = mockRes();
    setNoStore(res);
    assert.equal(res.headers['Cache-Control'], 'no-store');
  });
});

describe('duellServiceHeaders / normalize', () => {
  it('setzt Bearer und apikey für Secret-Keys', () => {
    const headers = duellServiceHeaders('sb_secret_test');
    assert.equal(headers.Authorization, 'Bearer sb_secret_test');
    assert.equal(headers.apikey, 'sb_secret_test');
  });

  it('normalisiert RPC-JSON', () => {
    const stats = normalizeDuellStats({
      registrierte_spieler: 2,
      gaeste_gesamt: 5,
      aktuell_online: 1,
      aktive_duelle: 0,
      duelle_heute: 3,
      duelle_insgesamt: 9,
      feedbacks: [
        {
          kind: 'umfrage',
          spass: 5,
          schwierigkeit: 'zu_leicht',
          probleme: true,
          comment: 'Hi',
          created_at: '2026-11-06T12:00:00+01:00'
        }
      ],
      online_definition: 'test'
    });
    assert.equal(stats.registrierte_spieler, 2);
    assert.equal(stats.feedbacks[0]?.spass, 5);
    assert.equal(stats.online_definition, 'test');
  });
});

describe('fetchDuellStatsRpc', () => {
  it('ruft RPC mit Service-Role-Headern auf', async () => {
    let calledUrl = '';
    let calledInit: RequestInit | undefined;
    const fetchImpl: typeof fetch = async (input, init) => {
      calledUrl = String(input);
      calledInit = init;
      return new Response(
        JSON.stringify({
          registrierte_spieler: 1,
          gaeste_gesamt: 0,
          aktuell_online: 0,
          aktive_duelle: 0,
          duelle_heute: 0,
          duelle_insgesamt: 0,
          feedbacks: [],
          online_definition: 'def'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };
    const stats = await fetchDuellStatsRpc('https://example.supabase.co', 'sb_secret_x', fetchImpl);
    assert.equal(calledUrl, 'https://example.supabase.co/rest/v1/rpc/_admin_duell_stats');
    assert.equal((calledInit?.headers as Record<string, string>).Authorization, 'Bearer sb_secret_x');
    assert.equal(stats.registrierte_spieler, 1);
  });
});

describe('POST /api/admin-parkbank', () => {
  it('503 wenn Duell-Env fehlt', async () => {
    stashEnv();
    process.env.ADMIN_PIN = 'pin';
    delete process.env.SUPABASE_DUELL_URL;
    delete process.env.SUPABASE_DUELL_SECRET_KEY;
    const res = mockRes();
    await handler({ method: 'POST', body: { pin: 'pin' } }, res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.headers['Cache-Control'], 'no-store');
  });

  it('401 bei falschem PIN', async () => {
    stashEnv();
    process.env.ADMIN_PIN = 'pin';
    process.env.SUPABASE_DUELL_URL = 'https://example.supabase.co';
    process.env.SUPABASE_DUELL_SECRET_KEY = 'sb_secret_x';
    const res = mockRes();
    await handler({ method: 'POST', body: { pin: 'wrong' } }, res);
    assert.equal(res.statusCode, 401);
    assert.equal(res.headers['Cache-Control'], 'no-store');
  });

  it('405 bei GET', async () => {
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    assert.equal(res.statusCode, 405);
    assert.equal(res.headers['Cache-Control'], 'no-store');
  });
});
