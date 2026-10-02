import React from 'react';
import { ArrowLeft, Droplets, Leaf, Users, Activity, CheckSquare, MapPin, ArrowRight, Target, AlertTriangle, Navigation, User, Phone, Calendar, Clock } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { useScout } from '../ScoutContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { PriorityChip, MissionStatusChip } from './Chips.jsx';
import { MISSION_STATUS } from '../mockData.js';
import { STUDENT_OPERATING_RADIUS_KM, isWithinOperatingRadius } from '../config.js';

export default function MissionDetail({ missionId, onBack, onStartVisit }) {
  const { missions, reports, updateMissionStatus, farmerAvailabilities, updateFarmerAvailability } = useScout();
  const { t } = useLanguage();
  const mission = missions.find((m) => m.id === missionId);

  const [hasDraft, setHasDraft] = React.useState(false);
  React.useEffect(() => {
    setHasDraft(!!localStorage.getItem(`geofarm_draft_${missionId}`));
  }, [missionId]);

  if (!mission) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gov-textSec">
          <ArrowLeft size={16} /> {t('backToMissions')}
        </button>
        <p className="text-sm text-gov-textSec">{t('missionNotFound')}</p>
      </div>
    );
  }

  const inProgress = mission.status === MISSION_STATUS.IN_PROGRESS;
  // Officer sent this mission's report back — show the feedback and label the CTA accordingly.
  const revisitReport = reports.find((r) => r.missionId === mission.id && r.status === 'Needs Revisit');
  const isRevisit = !!revisitReport;
  const withinRadius = isWithinOperatingRadius(mission.distanceKm);

  // Mirrors the unified Field Visit workflow's steps — localized on render
  const objectiveChecklist = [
    t('objConfirmLocation'),
    t('objRecordCropStage'),
    t('objRecordSymptoms'),
    t('objCaptureFieldEvidence'),
    t('objCaptureCloseUp'),
    ...(mission.trapId ? [t('objRecordSmartTrap')] : []),
    t('objEstimateAreaSpread'),
    t('objAddFieldNotes'),
  ];

  const handleStart = () => {
    updateMissionStatus(mission.id, MISSION_STATUS.IN_PROGRESS);
    onStartVisit(mission.id);
  };

  const hasCoords =
    Array.isArray(mission.coords) &&
    mission.coords.length === 2 &&
    typeof mission.coords[0] === 'number' &&
    typeof mission.coords[1] === 'number';
  const hasLocation = typeof mission.location === 'string' && mission.location.trim().length > 0;

  let googleMapsUrl = null;
  if (hasCoords) {
    googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mission.coords[0]},${mission.coords[1]}`;
  } else if (hasLocation) {
    googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mission.location.trim())}`;
  }

  const handleNavigate = () => {
    if (googleMapsUrl) window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  const avail = farmerAvailabilities[mission.id];
  const availMap = {
    'Available': t('availableOption'),
    'Unavailable': t('unavailableOption'),
    'Not Contacted': t('notContactedOption'),
    'Unable to Reach': t('unableToReachOption'),
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gov-textSec hover:text-gov-navy">
        <ArrowLeft size={16} /> {t('backToMissions')}
      </button>

      <div>
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-gov-textSec">{t('missionNo')} {mission.id}</p>
          <PriorityChip level={mission.priority} />
        </div>
        <h1 className="text-xl font-bold text-gov-navy mt-1">{mission.title}</h1>
        <p className="text-sm text-gov-textSec flex items-center gap-1 mt-1">
          <MapPin size={13} /> {mission.location}
        </p>
      </div>

      {revisitReport && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">{t('needsRevisitFeedback')}</p>
          <p className="text-sm text-red-800">{revisitReport.officerComment || t('officerRevisitGeneric')}</p>
          {(revisitReport.officerName || revisitReport.reviewedAt) && (
            <p className="text-[11px] text-red-700/80 mt-2">
              {revisitReport.officerName ? `— ${revisitReport.officerName}` : ''}
              {revisitReport.officerName && revisitReport.reviewedAt ? ' • ' : ''}
              {revisitReport.reviewedAt || ''}
            </p>
          )}
        </Card>
      )}

      <Card>
        <CardHeader icon={User} title={t('farmerField')} />
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-gov-textSec">{t('farmerName')}</dt>
          <dd className="font-semibold text-gov-navy text-right">{mission.farmerName || '—'}</dd>
          
          <dt className="text-gov-textSec">{t('farmerId')}</dt>
          <dd className="font-semibold text-gov-navy text-right">{mission.farmerId || '—'}</dd>
          
          <dt className="text-gov-textSec">{t('fieldId')}</dt>
          <dd className="font-semibold text-gov-navy text-right">{mission.fieldId || '—'}</dd>
          
          <dt className="text-gov-textSec">{t('plotNumber')}</dt>
          <dd className="font-semibold text-gov-navy text-right">{mission.plotNumber || '—'}</dd>
          
          <dt className="text-gov-textSec">{t('villageLocation')}</dt>
          <dd className="font-semibold text-gov-navy text-right">{mission.location}</dd>
          
          <dt className="text-gov-textSec">{t('cropLabel')}</dt>
          <dd className="font-semibold text-gov-navy text-right">{mission.crop}</dd>
        </dl>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
          {mission.farmerPhone ? (
            <a 
              href={`tel:${mission.farmerPhone.replace(/\s+/g, '')}`}
              className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Phone size={15} /> {t('callFarmer')}
            </a>
          ) : (
            <div className="flex-1 bg-gray-50 text-gray-400 border border-gray-200 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed">
              <Phone size={15} /> {t('noPhone')}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader icon={Calendar} title={t('visitSchedulePrep')} />
        <dl className="grid grid-cols-2 gap-y-3 text-sm mb-4">
          <dt className="text-gov-textSec flex items-center gap-1.5"><Calendar size={13} /> {t('visitDate')}</dt>
          <dd className="font-semibold text-gov-navy text-right">{mission.visitDate || '—'}</dd>
          
          <dt className="text-gov-textSec flex items-center gap-1.5"><Clock size={13} /> {t('preferredTime')}</dt>
          <dd className="font-semibold text-gov-navy text-right">{mission.preferredTime || '—'}</dd>
        </dl>

        <div className="pt-3 border-t border-gray-100">
          <label className="block text-xs font-bold text-gov-textSec uppercase tracking-wide mb-1.5">
            {t('farmerAvailability')}
          </label>
          <select 
            value={farmerAvailabilities[mission.id] || ''}
            onChange={(e) => updateFarmerAvailability(mission.id, e.target.value)}
            className="w-full bg-white border border-gov-border rounded-lg p-2.5 text-sm focus:outline-none focus:border-gov-blue text-gov-navy font-semibold"
          >
            <option value="" disabled>{t('selectAvailability')}</option>
            <option value="Available">{t('availableOption')}</option>
            <option value="Unavailable">{t('unavailableOption')}</option>
            <option value="Not Contacted">{t('notContactedOption')}</option>
            <option value="Unable to Reach">{t('unableToReachOption')}</option>
          </select>
        </div>
      </Card>

      <Card>
        <CardHeader title={t('missionOverview')} />
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-gov-textSec">{t('assignedBy')}</dt>
          <dd className="font-semibold text-gov-navy text-right">{mission.assignedBy}</dd>
          <dt className="text-gov-textSec">{t('target')}</dt>
          <dd className="font-semibold text-gov-navy text-right">{mission.crop} {t('field').toLowerCase()}</dd>
          <dt className="text-gov-textSec">{t('surveyType')}</dt>
          <dd className="font-semibold text-gov-navy text-right">{mission.surveyType}</dd>
          <dt className="text-gov-textSec">{t('field')}</dt>
          <dd className="font-semibold text-gov-navy text-right">{mission.fieldName}</dd>
          <dt className="text-gov-textSec">{t('coordinates')}</dt>
          <dd className="font-semibold text-gov-navy text-right">{mission.coords[0].toFixed(4)}° N, {mission.coords[1].toFixed(4)}° E</dd>
          <dt className="text-gov-textSec">{t('distance')}</dt>
          <dd className={`font-semibold text-right ${withinRadius ? 'text-gov-navy' : 'text-red-600'}`}>
            {mission.distanceKm} km {withinRadius ? '' : `(${t('operatingRadiusLimit').toLowerCase()})`}
          </dd>
          <dt className="text-gov-textSec">{t('cropStage')}</dt>
          <dd className="font-semibold text-gov-navy text-right">{mission.cropStage}</dd>
          <dt className="text-gov-textSec">{t('lastObservation')}</dt>
          <dd className="font-semibold text-gov-navy text-right">{mission.lastObservation}</dd>
          <dt className="text-gov-textSec">{t('status')}</dt>
          <dd className="text-right">
            {hasDraft ? (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-700 border border-gray-200">
                {t('draft')}
              </span>
            ) : (
              <MissionStatusChip status={mission.status} size="sm" />
            )}
          </dd>
        </dl>
      </Card>

      <Card>
        <CardHeader icon={Activity} title={t('whyMissionCreated')} subtitle={t('earlyWarning')} />
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gov-bg rounded-lg p-3 border border-gov-border">
            <div className="flex items-center gap-1.5 text-gov-textSec text-xs font-semibold"><Droplets size={13} /> {t('humidityLabel')}</div>
            <p className="text-lg font-bold text-gov-navy mt-0.5">{mission.reason.humidity}%</p>
          </div>
          <div className="bg-gov-bg rounded-lg p-3 border border-gov-border">
            <div className="flex items-center gap-1.5 text-gov-textSec text-xs font-semibold"><Leaf size={13} /> {t('leafWetnessLabel')}</div>
            <p className="text-lg font-bold text-gov-navy mt-0.5">{mission.reason.leafWetness}</p>
          </div>
          <div className="bg-gov-bg rounded-lg p-3 border border-gov-border">
            <div className="flex items-center gap-1.5 text-gov-textSec text-xs font-semibold"><Users size={13} /> {t('nearbyReports')}</div>
            <p className="text-lg font-bold text-gov-navy mt-0.5">{mission.reason.nearbyReports}</p>
          </div>
          <div className="bg-gov-bg rounded-lg p-3 border border-gov-border">
            <div className="text-gov-textSec text-xs font-semibold">{t('riskModel')}</div>
            <p className="text-lg font-bold text-red-600 mt-0.5">{mission.reason.riskModel}</p>
          </div>
        </div>
        <p className="text-xs text-gov-textSec mt-3">
          {t('previousObservation')}: <span className="font-semibold text-gov-navy">{mission.reason.previousObservation}</span>
        </p>
      </Card>

      <Card>
        <CardHeader icon={CheckSquare} title={t('recommendedFieldAction')} subtitle={t('inspectFollowing')} />
        <ul className="space-y-2">
          {mission.recommendedChecks.map((c) => (
            <li key={c} className="flex items-center gap-2 text-sm text-gov-text">
              <span className="w-1.5 h-1.5 rounded-full bg-gov-blue shrink-0" /> {c}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader icon={Target} title={t('fieldVisitObjective')} subtitle={t('whyBeingSent')} />

        <p className="text-xs font-bold text-gov-textSec uppercase tracking-wide mb-1.5">{t('whyThisVisit')}</p>
        <p className="text-sm text-gov-text mb-4">
          {t('verify')} {mission.reason.previousObservation.toLowerCase()} {t('field').toLowerCase()}.
        </p>

        <p className="text-xs font-bold text-gov-textSec uppercase tracking-wide mb-1.5">{t('whatToCollect')}</p>
        <ul className="space-y-1.5 mb-4">
          {objectiveChecklist.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-gov-text">
              <CheckSquare size={13} className="text-gov-blue shrink-0" /> {item}
            </li>
          ))}
        </ul>

        <p className="text-xs text-gov-textSec border-t border-gray-100 pt-3">
          {t('reportSentToOfficer2')}
        </p>
      </Card>

      <Card>
        <CardHeader title={t('beforeYouVisit')} subtitle={t('prepChecklist')} />
        <ul className="space-y-2 text-sm text-gov-navy font-semibold">
          <li className="flex items-center gap-2">
            <CheckSquare size={14} className={mission.farmerName ? 'text-green-600' : 'text-gray-300'} /> 
            {t('farmerInformation')} {mission.farmerName ? t('farmerInfoAvailable') : t('farmerInfoMissing')}
          </li>
          <li className="flex items-center gap-2">
            <CheckSquare size={14} className={hasCoords || hasLocation ? 'text-green-600' : 'text-gray-300'} /> 
            {t('fieldLocationLabel')} {hasCoords || hasLocation ? t('farmerInfoAvailable') : t('farmerInfoMissing')}
          </li>
          <li className="flex items-center gap-2">
            <CheckSquare size={14} className={googleMapsUrl ? 'text-green-600' : 'text-gray-300'} /> 
            {t('navigateToField')} {googleMapsUrl ? t('navigationAvailable') : t('navigationUnavailable')}
          </li>
          <li className="flex items-center gap-2">
            <CheckSquare size={14} className={mission.visitDate ? 'text-green-600' : 'text-gray-300'} /> 
            {t('visitDate')} {mission.visitDate ? t('visitDateScheduled') : t('visitDateNotScheduled')}
          </li>
          <li className="flex items-center gap-2">
            <CheckSquare size={14} className={avail && avail !== 'Not Contacted' ? 'text-green-600' : 'text-gray-300'} /> 
            {t('farmerAvailability')} {avail ? `(${availMap[avail] || avail})` : `(${t('farmerAvailRecorded')})`}
          </li>
        </ul>
      </Card>

      {/* ── Navigate to Field ─────────────────────────────────────── */}
      <div className="border border-gov-border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-bold text-gov-textSec uppercase tracking-wide">{t('fieldLocationLabel')}</p>
            <p className="text-sm font-semibold text-gov-navy mt-0.5 flex items-center gap-1">
              <MapPin size={13} className="shrink-0" /> {mission.location}
            </p>
            {mission.fieldName && (
              <p className="text-xs text-gov-textSec mt-0.5">{mission.fieldName}</p>
            )}
            {hasCoords && (
              <p className="text-xs text-gov-textSec mt-0.5">
                {mission.coords[0].toFixed(4)}° N, {mission.coords[1].toFixed(4)}° E
              </p>
            )}
          </div>
        </div>
        {googleMapsUrl ? (
          <button
            onClick={handleNavigate}
            className="w-full flex items-center justify-center gap-2 border border-gov-blue text-gov-blue hover:bg-gov-blue hover:text-white font-bold text-sm py-2.5 rounded-lg transition-colors"
          >
            <Navigation size={15} />
            {t('navigateToField')}
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-400 text-sm py-2.5 rounded-lg cursor-not-allowed bg-gray-50">
            <Navigation size={15} />
            {t('navigationUnavailableMsg')}
          </div>
        )}
        {hasCoords && (
          <p className="text-[11px] text-gov-textSec mt-2 text-center">{t('opensGoogleMaps')}</p>
        )}
      </div>

      <div className="sticky bottom-16 lg:bottom-0 lg:static pt-2">
        {mission.status === MISSION_STATUS.COMPLETED || mission.status === MISSION_STATUS.UNDER_REVIEW || mission.status === MISSION_STATUS.VERIFIED ? (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-lg py-3 text-center">
            {t('missionAlreadySubmitted')}
          </div>
        ) : !withinRadius && !inProgress ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 text-center">
            <p className="text-sm font-bold text-red-700 flex items-center justify-center gap-1.5">
              <AlertTriangle size={15} /> {t('operatingRadiusLimit')}
            </p>
            <p className="text-xs text-red-700 mt-1">
              {t('outsideRadiusDetail')} {mission.distanceKm} {t('kmLimit')} {STUDENT_OPERATING_RADIUS_KM} {t('km')}
            </p>
          </div>
        ) : (
          <button
            onClick={handleStart}
            className="w-full bg-gov-blue hover:bg-gov-navy text-white font-bold py-3.5 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors"
          >
            {isRevisit && !inProgress ? t('startRevisit') : inProgress ? t('continueFieldVisitBtn') : t('startFieldVisitBtn')} <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
