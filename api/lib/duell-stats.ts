export type DuellFeedbackItem = {
  kind: string;
  spass: number | null;
  schwierigkeit: string | null;
  probleme: boolean | null;
  comment: string;
  created_at: string;
};

export type DuellStatsPayload = {
  registrierte_spieler: number;
  gaeste_gesamt: number;
  aktuell_online: number;
  aktive_duelle: number;
  duelle_heute: number;
  duelle_insgesamt: number;
  feedbacks: DuellFeedbackItem[];
  online_definition: string;
};

export type DuellErrorStage =
  | 'invalid_url'
  | 'upstream_http'
  | 'timeout'
  | 'network'
  | 'parse';

export type SecretPrefixKind = 'sb_secret' | 'legacy_jwt' | 'anomaly';

const FETCH_TIMEOUT_MS = 12_000;

/** Typisierter Upstream-Fehler ohne Secrets im Message-Text. */
export class UpstreamError extends Error {
  readonly stage: DuellErrorStage;
  readonly httpStatus: number | null;
  readonly baseUrlHost: string | null;

  constructor(
    stage: DuellErrorStage,
    message: string,
    options?: { httpStatus?: number | null; baseUrlHost?: string | null; cause?: unknown }
  ) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'UpstreamError';
    this.stage = stage;
    this.httpStatus = options?.httpStatus ?? null;
    this.baseUrlHost = options?.baseUrlHost ?? null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeFeedback(raw: unknown): DuellFeedbackItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => {
    const row = isRecord(entry) ? entry : {};
    const spassRaw = row.spass;
    let spass: number | null = null;
    if (typeof spassRaw === 'number' && Number.isFinite(spassRaw)) spass = spassRaw;
    else if (typeof spassRaw === 'string' && spassRaw !== '' && Number.isFinite(Number(spassRaw))) {
      spass = Number(spassRaw);
    }
    return {
      kind: asString(row.kind),
      spass,
      schwierigkeit:
        row.schwierigkeit === null || row.schwierigkeit === undefined
          ? null
          : asString(row.schwierigkeit),
      probleme: typeof row.probleme === 'boolean' ? row.probleme : null,
      comment: asString(row.comment),
      created_at: asString(row.created_at)
    };
  });
}

export function normalizeDuellStats(raw: unknown): DuellStatsPayload {
  const data = isRecord(raw) ? raw : {};
  return {
    registrierte_spieler: asNumber(data.registrierte_spieler),
    gaeste_gesamt: asNumber(data.gaeste_gesamt),
    aktuell_online: asNumber(data.aktuell_online),
    aktive_duelle: asNumber(data.aktive_duelle),
    duelle_heute: asNumber(data.duelle_heute),
    duelle_insgesamt: asNumber(data.duelle_insgesamt),
    feedbacks: normalizeFeedback(data.feedbacks),
    online_definition: asString(
      data.online_definition,
      'Queue last_seen ≤ 6 s (Matchmaking) oder aktives Match'
    )
  };
}

/** Sichere Klassifikation – niemals den Key-Wert zurückgeben. */
export function classifySecretPrefix(secret: string): SecretPrefixKind {
  if (secret.startsWith('sb_secret_')) return 'sb_secret';
  if (secret.startsWith('eyJ')) return 'legacy_jwt';
  return 'anomaly';
}

/**
 * Header für Duell-REST:
 * - sb_secret_: nur apikey (+ Content-Type, User-Agent node) – kein Bearer (kein JWT)
 * - Legacy-JWT (eyJ…): Authorization Bearer + apikey
 */
