/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, MessageSquare, RefreshCw, Swords, Users } from 'lucide-react';
import type { ParkbankDuellFeedback, ParkbankDuellStats } from '../types/admin';

interface ParkbankDuellAdminProps {
  adminPin: string;
  isActive: boolean;
  showToast: (msg: string) => void;
}

const emptyStats: ParkbankDuellStats = {
  registrierte_spieler: 0,
  gaeste_gesamt: 0,
  aktuell_online: 0,
  aktive_duelle: 0,
  duelle_heute: 0,
  duelle_insgesamt: 0,
  feedbacks: []
};

function schwierigkeitLabel(value: string | null): string {
  if (value === 'zu_leicht') return 'Zu leicht';
  if (value === 'passt') return 'Passt';
  if (value === 'zu_schwer') return 'Zu schwer';
  if (!value) return '—';
  return value;
}

function formatBerlinTime(iso: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
}

function SpassSterne({ value }: { value: number | null }) {
  if (value === null) return <span className="text-neutral-500">—</span>;
  const clamped = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className="font-bold text-[#e8b568]" title={`${clamped}/5`}>
      {'★'.repeat(clamped)}
      <span className="text-neutral-600">{'★'.repeat(5 - clamped)}</span>
      <span className="ml-1 text-neutral-400 text-[11px] font-medium">{clamped}/5</span>
    </span>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon
}: {
  label: string;
  value: number;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
      <div className="flex items-center justify-between text-neutral-400 mb-2">
        <span className="text-xs font-bold uppercase">{label}</span>
        {icon}
      </div>
      <div className="text-2xl sm:text-3xl font-black text-white">{value}</div>
      {hint ? <div className="text-[11px] text-neutral-400 mt-1">{hint}</div> : null}
    </div>
  );
}

function FeedbackCard({ item }: { item: ParkbankDuellFeedback }) {
  const isUmfrage = item.kind === 'umfrage';
  return (
    <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
            isUmfrage
              ? 'bg-[#6d3c17] text-[#e8b568] border border-[#c89346]'
              : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
          }`}
        >
          {isUmfrage ? 'Umfrage' : 'Feedback'}
        </span>
        <span className="text-[11px] text-neutral-400">{formatBerlinTime(item.created_at)}</span>
      </div>

      {isUmfrage ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-neutral-500 font-bold uppercase text-[10px] mb-0.5">Spaß</div>
            <SpassSterne value={item.spass} />
          </div>
          <div>
            <div className="text-neutral-500 font-bold uppercase text-[10px] mb-0.5">Schwierigkeit</div>
            <div className="text-white font-bold">{schwierigkeitLabel(item.schwierigkeit)}</div>
          </div>
          <div>
            <div className="text-neutral-500 font-bold uppercase text-[10px] mb-0.5">Probleme</div>
            <div className="text-white font-bold">
              {item.probleme === null ? '—' : item.probleme ? 'Ja' : 'Nein'}
            </div>
          </div>
        </div>
      ) : null}

      {item.comment ? (
        <p className="text-sm text-neutral-200 whitespace-pre-wrap break-words">{item.comment}</p>
      ) : (
        <p className="text-xs text-neutral-500 italic">Kein Kommentar</p>
      )}
    </div>
  );
}

export const ParkbankDuellAdmin: React.FC<ParkbankDuellAdminProps> = ({
  adminPin,
  isActive,
  showToast
}) => {
  const [stats, setStats] = useState<ParkbankDuellStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin-parkbank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: adminPin })
      });
      const data: unknown = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg =
          typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof (data as { error: unknown }).error === 'string'
            ? (data as { error: string }).error
            : 'Parkbank-Duell-Stats konnten nicht geladen werden.';
        setError(msg);
        setStats(null);
        return;
      }
      const payload = data as ParkbankDuellStats;
      setStats({
        ...emptyStats,
        ...payload,
        feedbacks: Array.isArray(payload.feedbacks) ? payload.feedbacks : []
      });
    } catch {
      setError('Parkbank-Duell-Stats konnten nicht geladen werden.');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [adminPin]);

  useEffect(() => {
    if (!isActive) return;
    void load();
  }, [isActive, load]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Swords className="w-4 h-4 text-[#e8b568]" />
            <span>Parkbank-Duell – Live-Kennzahlen</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Nur lesende Übersicht aus der Duell-Datenbank. Keine Spielzüge, keine Spielerdetails.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void load().then(() => showToast('Parkbank-Duell-Stats aktualisiert'));
          }}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-[#6d3c17] hover:bg-[#7d441a] disabled:opacity-60 text-white font-bold text-xs sm:text-sm border border-[#c89346] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Aktualisieren</span>
        </button>
      </div>

      {loading && !stats ? (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-sm text-neutral-300">
          Kennzahlen werden geladen …
        </div>
      ) : null}

      {error ? (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800 text-red-200 text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Fehler beim Laden</div>
            <div className="text-xs mt-0.5 text-red-200/90">{error}</div>
          </div>
        </div>
      ) : null}

      {stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <MetricCard
              label="Registrierte Spieler"
              value={stats.registrierte_spieler}
              hint="Mit E-Mail verknüpft (keine Gäste)"
              icon={<Users className="w-4 h-4 text-[#e8b568]" />}
            />
            <MetricCard
              label="Gäste gesamt"
              value={stats.gaeste_gesamt}
              hint="Anonyme Konten ohne E-Mail"
              icon={<Users className="w-4 h-4 text-[#e8b568]" />}
            />
            <MetricCard
              label="Aktuell online"
              value={stats.aktuell_online}
              hint={stats.online_definition || 'Queue ≤ 6 s oder aktives Match'}
              icon={<Users className="w-4 h-4 text-[#e8b568]" />}
            />
            <MetricCard
              label="Aktive Duelle"
              value={stats.aktive_duelle}
              icon={<Swords className="w-4 h-4 text-[#e8b568]" />}
            />
            <MetricCard
              label="Duelle heute"
              value={stats.duelle_heute}
              hint="Seit Mitternacht Europe/Berlin"
              icon={<Swords className="w-4 h-4 text-[#e8b568]" />}
            />
            <MetricCard
              label="Duelle insgesamt"
              value={stats.duelle_insgesamt}
              icon={<Swords className="w-4 h-4 text-[#e8b568]" />}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#e8b568]" />
              <h4 className="font-bold text-white text-sm">
                Neueste Feedbacks ({stats.feedbacks.length}
                {stats.feedbacks.length >= 30 ? ', max. 30' : ''})
              </h4>
            </div>
            {stats.feedbacks.length === 0 ? (
              <div className="p-6 rounded-2xl bg-neutral-900 border border-dashed border-neutral-800 text-center text-sm text-neutral-400">
                Noch kein Feedback vorhanden.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stats.feedbacks.map((item, idx) => (
                  <FeedbackCard key={`${item.created_at}-${item.kind}-${idx}`} item={item} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
