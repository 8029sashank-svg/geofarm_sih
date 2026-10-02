import React from 'react';
import {
  MapPin, ArrowRight, Wifi, WifiOff, CheckCircle2, ChevronRight,
  BookOpen, ClipboardCheck, Bell, Navigation2, AlertTriangle,
  ClipboardList, Play, RotateCcw, CloudOff,
} from 'lucide-react';
import { useScout } from '../ScoutContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { PriorityChip, MissionStatusChip, distanceBand } from './Chips.jsx';
import AgriImage from './AgriImage.jsx';
import { MISSION_STATUS } from '../mockData.js';
import { NEARBY_CASES } from '../mockData.js';
import { isWithinOperatingRadius } from '../config.js';

/**
 * Student Dashboard — "What do I need to do today?"
 */
export default function Dashboard({ onNavigate, onOpenMission, onStartVisit }) {
  const { scout, missions, reports, isOnline, syncQueue, notifications } = useScout();
  const { t } = useLanguage();

  // ── Derived state ─────────────────────────────────────────────
  const pending    = missions.filter((m) => m.status === MISSION_STATUS.PENDING).length;
  const accepted   = missions.filter((m) => m.status === MISSION_STATUS.ACCEPTED).length;
  const inProgress = missions.filter((m) => m.status === MISSION_STATUS.IN_PROGRESS).length;
  const completed  = missions.filter(
    (m) =>
      m.status === MISSION_STATUS.COMPLETED ||
      m.status === MISSION_STATUS.UNDER_REVIEW ||
      m.status === MISSION_STATUS.VERIFIED,
  ).length;

  // Reports the officer sent back for a revisit (only ones with a live mission).
  const revisitReports = reports.filter(
    (r) => r.status === 'Needs Revisit' && r.missionId && missions.some((m) => m.id === r.missionId),
  );

  // Active mission: prefer IN_PROGRESS, then highest-priority ACCEPTED/PENDING
  const activeMission =
    missions.find((m) => m.status === MISSION_STATUS.IN_PROGRESS) ||
    missions
      .filter((m) => m.status === MISSION_STATUS.ACCEPTED || m.status === MISSION_STATUS.PENDING)
      .sort((a, b) => {
        const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3);
      })[0] ||
    null;

  const activeMissionCase = activeMission
    ? NEARBY_CASES.find((c) => c.id === activeMission.id)
    : null;

  // Nearby cases — up to 4, sorted by distance
  const nearbySorted = [...NEARBY_CASES].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 4);

  // Recent activity feed
  const activity = [
    ...reports.slice(0, 2).map((r) => ({
      icon: CheckCircle2,
      color: 'text-green-700 bg-green-50 border-green-200',
      title: `${r.finding}`,
      sub: `${r.field} • ${r.submittedAt}`,
    })),
    ...notifications.slice(0, 3).map((n) => ({
      icon: Bell,
      color: 'text-[#00592D] bg-[#00592D]/8 border-[#00592D]/20',
      title: n.title,
      sub: n.time,
    })),
  ].slice(0, 5);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t('greetingMorning') : hour < 17 ? t('greetingAfternoon') : t('greetingEvening');

  return (
    <div className="space-y-5">

      {/* ── Welcome ── */}
      <div className="bg-white border border-[#D9E0D9] rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8AAA8A]">
            {greeting}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-[#12200F] mt-0.5">
            {scout.name.split(' ')[0]}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[12.5px] text-[#5A7A5A]">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {scout.registeredLocation || `${scout.district}, Maharashtra`}
            </span>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 text-[12px] font-bold px-3 py-1.5 rounded-lg border shrink-0 ${
            isOnline
              ? 'text-[#1E6B3C] bg-[#EAF6EE] border-[#CFE8D6]'
              : 'text-[#9A5B12] bg-[#FBF1E5] border-[#F0DBBE]'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#2E9B57]' : 'bg-[#D98A2B]'}`} />
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          {isOnline ? t('online') : `${t('offline')} · ${syncQueue.length} ${t('offlineWaiting')}`}
        </div>
      </div>

      {/* ── 1. ACTIVE / HIGH-PRIORITY MISSION (dominant) ── */}
      {activeMission ? (
        <ActiveMissionCard
          mission={activeMission}
          linkedCase={activeMissionCase}
          onOpenMission={onOpenMission}
          onNavigate={onNavigate}
        />
      ) : (
        <div className="bg-white border border-[#D9E0D9] rounded-xl p-6 text-center">
          <div className="w-11 h-11 rounded-full bg-[#EAF6EE] border border-[#CFE8D6] flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={22} className="text-[#1E6B3C]" />
          </div>
          <p className="text-[14px] font-bold text-[#12200F]">{t('allCaughtUp')}</p>
          <p className="text-[12px] text-[#6A8A6A] mt-1">{t('noActiveMissions')}</p>
          <button
            onClick={() => onNavigate('nearby')}
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#00592D] border border-[#00592D]/30 rounded-lg px-4 py-2 hover:bg-[#00592D]/5 transition-colors"
          >
            {t('browseCases')} <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* ── 1b. OFFICER REQUESTED A REVISIT ── */}
      {revisitReports.length > 0 && (
        <div className="rounded-xl border border-[#E6B8B3] bg-[#FBEEEC] p-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#A02E24] flex items-center gap-1.5">
            <RotateCcw size={13} /> {t('revisitAlertTitle')}
          </h3>
          {revisitReports.slice(0, 2).map((r) => (
            <div key={r.id} className="bg-white border border-[#E6B8B3] rounded-lg p-3">
              <p className="text-[11px] font-bold text-[#6A6A6A]">{r.id} · {r.field} · {r.crop}</p>
              <p className="text-[12px] text-[#A02E24] mt-1 line-clamp-2">{r.officerComment || t('officerRevisitGeneric')}</p>
              <div className="mt-2.5 flex gap-2">
                {onStartVisit && (
                  <button
                    onClick={() => onStartVisit(r.missionId)}
                    className="flex-1 bg-[#B3261E] hover:bg-[#961F19] text-white text-[12px] font-bold py-2 rounded-lg transition-colors"
                  >
                    {t('startRevisit')}
                  </button>
                )}
                <button
                  onClick={() => onOpenMission(r.missionId)}
                  className="px-3 py-2 bg-white border border-[#E6B8B3] text-[#A02E24] text-[12px] font-bold rounded-lg hover:bg-[#FBEEEC] transition-colors"
                >
                  {t('details')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 2. MY ASSIGNMENTS SUMMARY ── */}
      <div className="bg-white border border-[#D9E0D9] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EBF0EB]">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#7C8C7C] flex items-center gap-1.5">
            <ClipboardList size={13} className="text-[#00592D]" /> {t('myAssignmentsSummary')}
          </h3>
          <LinkBtn label={t('viewAll')} onClick={() => onNavigate('assignments')} />
        </div>
        <div className="grid grid-cols-4 divide-x divide-[#EBF0EB]">
          <StatTile value={pending}    label={t('filterPending')}    onClick={() => onNavigate('assignments')} />
          <StatTile value={accepted}   label={t('filterAccepted')}   onClick={() => onNavigate('assignments')} />
          <StatTile value={inProgress} label={t('filterInProgress')} onClick={() => onNavigate('assignments')} highlight />
          <StatTile value={completed}  label={t('statusCompleted')}  onClick={() => onNavigate('assignments')} />
        </div>
      </div>

      {/* ── 3. NEARBY CASES ── */}
      <div className="bg-white border border-[#D9E0D9] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EBF0EB]">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#7C8C7C] flex items-center gap-1.5">
            <MapPin size={13} className="text-[#00592D]" /> {t('nearbyCasesTitle')} · {NEARBY_CASES.length}
          </h3>
          <LinkBtn label={t('viewAll')} onClick={() => onNavigate('nearby')} />
        </div>
        {nearbySorted.length > 0 ? (
          <div className="divide-y divide-[#EBF0EB]">
            {nearbySorted.map((c) => (
              <button
                key={c.id}
                onClick={() => onNavigate('nearby')}
                className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-[#F7FAF7] transition-colors"
              >
                <AgriImage
                  src={c.image}
                  alt={`${c.issue} — field photo`}
                  label="No image"
                  className="w-11 h-11 rounded-lg shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-[#12200F] truncate">{c.issue}</p>
                  <p className="text-[11px] text-[#6A8A6A] truncate">{c.farmer} · {c.village}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <PriorityChip level={c.priority} size="sm" />
                    <span className="text-[11px] text-[#9AAA9A]">
                      {c.distanceKm} km · {distanceBand(c.distanceKm, t)}
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#C0CCC0] shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon={MapPin} text={t('nearbyCasesTitle')} />
        )}
      </div>

      {/* ── 4. REPORT / SYNC STATUS ── */}
      <div className={`rounded-xl border px-4 py-3 flex items-center gap-2.5 text-[13px] font-semibold ${
        syncQueue.length === 0
          ? 'bg-[#EAF6EE] border-[#CFE8D6] text-[#1E6B3C]'
          : 'bg-[#FBF1E5] border-[#F0DBBE] text-[#9A5B12]'
      }`}>
        {syncQueue.length === 0 ? <CheckCircle2 size={16} /> : <CloudOff size={16} />}
        {syncQueue.length === 0
          ? `${t('syncedAll')} · ${reports.length} ${t('statusSubmitted').toLowerCase()}`
          : `${syncQueue.length} ${t('syncWaiting')}`}
        {reports.length > 0 && (
          <button
            onClick={() => onNavigate('visits')}
            className="ml-auto text-[11px] font-bold underline underline-offset-2"
          >
            {t('viewReports')}
          </button>
        )}
      </div>

      {/* ── 5. RECENT ACTIVITY + QUICK ACTIONS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#D9E0D9] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#EBF0EB]">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#7C8C7C] flex items-center gap-1.5">
              <Bell size={13} className="text-[#00592D]" /> {t('recentActivity')}
            </h3>
            <LinkBtn label={t('reports')} onClick={() => onNavigate('visits')} />
          </div>
          {activity.length > 0 ? (
            <div className="divide-y divide-[#EBF0EB]">
              {activity.map((a, i) => (
                <div key={`${a.title}-${i}`} className="flex gap-3 px-4 py-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${a.color}`}>
                    <a.icon size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-[#12200F] truncate">{a.title}</p>
                    <p className="text-[11px] text-[#9AAA9A] truncate">{a.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Bell} text={t('recentActivity')} />
          )}
        </div>

        <div className="bg-white border border-[#D9E0D9] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#EBF0EB]">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#7C8C7C]">
              {t('quickActions')}
            </h3>
          </div>
          <div className="divide-y divide-[#EBF0EB]">
            <QuickAction label={t('quickActionNearby')}  icon={MapPin}         onClick={() => onNavigate('nearby')} />
            <QuickAction label={t('quickActionVisit')}   icon={ClipboardCheck} onClick={() => onNavigate('assignments')} />
            <QuickAction label={t('quickActionLibrary')} icon={BookOpen}       onClick={() => onNavigate('library')} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Active Mission Card ───────────────────────────────────────────────────────
function ActiveMissionCard({ mission, linkedCase, onOpenMission, onNavigate }) {
  const { t } = useLanguage();
  const isInProgress = mission.status === MISSION_STATUS.IN_PROGRESS;
  const canVisit =
    mission.status === MISSION_STATUS.ACCEPTED || mission.status === MISSION_STATUS.IN_PROGRESS;
  const inRadius = isWithinOperatingRadius(mission.distanceKm);

  const [hasDraft, setHasDraft] = React.useState(false);
  React.useEffect(() => {
    setHasDraft(!!localStorage.getItem(`geofarm_draft_${mission.id}`));
  }, [mission.id]);

  const priorityAccent = {
    HIGH:   'border-l-4 border-l-red-500',
    MEDIUM: 'border-l-4 border-l-amber-400',
    LOW:    'border-l-4 border-l-green-400',
  }[mission.priority] || '';

  const priorityBadgeClass = {
    HIGH:   'bg-red-100 text-red-700 border-red-200',
    MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
    LOW:    'bg-green-100 text-green-700 border-green-200',
  }[mission.priority] || 'bg-gray-100 text-gray-600 border-gray-200';

  const priorityLabel =
    mission.priority === 'HIGH'
      ? t('priorityHigh')
      : mission.priority === 'MEDIUM'
        ? t('priorityMedium')
        : t('priorityLow');

  return (
    <div className={`bg-white border border-[#D9E0D9] rounded-xl overflow-hidden ${priorityAccent}`}>
      {/* Header strip */}
      <div className="bg-[#00592D] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isInProgress ? (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {t('inProgress')}
            </span>
          ) : hasDraft ? (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-300">
              <ClipboardList size={11} />
              {t('draftSaved')}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-300">
              <AlertTriangle size={11} />
              {t('activeMission')}
            </span>
          )}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priorityBadgeClass}`}>
          {priorityLabel} {t('priority')}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {linkedCase?.image && (
            <AgriImage
              src={linkedCase.image}
              alt={`${mission.title} — field photo`}
              label="No image"
              className="w-20 h-20 rounded-lg shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-[#8AAA8A] uppercase tracking-wider">{t('missionNo')} {mission.id}</p>
            <h2 className="text-[15px] font-bold text-[#12200F] mt-0.5 leading-snug">
              {mission.title}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[12px] text-[#5A7A5A]">
              <span>
                <span className="font-semibold text-[#3A5A3A]">{t('crop')}:</span> {mission.crop}
              </span>
              {linkedCase?.issue && (
                <span>
                  <span className="font-semibold text-[#3A5A3A]">{t('issue')}:</span> {linkedCase.issue}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[12px] text-[#6A8A6A]">
              <span className="flex items-center gap-1">
                <MapPin size={11} className="text-[#9AAA9A]" /> {mission.location}
              </span>
              <span className="flex items-center gap-1">
                <Navigation2 size={11} className="text-[#9AAA9A]" />
                {mission.distanceKm} km · {distanceBand(mission.distanceKm, t)}
              </span>
            </div>
          </div>
          <MissionStatusChip status={mission.status} size="sm" />
        </div>

        {/* CTA */}
        <div className="mt-4 flex gap-2">
          {canVisit && inRadius && (
            <button
              onClick={() => onOpenMission(mission.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#00592D] hover:bg-[#004825] text-white text-[13px] font-bold py-2.5 rounded-lg transition-colors"
            >
              {isInProgress ? <RotateCcw size={14} /> : <Play size={14} />}
              {isInProgress ? t('continueFieldVisit') : t('startFieldVisit')}
            </button>
          )}
          {canVisit && !inRadius && (
            <div className="flex-1 bg-red-50 border border-red-200 text-red-700 text-[12px] font-semibold py-2.5 rounded-lg text-center">
              {t('outsideRadius')}
            </div>
          )}
          <button
            onClick={() => onOpenMission(mission.id)}
            className="px-4 py-2.5 bg-white border border-[#D9E0D9] text-[#12200F] text-[13px] font-bold rounded-lg hover:border-[#00592D]/40 transition-colors"
          >
            {t('details')}
          </button>
        </div>

        {!canVisit && (
          <button
            onClick={() => onNavigate('assignments')}
            className="mt-2 w-full text-[12px] font-bold text-[#00592D] border border-[#00592D]/20 rounded-lg py-2 hover:bg-[#00592D]/5 transition-colors"
          >
            {t('viewAllAssignments')}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatTile({ value, label, onClick, highlight }) {
  return (
    <button
      onClick={onClick}
      className={`py-4 px-2 text-center transition-colors hover:bg-[#F7FAF7] ${
        highlight ? 'border-t-2 border-t-[#00592D]' : ''
      }`}
    >
      <p className={`text-[22px] font-bold leading-none ${highlight ? 'text-[#00592D]' : 'text-[#12200F]'}`}>
        {value}
      </p>
      <p className={`text-[10px] font-semibold mt-1 leading-tight ${highlight ? 'text-[#00592D]' : 'text-[#9AAA9A]'}`}>
        {label}
      </p>
    </button>
  );
}

function QuickAction({ label, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 hover:bg-[#F7FAF7] transition-colors text-left w-full"
    >
      <Icon size={16} className="text-[#00592D] shrink-0" />
      <span className="text-[13px] font-semibold text-[#12200F]">{label}</span>
      <ChevronRight size={14} className="text-[#C0CCC0] ml-auto shrink-0" />
    </button>
  );
}

function LinkBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-bold text-[#00592D] flex items-center gap-0.5 hover:underline underline-offset-2"
    >
      {label} <ChevronRight size={12} />
    </button>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
      <div className="w-9 h-9 rounded-full bg-[#F4F7F4] border border-[#E5EBE5] flex items-center justify-center">
        <Icon size={16} className="text-[#B9C7B9]" />
      </div>
      <p className="text-[12px] text-[#9AAA9A] font-medium">No {text.toLowerCase()} yet</p>
    </div>
  );
}