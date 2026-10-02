import React, { useMemo, useState } from 'react';
import { Search, MapPin, Clock, SearchX, ArrowRight } from 'lucide-react';
import { PriorityChip, distanceBand } from './Chips.jsx';
import AgriImage from './AgriImage.jsx';
import { NEARBY_CASES, NEARBY_CASE_DETAILS, MISSION_STATUS } from '../mockData.js';
import { useScout } from '../ScoutContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

const FILTERS = ['All', 'High Risk', 'Medium', 'Low', 'Nearby', 'Regional'];

/**
 * Nearby Agricultural Cases — premium card grid (presentation only).
 */
export default function NearbyCases({ onOpenCase, acceptedIds = {} }) {
  const { missions } = useScout();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  // Derive per-case progress from the shared mission status
  const caseProgress = (id) => {
    const mission = missions.find((m) => m.id === id);
    if (
      mission &&
      (mission.status === MISSION_STATUS.COMPLETED ||
        mission.status === MISSION_STATUS.UNDER_REVIEW ||
        mission.status === MISSION_STATUS.VERIFIED)
    ) {
      return 'Completed';
    }
    if (acceptedIds[id]) return 'Assigned';
    return null;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NEARBY_CASES.filter((c) => {
      if (filter === 'Nearby' && c.distanceKm >= 20) return false;
      if (filter === 'Regional' && (c.distanceKm < 20 || c.distanceKm >= 75)) return false;
      if (filter === 'High Risk' && c.priority !== 'HIGH') return false;
      if (filter === 'Medium' && c.priority !== 'MEDIUM') return false;
      if (filter === 'Low' && c.priority !== 'LOW') return false;
      if (!q) return true;
      const detail = NEARBY_CASE_DETAILS[c.id];
      return [c.farmer, c.crop, c.issue, c.village, detail?.problem, detail?.aiDiagnosis]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [query, filter]);

  const filterLabelMap = {
    All: t('filterAll'),
    'High Risk': t('filterHighRisk'),
    Medium: t('filterMedium'),
    Low: t('filterLow'),
    Nearby: t('filterNearby'),
    Regional: t('filterRegional'),
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0C3B2E]">{t('nearbyTitle')}</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">{t('nearbySubtitle')}</p>
      </div>

      <div className="flex items-center gap-1.5 text-[13px] text-gray-600 bg-white border border-[#e4eae4] rounded-2xl px-3 py-2.5">
        <MapPin size={14} className="text-[#0C3B2E] shrink-0" />
        <span className="font-semibold">📍 Dindori / Nashik region</span>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchCasesPlaceholder')}
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#e4eae4] rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]/20 focus:border-[#0C3B2E]/30 placeholder:text-gray-400"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              filter === f ? 'bg-[#0C3B2E] text-white border-[#0C3B2E]' : 'bg-white text-gray-500 border-[#e4eae4]'
            }`}
          >
            {filterLabelMap[f] || f}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const detail = NEARBY_CASE_DETAILS[c.id];
          const progress = caseProgress(c.id);
          const imgSrc = c.image || detail?.image || null;
          const variety = c.crop === 'Grapes' ? `${c.crop} · Thompson Seedless` : c.crop;
          return (
            <div key={c.id} className="bg-white border border-[#e4eae4] rounded-2xl shadow-[0_1px_3px_rgba(12,59,46,0.06)] overflow-hidden flex flex-col">
              <div className="relative">
                <AgriImage
                  src={imgSrc}
                  alt={`${c.issue} — field photo`}
                  label={t('fieldImageUnavailable') || 'Field image not available'}
                  className="w-full h-36"
                />
                <span className="absolute top-2 left-2 shadow">
                  <PriorityChip level={c.priority} />
                </span>
                {progress === 'Completed' && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-white bg-green-600 rounded px-1.5 py-0.5 shadow">
                    {t('statusCompleted')}
                  </span>
                )}
                {progress === 'Assigned' && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-green-800 bg-green-50 border border-green-200 rounded px-1.5 py-0.5 shadow">
                    {t('assigned')}
                  </span>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <p className="text-[11px] font-bold text-gray-400">Case #{c.id}</p>
                <h3 className="text-[15px] font-bold text-gray-900 mt-0.5">{detail?.problem || c.issue}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{variety}</p>
                <p className="text-[13px] font-semibold text-gray-800 mt-2">{c.farmer}</p>
                <p className="text-xs text-gray-500">{c.village}</p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-2">
                  <span className="flex items-center gap-1"><MapPin size={13} /> {c.distanceKm} km · {distanceBand(c.distanceKm, t)}</span>
                  <span className="flex items-center gap-1"><Clock size={13} /> {c.reportedAt}</span>
                </div>

                {detail && (
                  <p className="text-xs text-gray-500 mt-2">
                    {t('aiConfidenceLabel') || 'AI confidence'}: <span className="font-bold text-[#0C3B2E]">{detail.aiConfidence}%</span>
                  </p>
                )}

                <button
                  onClick={() => onOpenCase(c.id)}
                  className="mt-3 w-full bg-[#0C3B2E] hover:bg-[#12503d] text-white text-sm font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  {t('viewCaseDetails')} <ArrowRight size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white border border-[#e4eae4] rounded-2xl py-12 px-6 text-center">
          <SearchX size={28} className="mx-auto text-gray-300" />
          <p className="text-sm font-bold text-gray-800 mt-3">
            {filter === 'All' ? t('noCasesFound') : t('noCasesFound')}
          </p>
          <p className="text-xs text-gray-500 mt-1">{t('tryAnotherFilter')}</p>
        </div>
      )}
    </div>
  );
}
