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

const FETCH_TIMEOUT_MS = 12_000;

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

/** Service-Role-Header: neue sb_secret_-Keys und klassische JWT-service_role-Keys. */
export function duellServiceHeaders(secret: string): Record<string, string> {
  return {
    Authorization: `Bearer ${secret}`,
    apikey: secret,
    'Content-Type': 'application/json'
  };
}

export async function fetchDuellStatsRpc(
  baseUrl: string,
  secret: string,
  fetchImpl: typeof fetch = fetch
): Promise<DuellStatsPayload> {
  const url = `${baseUrl.replace(/\/$/, '')}/rest/v1/rpc/_admin_duell_stats`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: duellServiceHeaders(secret),
      body: '{}',
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`rpc_http_${response.status}`);
    }
    const body: unknown = await response.json();
    return normalizeDuellStats(body);
  } finally {
    clearTimeout(timer);
  }
}
