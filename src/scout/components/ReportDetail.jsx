import React from 'react';
import {
  ArrowLeft, MapPin, Camera, Bot, GraduationCap, ScanLine, BarChart3, Cloud, Landmark, ClipboardList, RefreshCw,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { useScout } from '../ScoutContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { RiskChip, MissionStatusChip } from './Chips.jsx';

const ICONS = {
  pin: MapPin,
  camera: Camera,
  ai: Bot,
  grad: GraduationCap,
  trap: ScanLine,
  chart: BarChart3,
  cloud: Cloud,
  gov: Landmark,
  outcome: ClipboardList,
};

const EVIDENCE_CATEGORY_LABELS = {
  field: 'Whole field / crop view',
  plant: 'Affected plant / crop',
  symptom: 'Close-up of suspected symptom',
  damage: 'Damage / pest / fruit evidence',
  trap: 'Trap / sample evidence',
};

export default function ReportDetail({ reportId, onBack, onStartRevisit }) {
  const { reports, scout } = useScout();
  const { t } = useLanguage();
  const report = reports.find((r) => r.id === reportId);

  const VERIFY_LABELS = {
    consistent: t('verifyConsistent') || 'Looks consistent',
    incorrect: t('verifyIncorrect') || 'Looks incorrect',
    unsure: t('verifyUnsure') || 'Not sure',
  };

  if (!report) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gov-textSec">
          <ArrowLeft size={16} /> {t('backToReports')}
        </button>
        <p className="text-sm text-gov-textSec">{t('reportNotFound')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gov-textSec hover:text-gov-navy">
        <ArrowLeft size={16} /> {t('backToReports')}
      </button>

      <div>
        <p className="text-xs font-bold text-gov-textSec">{report.id}</p>
        <h1 className="text-xl font-bold text-gov-navy mt-0.5">{report.finding}</h1>
        <p className="text-sm text-gov-textSec mt-0.5">{report.field} • {report.crop}</p>
        <div className="flex items-center gap-2 mt-2">
          <RiskChip level={report.risk} size="sm" />
          <MissionStatusChip status={report.status} size="sm" />
          {report.synced === false ? (
            <span className="text-[11px] font-semibold text-orange-600">{t('waitingToSyncLabel')}</span>
          ) : (
            <span className="text-[11px] font-semibold text-green-700">{t('syncedLabel')}</span>
          )}
        </div>
      </div>

      {report.status === 'Needs Revisit' && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">{t('needsRevisitFeedback')}</p>
          {report.officerComment ? (
            <p className="text-sm text-red-800 mb-3">{report.officerComment}</p>
          ) : (
            <p className="text-sm text-red-700 mb-3">{t('officerRevisitGeneric')}</p>
          )}
          {(report.officerName || report.reviewedAt) && (
            <p className="text-[11px] text-red-700/80 mb-3">
              {report.officerName ? `— ${report.officerName}` : ''}{report.officerName && report.reviewedAt ? ' • ' : ''}{report.reviewedAt || ''}
            </p>
          )}
          {onStartRevisit && (
            <button
              onClick={() => onStartRevisit(report.missionId || reportId)}
              className="flex items-center gap-2 text-sm font-bold text-red-700 border border-red-300 bg-white rounded-lg px-4 py-2 hover:bg-red-50 transition-colors"
            >
              <RefreshCw size={14} /> {t('startRevisit')}
            </button>
          )}
        </Card>
      )}

      {report.status === 'Verified' && report.officerName && (
        <Card className="border-green-200 bg-green-50">
          <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">{t('verifiedByOfficer')}</p>
          <p className="text-sm text-green-800">{report.officerName}{report.reviewedAt ? ` • ${report.reviewedAt}` : ''}</p>
          {report.officerComment && <p className="text-sm text-green-800 mt-1">{report.officerComment}</p>}
        </Card>
      )}

      <Card>
        <CardHeader title={t('recordDetails')} />
        <dl className="space-y-2 text-sm">
          <Row label={t('reportId')} value={report.id} />
          {report.missionId && <Row label={t('missionId')} value={report.missionId} />}
          {report.plotNumber && <Row label={t('plotNumber')} value={report.plotNumber} />}
          {report.fieldId && <Row label={t('fieldId')} value={report.fieldId} />}
          <Row label={t('scoutNameLabel')} value={`${report.scoutName || scout.name}${report.scoutId || scout.scoutId ? ` (${report.scoutId || scout.scoutId})` : ''}`} />
          <Row label={t('visitSubmittedLabel')} value={report.submittedAt} />
          <Row label={t('statusLabel')} value={report.status} />
          {report.officerName && <Row label={t('officerReviewer')} value={report.officerName} />}
          {report.reviewedAt && <Row label={t('reviewDateTime')} value={report.reviewedAt} />}
        </dl>
      </Card>

      <Card>
        <CardHeader title={t('summary')} />
        <dl className="space-y-2 text-sm">
          {report.farmer && <Row label={t('farmer')} value={report.farmer} />}
          {report.farmerAvailability && <Row label={t('farmerAvailabilityLabel')} value={report.farmerAvailability} />}
          <Row label={t('aiConfidenceReport')} value={report.aiConfidence ? `${report.aiConfidence}%` : '—'} />
          {report.symptoms && report.symptoms.length > 0 && (
            <Row label={t('symptomsLabel')} value={report.symptoms.join(', ')} />
          )}
          {report.condition && <Row label={t('cropCondition')} value={report.condition} />}
          <Row label={t('photosLabel')} value={report.photos} />
          <Row label={t('dataQualityLabel')} value={`${report.dataQuality}%`} />
        </dl>
      </Card>

      {(report.trapCount != null || report.trend) && (
        <Card>
          <CardHeader title={t('smartTrapObservationTitle')} />
          <dl className="space-y-2 text-sm">
            {report.trapCount != null && <Row label={t('trapCount')} value={report.trapCount} />}
            {report.trend && <Row label={t('pestTrend')} value={report.trend} />}
          </dl>
        </Card>
      )}

      {report.severity && (report.severity.affectedArea || report.severity.spread) && (
        <Card>
          <CardHeader title={t('severitySpread')} />
          <dl className="space-y-2 text-sm">
            {report.severity.affectedArea && <Row label={t('affectedAreaLabel')} value={report.severity.affectedArea} />}
            {report.severity.spread && <Row label={t('spreadLabel')} value={report.severity.spread} />}
          </dl>
        </Card>
      )}

      {report.aiAssessment && (
        <Card>
          <CardHeader title={t('aiPrelimAssessment')} subtitle={t('advisoryOnly')} />
          <dl className="space-y-2 text-sm">
            <Row label={t('aiResult')} value={report.aiAssessment.diagnosis} />
            <Row label={t('confidenceReport')} value={`${report.aiAssessment.confidence}%`} />
          </dl>
        </Card>
      )}

      {report.scoutVerification && (
        <Card>
          <CardHeader title={t('scoutVerification')} />
          <dl className="space-y-2 text-sm">
            <Row label={t('verificationStatus')} value={VERIFY_LABELS[report.scoutVerification.status] || report.scoutVerification.status} />
            {report.scoutVerification.note && <Row label={t('verificationNote')} value={report.scoutVerification.note} />}
          </dl>
        </Card>
      )}

      {(report.visitOutcome || report.outcomeLabel) && (
        <Card>
          <CardHeader icon={ClipboardList} title={t('fieldVisitOutcomeCard')} subtitle={t('studentVisitRecord')} />
          <dl className="space-y-2 text-sm">
            <Row label={t('outcome')} value={report.outcomeLabel || report.visitOutcome} />
            {report.outcomeNote && <Row label={t('notesLabel')} value={report.outcomeNote} />}
          </dl>
        </Card>
      )}

      {report.evidence && report.evidence.length > 0 && (
        <Card>
          <CardHeader
            icon={Camera}
            title={t('fieldEvidenceCard')}
            subtitle={`${report.evidence.length} photo(s) • ${t('prototypeStorageNote')}`}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {report.evidence.map((p, i) => (
              <div key={p.id || i} className="border border-gov-border rounded-xl overflow-hidden bg-white">
                <img src={p.dataUrl} alt={`Field evidence ${i + 1}`} className="aspect-square w-full object-cover" />
                <div className="p-2">
                  <p className="text-[11px] font-bold text-gov-navy">{EVIDENCE_CATEGORY_LABELS[p.category] || `Photo ${i + 1}`}</p>
                  {p.description ? (
                    <p className="text-[11px] text-gov-text mt-0.5">{p.description}</p>
                  ) : null}
                  <p className="text-[10px] text-gov-textSec mt-0.5">{p.capturedAt} • {t('prototypeStorageNote')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title={t('evidenceTimeline')} subtitle={t('auditableRecord')} />
        <div className="space-y-0">
          {(report.timeline || []).map((ev, i, arr) => {
            const Icon = ICONS[ev.icon] || MapPin;
            const isLast = i === arr.length - 1;
            return (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-gov-bg border border-gov-border flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-gov-blue" />
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-gov-border" />}
                </div>
                <div className="pb-4 min-w-0">
                  <p className="text-xs font-bold text-gov-textSec">{ev.time}</p>
                  <p className="text-sm text-gov-navy font-medium">{ev.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gov-textSec">{label}</dt>
      <dd className="font-semibold text-gov-navy">{value}</dd>
    </div>
  );
}
