import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';
import { requireAdminPin, setNoStore } from '../api/lib/admin-auth.ts';
import {
  UpstreamError,
  buildDuellFailureLog,
  classifySecretPrefix,
  duellServiceHeaders,
  fetchDuellStatsRpc,
  normalizeDuellStats,
  resolveDuellRpcUrl,
  userFacingDuellError
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
  mock.restoreAll();
});

function stashEnv() {
  for (const key of envKeys) {
    if (!(key in saved)) saved[key] = process.env[key];
  }
}

const okStats = {
  registrierte_spieler: 1,
  gaeste_gesamt: 0,
  aktuell_online: 0,
  aktive_duelle: 0,
  duelle_heute: 0,
  duelle_insgesamt: 0,
  feedbacks: [],
  online_definition: 'def'
};

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

describe('duellServiceHeaders / classify / normalize', () => {
  it('sb_secret_: nur apikey, kein Authorization, User-Agent node', () => {
    const headers = duellServiceHeaders('sb_secret_test');
    assert.equal(headers.apikey, 'sb_secret_test');
    assert.equal(headers['Content-Type'], 'application/json');
    assert.equal(headers['User-Agent'], 'node');
    assert.equal(headers.Authorization, undefined);
  });

  it('Legacy-JWT: Bearer und apikey', () => {
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.sig';
    const headers = duellServiceHeaders(jwt);
    assert.equal(headers.Authorization, `Bearer ${jwt}`);
    assert.equal(headers.apikey, jwt);
    assert.equal(headers['User-Agent'], 'node');
  });

  it('classifySecretPrefix', () => {
    assert.equal(classifySecretPrefix('sb_secret_abc'), 'sb_secret');
    assert.equal(classifySecretPrefix('eyJhbGciOiJIUzI1NiJ9.e30.x'), 'legacy_jwt');
    assert.equal(classifySecretPrefix('"sb_secret_x"'), 'anomaly');
    assert.equal(classifySecretPrefix('sb_publishable_x'), 'anomaly');
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

describe('resolveDuellRpcUrl', () => {
  it('baut RPC-URL aus Origin', () => {
    const r = resolveDuellRpcUrl('https://dgpafaefazeyrbhfjsur.supabase.co');
    assert.equal(r.host, 'dgpafaefazeyrbhfjsur.supabase.co');
    assert.equal(r.rpcUrl, 'https://dgpafaefazeyrbhfjsur.supabase.co/rest/v1/rpc/_admin_duell_stats');
  });

  it('lehnt Pfad /rest/v1 ab', () => {
    assert.throws(
      () => resolveDuellRpcUrl('https://example.supabase.co/rest/v1'),
      (err: unknown) => err instanceof UpstreamError && err.stage === 'invalid_url'
    );
  });

  it('lehnt Anführungszeichen ab', () => {
    assert.throws(
      () => resolveDuellRpcUrl('"https://example.supabase.co"'),
      (err: unknown) => err instanceof UpstreamError && err.stage === 'invalid_url'
    );
  });

  it('lehnt Whitespace am Rand ab', () => {
    assert.throws(
      () => resolveDuellRpcUrl(' https://example.supabase.co'),
      (err: unknown) => err instanceof UpstreamError && err.stage === 'invalid_url'
    );
  });
});

describe('fetchDuellStatsRpc', () => {
  it('ruft RPC mit sb_secret-Headern (nur apikey) auf', async () => {
    let calledUrl = '';
    let calledInit: RequestInit | undefined;
    const fetchImpl: typeof fetch = async (input, init) => {
      calledUrl = String(input);
      calledInit = init;
      return new Response(JSON.stringify(okStats), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };
    const stats = await fetchDuellStatsRpc('https://example.supabase.co', 'sb_secret_x', fetchImpl);
    assert.equal(calledUrl, 'https://example.supabase.co/rest/v1/rpc/_admin_duell_stats');
    const h = calledInit?.headers as Record<string, string>;
    assert.equal(h.apikey, 'sb_secret_x');
    assert.equal(h.Authorization, undefined);
    assert.equal(h['User-Agent'], 'node');
    assert.equal(stats.registrierte_spieler, 1);
  });

  it('wirft UpstreamError mit httpStatus bei 401', async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ message: 'Invalid API key' }), { status: 401 });
    await assert.rejects(
      () => fetchDuellStatsRpc('https://example.supabase.co', 'sb_secret_x', fetchImpl),
      (err: unknown) =>
        err instanceof UpstreamError && err.stage === 'upstream_http' && err.httpStatus === 401
    );
  });

  it('wirft UpstreamError network bei Fetch-Fehler', async () => {
    const fetchImpl: typeof fetch = async () => {
      throw new TypeError('fetch failed');
    };
    await assert.rejects(
      () => fetchDuellStatsRpc('https://example.supabase.co', 'sb_secret_x', fetchImpl),
      (err: unknown) => err instanceof UpstreamError && err.stage === 'network'
    );
  });
});

describe('buildDuellFailureLog / userFacing', () => {
  it('enthält keine Secret-Werte', () => {
    const secret = 'sb_secret_SUPERSECRETVALUE_DO_NOT_LEAK';
    const log = buildDuellFailureLog(
      new UpstreamError('upstream_http', 'Supabase-RPC HTTP 401', {
        httpStatus: 401,
        baseUrlHost: 'example.supabase.co'
      }),
      { baseUrl: 'https://example.supabase.co', secret }
    );
    const serialized = JSON.stringify(log);
    assert.equal(serialized.includes('SUPERSECRET'), false);
    assert.equal(serialized.includes(secret), false);
    assert.equal(log.secret_prefix, 'sb_secret');
    assert.equal(log.http_status, 401);
    assert.deepEqual(log.env, { has_url: true, has_secret: true });
  });

  it('userFacing enthält HTTP-Status', () => {
    const msg = userFacingDuellError(
      new UpstreamError('upstream_http', 'x', { httpStatus: 401 })
    );
    assert.match(msg, /HTTP 401/);
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

  it('401 bei falschem PIN ohne Secret im Log', async () => {
    stashEnv();
    process.env.ADMIN_PIN = 'pin';
    process.env.SUPABASE_DUELL_URL = 'https://example.supabase.co';
    process.env.SUPABASE_DUELL_SECRET_KEY = 'sb_secret_SHOULD_NOT_APPEAR';
    const logs: unknown[] = [];
    const spy = mock.method(console, 'error', (...args: unknown[]) => {
      logs.push(args);
    });
    const res = mockRes();
    await handler({ method: 'POST', body: { pin: 'wrong' } }, res);
    spy.mock.restore();
    assert.equal(res.statusCode, 401);
    assert.equal(logs.length, 0);
    assert.equal(JSON.stringify(res.body).includes('SHOULD_NOT_APPEAR'), false);
  });

  it('405 bei GET', async () => {
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    assert.equal(res.statusCode, 405);
    assert.equal(res.headers['Cache-Control'], 'no-store');
  });

  it('502 bei upstream 401 mit sicherem console.error', async () => {
    stashEnv();
    process.env.ADMIN_PIN = 'pin';
    process.env.SUPABASE_DUELL_URL = 'https://example.supabase.co';
    process.env.SUPABASE_DUELL_SECRET_KEY = 'sb_secret_LEAKCHECK';
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response('{"message":"Invalid API key"}', { status: 401 })) as typeof fetch;
    const logs: unknown[] = [];
    const spy = mock.method(console, 'error', (...args: unknown[]) => {
      logs.push(args);
    });
    try {
      const res = mockRes();
      await handler({ method: 'POST', body: { pin: 'pin' } }, res);
      assert.equal(res.statusCode, 502);
      const body = res.body as { error: string };
      assert.match(body.error, /HTTP 401/);
      assert.equal(logs.length, 1);
      const serialized = JSON.stringify(logs);
      assert.equal(serialized.includes('LEAKCHECK'), false);
      assert.equal(serialized.includes('sb_secret_LEAKCHECK'), false);
      assert.equal(serialized.includes('"pin"'), false);
      const payload = (logs[0] as unknown[])[1] as Record<string, unknown>;
      assert.equal(payload.http_status, 401);
      assert.equal(payload.secret_prefix, 'sb_secret');
      assert.equal(payload.stage, 'upstream_http');
    } finally {
      spy.mock.restore();
      globalThis.fetch = originalFetch;
    }
  });

  it('502 bei invalid_url mit Diagnose-Log', async () => {
    stashEnv();
    process.env.ADMIN_PIN = 'pin';
    process.env.SUPABASE_DUELL_URL = 'https://example.supabase.co/rest/v1';
    process.env.SUPABASE_DUELL_SECRET_KEY = 'sb_secret_x';
    const logs: unknown[] = [];
    const spy = mock.method(console, 'error', (...args: unknown[]) => {
      logs.push(args);
    });
    try {
      const res = mockRes();
      await handler({ method: 'POST', body: { pin: 'pin' } }, res);
      assert.equal(res.statusCode, 502);
      const body = res.body as { error: string };
      assert.match(body.error, /URL ungültig/);
      const payload = (logs[0] as unknown[])[1] as Record<string, unknown>;
      assert.equal(payload.stage, 'invalid_url');
    } finally {
      spy.mock.restore();
    }
  });
});
