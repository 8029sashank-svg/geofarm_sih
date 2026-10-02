import React, { useMemo, useState } from 'react';
import { ChevronRight, Inbox, ClipboardCheck } from 'lucide-react';
import { useScout } from '../ScoutContext.jsx';
import { RiskChip, MissionStatusChip } from './Chips.jsx';

/**
 * Agriculture Officer — Report Review Queue
 *
 * Operates directly on the SAME `reports` array the Student Field Scout
 * portal writes to via ScoutContext.submitReport() / submitOfficerReview().
 * There is no separate officer report database — this is intentionally
 * the same shared mock/local state, which is what keeps "1 report
 * awaiting review" on the officer side and "Awaiting Officer Review" on
 * the student side pointing at the same underlying record.
 *
 * Deliberately not built on AlertQueueContext — that context tracks a
 * different concept (EdgeAIScanner leaf-scan flags, telemetry/pest
 * threshold alerts), unrelated to student field-visit reports.
 */
const TABS = [
  { key: 'awaiting', label: 'Awaiting Review', statuses: ['Awaiting Officer Review', 'Under Review'] },
  { key: 'revisit', label: 'Needs Revisit', statuses: ['Needs Revisit'] },
  { key: 'verified', label: 'Verified', statuses: ['Verified'] },
  { key: 'all', label: 'All Reports', statuses: null },
];

export default function OfficerQueue({ onOpenReport }) {
  const { reports } = useScout();
  const [tab, setTab] = useState('awaiting');

  const counts = useMemo(() => {
    const c = {};
    TABS.forEach((t) => {
      c[t.key] = t.statuses ? reports.filter((r) => t.statuses.includes(r.status)).length : reports.length;
    });
    return c;
  }, [reports]);

  const activeTab = TABS.find((t) => t.key === tab) || TABS[0];

  const visibleReports = useMemo(() => {
    const filtered = activeTab.statuses ? reports.filter((r) => activeTab.statuses.includes(r.status)) : reports;
    // Awaiting-review reports always surface first, regardless of tab —
    // that queue is the officer's primary job.
    return [...filtered].sort((a, b) => {
      const aPriority = a.status === 'Awaiting Officer Review' || a.status === 'Under Review' ? 0 : 1;
      const bPriority = b.status === 'Awaiting Officer Review' || b.status === 'Under Review' ? 0 : 1;
      return aPriority - bPriority;
    });
  }, [reports, activeTab]);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gov-navy">Officer Report Review</h1>
        <p className="text-sm text-gov-textSec mt-0.5">
          {counts.awaiting > 0
            ? `${counts.awaiting} report${counts.awaiting === 1 ? '' : 's'} awaiting review`
            : 'No reports currently awaiting review'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-left border rounded-lg px-3 py-2.5 transition-colors ${
              tab === t.key ? 'border-gov-blue bg-gov-blue/5' : 'border-gov-border bg-white hover:border-gov-blue/40'
            }`}
          >
            <p className={`text-lg font-bold leading-none ${tab === t.key ? 'text-gov-blue' : 'text-gov-navy'}`}>{counts[t.key]}</p>
            <p className="text-[11px] font-bold text-gov-textSec uppercase tracking-wide mt-1">{t.label}</p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visibleReports.map((r) => (
          <button
            key={r.id}
            onClick={() => onOpenReport(r.id)}
            className="w-full text-left bg-white border border-gov-border rounded-xl p-4 shadow-card hover:border-gov-blue transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-gov-textSec">{r.id}</p>
                <h3 className="text-sm font-bold text-gov-navy mt-0.5">{r.finding}</h3>
                <p className="text-xs text-gov-textSec mt-0.5">
                  {r.farmer ? `${r.farmer} • ` : ''}{r.field} • {r.crop}
                </p>
                <p className="text-[11px] text-gov-textSec mt-0.5">Submitted {r.submittedAt}</p>
              </div>
              <ChevronRight size={16} className="text-gov-textSec shrink-0 mt-1" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <RiskChip level={r.risk} size="sm" />
              <MissionStatusChip status={r.status} size="sm" />
              {r.aiConfidence != null && (
                <span className="text-[11px] text-gov-textSec ml-auto">AI confidence {r.aiConfidence}%</span>
              )}
            </div>
          </button>
        ))}

        {visibleReports.length === 0 && (
          <div className="bg-white border border-gov-border rounded-xl py-12 px-6 text-center">
            <Inbox size={26} className="mx-auto text-gray-300" />
            <p className="text-sm font-bold text-gov-navy mt-3">No reports in this view</p>
            <p className="text-xs text-gov-textSec mt-1">Try another tab.</p>
          </div>
        )}
      </div>

      <p className="text-[11px] text-gov-textSec bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 flex items-start gap-2">
        <ClipboardCheck size={13} className="shrink-0 mt-0.5" />
        Demo review queue — reports are shared in-app state (no real backend sync). Verifying or requesting a revisit updates the same report the student sees in Field Visit History.
      </p>
    </div>
  );
}
