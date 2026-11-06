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

export type NetworkCauseSafe = {
  name?: string;
  code?: string;
  syscall?: string;
  errno?: number;
  port?: number;
  summary?: string;
};

/** Typisierter Upstream-Fehler ohne Secrets im Message-Text. */
export class UpstreamError extends Error {
  readonly stage: DuellErrorStage;
  readonly httpStatus: number | null;
  readonly baseUrlHost: string | null;
  readonly networkCause: NetworkCauseSafe | null;

  constructor(
    stage: DuellErrorStage,
    message: string,
    options?: {
      httpStatus?: number | null;
      baseUrlHost?: string | null;
      cause?: unknown;
      networkCause?: NetworkCauseSafe | null;
    }
  ) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'UpstreamError';
    this.stage = stage;
    this.httpStatus = options?.httpStatus ?? null;
    this.baseUrlHost = options?.baseUrlHost ?? null;
    this.networkCause = options?.networkCause ?? null;
  }
}

const ALLOWED_ERROR_NAMES = new Set([
  'Error',
  'TypeError',
  'RangeError',
  'AbortError',
  'DOMException',
  'SystemError',
  'AggregateError'
]);

/** Entfernt Hosts, IPs und credential-artige Tokens aus kurzen Cause-Texten. */
export function sanitizeCauseSummary(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  let s = raw.slice(0, 200);
  // Credentials / Bearer / Keys
  s = s.replace(/sb_secret_[A-Za-z0-9_]+/gi, '[REDACTED_SECRET]');
  s = s.replace(/sb_publishable_[A-Za-z0-9_]+/gi, '[REDACTED_PUB]');
  s = s.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED_JWT]');
  s = s.replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]');
  s = s.replace(/(api[_-]?key|password|secret|token)\s*[:=]\s*\S+/gi, '$1=[REDACTED]');
  // IPv4 / IPv6
  s = s.replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, '[IP]');
  s = s.replace(/\b(?:[A-Fa-f0-9]{0,4}:){2,7}[A-Fa-f0-9]{0,4}\b/g, '[IP]');
  // Hostnamen / Domains (nach getaddrinfo etc. oft enthalten)
  s = s.replace(/\b[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+\b/gi, '[HOST]');
  s = s.replace(/\s+/g, ' ').trim();
  // Nur behalten, wenn noch ein erkennbarer Netz-Code/Syscall-Hinweis übrig ist
  if (!/[A-Z]{2,}[_A-Z0-9]*|getaddrinfo|connect|ENOTFOUND|EAI_|ECONN|ENET|ETIMEDOUT|EPROTO|ERR_/i.test(s)) {
    return null;
  }
  return s.slice(0, 120) || null;
}

function readCauseNode(node: unknown): NetworkCauseSafe | null {
  if (!isRecord(node) && !(node instanceof Error)) return null;
  const rec = node as Record<string, unknown>;
  const out: NetworkCauseSafe = {};
  const nameRaw = typeof rec.name === 'string' ? rec.name : node instanceof Error ? node.name : undefined;
  if (nameRaw && ALLOWED_ERROR_NAMES.has(nameRaw)) out.name = nameRaw;
  if (typeof rec.code === 'string' && /^[A-Z0-9_]{2,64}$/.test(rec.code)) out.code = rec.code;
  if (typeof rec.syscall === 'string' && /^[a-z0-9_]{1,40}$/i.test(rec.syscall)) out.syscall = rec.syscall;
  if (typeof rec.errno === 'number' && Number.isFinite(rec.errno)) out.errno = rec.errno;
  if (typeof rec.port === 'number' && Number.isFinite(rec.port) && rec.port > 0 && rec.port < 65536) {
    out.port = rec.port;
  }
  const msg = typeof rec.message === 'string' ? rec.message : node instanceof Error ? node.message : '';
  const summary = sanitizeCauseSummary(msg);
  if (summary) out.summary = summary;
  if (!out.name && !out.code && !out.syscall && out.errno === undefined && out.port === undefined && !out.summary) {
    return null;
  }
  return out;
}

/** Läuft Error.cause-Kette ab und nimmt den informativsten whitelisted Node. */
export function extractNetworkCause(err: unknown): NetworkCauseSafe | null {
  let best: NetworkCauseSafe | null = null;
  let cur: unknown = err;
  for (let i = 0; i < 6 && cur; i += 1) {
    const parsed = readCauseNode(cur);
    if (parsed) {
      // Bevorzuge Nodes mit code/syscall
      if (!best || (parsed.code && !best.code) || (parsed.syscall && !best.syscall)) {
        best = { ...best, ...parsed };
      } else if (best) {
        best = { ...parsed, ...best };
      } else {
        best = parsed;
      }
    }
    if (cur instanceof Error && 'cause' in cur) cur = (cur as Error & { cause?: unknown }).cause;
    else if (isRecord(cur) && 'cause' in cur) cur = cur.cause;
    else break;
  }
  return best;
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
      const networkCause = extractNetworkCause(err);
      if (name === 'AbortError') {
        throw new UpstreamError('timeout', 'Supabase-RPC Timeout', {
          baseUrlHost: host,
          cause: err,
          networkCause
        });
      }
      throw new UpstreamError('network', 'Supabase-RPC Netzfehler', {
        baseUrlHost: host,
        cause: err,
        networkCause
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
    const network_cause = err.networkCause ?? extractNetworkCause(err);
    return {
      scope: 'admin-parkbank',
      stage: err.stage,
      http_status: err.httpStatus,
      error_name: err.name,
      message: err.message,
      env: { has_url: hasUrl, has_secret: hasSecret },
      baseUrlHost: err.baseUrlHost ?? host,
      secret_prefix: hasSecret && env.secret ? classifySecretPrefix(env.secret) : null,
      network_cause
    };
  }

  return {
    scope: 'admin-parkbank',
    stage: 'network',
    http_status: null,
    error_name: err instanceof Error && ALLOWED_ERROR_NAMES.has(err.name) ? err.name : 'Error',
    message: 'unexpected',
    env: { has_url: hasUrl, has_secret: hasSecret },
    baseUrlHost: host,
    secret_prefix: hasSecret && env.secret ? classifySecretPrefix(env.secret) : null,
    network_cause: extractNetworkCause(err)
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
