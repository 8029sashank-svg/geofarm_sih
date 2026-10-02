import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

const PRIORITY_STYLES = {
  HIGH: 'bg-red-50 text-red-700 border-red-200',
  MEDIUM: 'bg-orange-50 text-orange-700 border-orange-200',
  LOW: 'bg-gray-100 text-gray-600 border-gray-300',
};

export function PriorityChip({ level, size = 'md' }) {
  const { t } = useLanguage();
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5';
  const labelMap = {
    HIGH: t('chipPriorityHigh') || t('priorityHigh'),
    MEDIUM: t('chipPriorityMedium') || t('priorityMedium'),
    LOW: t('chipPriorityLow') || t('priorityLow'),
  };
  const label = labelMap[level] || level;
  return (
    <span className={`inline-flex items-center font-bold uppercase tracking-wide rounded border ${PRIORITY_STYLES[level] || PRIORITY_STYLES.LOW} ${sizeClass}`}>
      {label}
    </span>
  );
}

const MISSION_STATUS_STYLES = {
  Pending: 'bg-gray-100 text-gray-700 border-gray-300',
  Accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  'En Route': 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-300',
  Submitted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Under Review': 'bg-purple-50 text-purple-700 border-purple-200',
  'Awaiting Officer Review': 'bg-purple-50 text-purple-700 border-purple-200',
  Verified: 'bg-green-50 text-green-700 border-green-200',
  'Needs Revisit': 'bg-red-50 text-red-700 border-red-200',
  Completed: 'bg-green-50 text-green-700 border-green-200',
};

export function MissionStatusChip({ status, size = 'md' }) {
  const { t } = useLanguage();
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5';
  const statusMap = {
    'Pending': t('chipPending') || t('statusPending'),
    'Accepted': t('chipAccepted') || t('statusAccepted'),
    'En Route': t('chipEnRoute') || t('statusEnRoute'),
    'In Progress': t('chipInProgress') || t('statusInProgress'),
    'Submitted': t('chipSubmitted') || t('statusSubmitted'),
    'Under Review': t('chipUnderReview') || t('statusUnderReview'),
    'Awaiting Officer Review': t('chipAwaitingReview') || t('statusAwaitingReview'),
    'Verified': t('chipVerified') || t('statusVerified'),
    'Needs Revisit': t('chipNeedsRevisit') || t('statusNeedsRevisit'),
    'Completed': t('chipCompleted') || t('statusCompleted'),
  };
  const label = statusMap[status] || status;
  return (
    <span className={`inline-flex items-center font-semibold rounded border ${MISSION_STATUS_STYLES[status] || MISSION_STATUS_STYLES.Pending} ${sizeClass}`}>
      {label}
    </span>
  );
}

const RISK_STYLES = {
  LOW: 'bg-green-50 text-green-700 border-green-300',
  MODERATE: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  MEDIUM: 'bg-orange-50 text-orange-700 border-orange-300',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-300',
  SEVERE: 'bg-red-50 text-red-700 border-red-300',
  CRITICAL: 'bg-red-700 text-white border-red-900',
};

export function RiskChip({ level, size = 'md' }) {
  const { t } = useLanguage();
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2.5 py-1';
  const riskMap = {
    LOW: t('chipRiskLow') || t('severityLow'),
    MODERATE: t('chipRiskModerate') || t('severityModerate'),
    MEDIUM: t('chipRiskMedium') || t('severityMedium'),
    HIGH: t('chipRiskHigh') || t('severityHigh'),
    SEVERE: t('chipRiskSevere') || t('severitySevere'),
    CRITICAL: t('chipRiskCritical') || t('severityCritical'),
  };
  const label = riskMap[level] || level;
  return (
    <span className={`inline-flex items-center font-bold uppercase tracking-wide rounded border ${RISK_STYLES[level] || RISK_STYLES.LOW} ${sizeClass}`}>
      {label}
    </span>
  );
}

// Distance band labels for nearby/regional case presentation.
// Bands: 0–20 km Nearby, 20–75 km Regional. Distances themselves
// come from mock data and are never altered here.
export function distanceBand(km, t) {
  if (km == null) return null;
  if (km < 20) return t ? t('bandNearby') : 'Nearby';
  if (km < 75) return t ? t('bandRegional') : 'Regional';
  return t ? t('bandDistant') : 'Distant';
}