export function duellServiceHeaders(secret: string): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: secret,
    'Content-Type': 'application/json',
    'User-Agent': 'node'
  };
  if (secret.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${secret}`;
  }
  return headers;
}

/** Prüft die Basis-URL ohne stillschweigendes Reparieren (kein Trim von Quotes). */
export function resolveDuellRpcUrl(baseUrl: string): { rpcUrl: string; host: string } {
  if (baseUrl !== baseUrl.trim()) {
    throw new UpstreamError('invalid_url', 'SUPABASE_DUELL_URL hat führende/trailing Whitespace');
  }
  if (
    (baseUrl.startsWith('"') && baseUrl.endsWith('"')) ||
    (baseUrl.startsWith("'") && baseUrl.endsWith("'"))
  ) {
    throw new UpstreamError('invalid_url', 'SUPABASE_DUELL_URL ist in Anführungszeichen gespeichert');
  }
  if (/[\r\n]/.test(baseUrl)) {
    throw new UpstreamError('invalid_url', 'SUPABASE_DUELL_URL enthält Zeilenumbrüche');
  }

  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new UpstreamError('invalid_url', 'SUPABASE_DUELL_URL ist keine gültige URL');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new UpstreamError('invalid_url', 'SUPABASE_DUELL_URL braucht http(s)', {
      baseUrlHost: parsed.host || null
    });
  }

  const path = parsed.pathname.replace(/\/+$/, '') || '';
  if (path !== '' && path !== '/') {
    // Typischer Paste-Fehler: URL schon mit /rest/v1
    throw new UpstreamError(
      'invalid_url',
      'SUPABASE_DUELL_URL darf keinen Pfad haben (nur Origin, ohne /rest/v1)',
      { baseUrlHost: parsed.host }
    );
  }

  const origin = parsed.origin;
  return {
    rpcUrl: `${origin}/rest/v1/rpc/_admin_duell_stats`,
    host: parsed.host
  };
}

export async function fetchDuellStatsRpc(
  baseUrl: string,
  secret: string,
  fetchImpl: typeof fetch = fetch
): Promise<DuellStatsPayload> {
  const { rpcUrl, host } = resolveDuellRpcUrl(baseUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    let response: Response;
    try {
      response = await fetchImpl(rpcUrl, {
        method: 'POST',
        headers: duellServiceHeaders(secret),
        body: '{}',
        signal: controller.signal
      });
    } catch (err) {
      const name = err instanceof Error ? err.name : 'Error';
      if (name === 'AbortError') {
        throw new UpstreamError('timeout', 'Supabase-RPC Timeout', {
          baseUrlHost: host,
          cause: err
        });
      }
      throw new UpstreamError('network', 'Supabase-RPC Netzfehler', {
        baseUrlHost: host,
        cause: err
      });
    }

    if (!response.ok) {
      throw new UpstreamError('upstream_http', `Supabase-RPC HTTP ${response.status}`, {
        httpStatus: response.status,
        baseUrlHost: host
      });
    }

    try {
      const body: unknown = await response.json();
      return normalizeDuellStats(body);
    } catch (err) {
      throw new UpstreamError('parse', 'Supabase-RPC Antwort kein JSON', {
        baseUrlHost: host,
        cause: err
      });
    }
  } finally {
    clearTimeout(timer);
  }
}

/** Sicheres Log-Objekt – keine Secrets, kein PIN, kein Body. */
export function buildDuellFailureLog(
  err: unknown,
  env: { baseUrl?: string; secret?: string }
): Record<string, unknown> {
  const hasUrl = typeof env.baseUrl === 'string' && env.baseUrl.length > 0;
  const hasSecret = typeof env.secret === 'string' && env.secret.length > 0;
  let host: string | null = null;
  if (hasUrl && env.baseUrl) {
    try {
      host = new URL(env.baseUrl.trim()).host || null;
    } catch {
      host = null;
    }
  }

  if (err instanceof UpstreamError) {
    return {
      scope: 'admin-parkbank',
      stage: err.stage,
      http_status: err.httpStatus,
      error_name: err.name,
      message: err.message,
      env: { has_url: hasUrl, has_secret: hasSecret },
      baseUrlHost: err.baseUrlHost ?? host,
      secret_prefix: hasSecret && env.secret ? classifySecretPrefix(env.secret) : null
    };
  }

  return {
    scope: 'admin-parkbank',
    stage: 'network',
    http_status: null,
    error_name: err instanceof Error ? err.name : 'Error',
    message: err instanceof Error ? err.message : 'unknown',
    env: { has_url: hasUrl, has_secret: hasSecret },
    baseUrlHost: host,
    secret_prefix: hasSecret && env.secret ? classifySecretPrefix(env.secret) : null
  };
}

export function userFacingDuellError(err: unknown): string {
  if (err instanceof UpstreamError && err.stage === 'upstream_http' && err.httpStatus != null) {
    return `Supabase-Verbindung fehlgeschlagen (HTTP ${err.httpStatus}). Serverprotokoll prüfen.`;
  }
  if (err instanceof UpstreamError && err.stage === 'invalid_url') {
    return 'Supabase-URL ungültig konfiguriert. Serverprotokoll prüfen.';
  }
  if (err instanceof UpstreamError && err.stage === 'timeout') {
    return 'Supabase-Verbindung Timeout. Serverprotokoll prüfen.';
  }
  return 'Parkbank-Duell-Stats konnten nicht geladen werden.';
}
