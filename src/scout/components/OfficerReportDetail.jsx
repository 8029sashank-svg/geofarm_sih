import React, { useState } from 'react';
import {
  ArrowLeft, Camera, ClipboardList, ShieldCheck, RefreshCw,
  CheckCircle2, AlertTriangle, User, History, ScanLine,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { useScout } from '../ScoutContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { RiskChip, MissionStatusChip } from './Chips.jsx';

const EVIDENCE_CATEGORY_LABELS = {
  field: 'Whole field / crop view',
  plant: 'Affected plant / crop',
  symptom: 'Close-up of suspected symptom',
  damage: 'Damage / pest / fruit evidence',
  trap: 'Trap / sample evidence',
};

/**
 * Agriculture Officer — Report Detail + review actions.
 *
 * Reads the exact same report object from ScoutContext that the student
 * sees in ReportDetail.jsx — nothing here is a separate copy or a second
 * report database. Decisions are written back via
 * ScoutContext.submitOfficerReview(), which updates both the report and
 * its linked mission's status.
 *
 * Card order follows the record's chain of custody, so an officer can read
 * top-to-bottom: FIELD -> EVIDENCE -> PRELIMINARY ASSESSMENT ->
 * SCOUT VERIFICATION -> OFFICER DECISION.
 */
export default function OfficerReportDetail({ reportId, onBack }) {
  const { reports, submitOfficerReview } = useScout();
  const { t } = useLanguage();
  const report = reports.find((r) => r.id === reportId);

  const VERIFY_LABELS = {
    consistent: t('verifyConsistent') || 'Looks consistent',
    incorrect: t('verifyIncorrect') || 'Looks incorrect',
    unsure: t('verifyUnsure') || 'Not sure',
  };

  const [officerName, setOfficerName] = useState('');
  const [mode, setMode] = useState(null); // null | 'verify' | 'revisit'
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!report) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gov-textSec"><ArrowLeft size={16} /> {t('backToQueue')}</button>
        <p className="text-sm text-gov-textSec">{t('reportNotFound')}</p>
      </div>
    );
  }

  const isReviewable = report.status === 'Awaiting Officer Review' || report.status === 'Under Review';
  const nameValid = officerName.trim().length > 0;
  const reasonValid = note.trim().length > 0;

  const handleConfirm = (decision) => {
    if (!nameValid) return;
    if (decision === 'revisit' && !reasonValid) return;
    submitOfficerReview(report, decision, { officerName: officerName.trim(), note: note.trim() });
    setSubmitted(true);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gov-textSec hover:text-gov-navy">
        <ArrowLeft size={16} /> {t('backToQueue')}
      </button>

      <div>
        <p className="text-xs font-bold text-gov-textSec">{report.id}</p>
        <h1 className="text-xl font-bold text-gov-navy mt-0.5">{report.finding}</h1>
        <p className="text-sm text-gov-textSec mt-0.5">{report.field} • {report.crop}</p>
        <div className="flex items-center gap-2 mt-2">
          <RiskChip level={report.risk} size="sm" />
          <MissionStatusChip status={report.status} size="sm" />
        </div>
      </div>

      {submitted && (
        <Card className="border-green-200 bg-green-50">
          <p className="text-sm font-bold text-green-800 flex items-center gap-1.5"><CheckCircle2 size={16} /> {t('decisionRecorded')}</p>
          <p className="text-xs text-green-700 mt-1">
            {t('studentWillSeeReportAsPrefix')} &ldquo;{report.status}&rdquo; {t('studentWillSeeReportAsSuffix')}
          </p>
        </Card>
      )}

      {/* Record Details — WHO collected it, FOR WHICH field, WHO reviewed it, WHAT was decided */}
      <Card>
        <CardHeader title={t('recordDetails')} />
        <dl className="space-y-2 text-sm">
          <Row label={t('reportId')} value={report.id} />
          {report.missionId && <Row label={t('missionId')} value={report.missionId} />}
          <Row label={t('scoutNameLabel')} value={`${report.scoutName || '—'}${report.scoutId ? ` (${report.scoutId})` : ''}`} />
          <Row label={t('visitSubmittedLabel')} value={report.submittedAt} />
          <Row label={t('statusLabel')} value={report.status} />
          {report.officerName && <Row label={t('officerReviewer')} value={report.officerName} />}
          {report.reviewedAt && <Row label={t('reviewDateTime')} value={report.reviewedAt} />}
          {report.officerComment && <Row label={t('officerRemarks')} value={report.officerComment} />}
        </dl>
      </Card>

      {/* FIELD — farmer / field / plot identity */}
      <Card>
        <CardHeader icon={User} title={t('farmerFieldIdentification')} />
        <dl className="space-y-2 text-sm">
          <Row label={t('farmerLabel')} value={report.farmer || '—'} />
          <Row label={t('farmerId')} value={report.farmerId || '—'} />
          <Row label={t('fieldId')} value={report.fieldId || '—'} />
          <Row label={t('plotNumber')} value={report.plotNumber || '—'} />
          <Row label={t('locationLabel')} value={report.location || report.field || '—'} />
        </dl>
      </Card>

      <Card>
        <CardHeader title={t('cropSection')} />
        <dl className="space-y-2 text-sm">
          <Row label={t('cropLabelField')} value={report.crop || '—'} />
          <Row label={t('varietyLabel')} value={report.variety || '—'} />
          <Row label={t('growthStageLabel')} value={report.growthStage || '—'} />
          <Row label={t('fieldAreaLabel')} value={report.area ? `${report.area} acres` : '—'} />
          <Row label={t('cropCondition')} value={report.condition || '—'} />
          <Row label={t('symptomsLabel')} value={report.symptoms?.length ? report.symptoms.join(', ') : '—'} />
        </dl>
        {report.fieldNotes && (
          <p className="text-xs text-gov-text bg-gov-bg border border-gov-border rounded-lg px-3 py-2 mt-3">{report.fieldNotes}</p>
        )}
      </Card>

      {/* EVIDENCE — photo evidence, then field-observation and smart-trap metadata */}
      {report.evidence && report.evidence.length > 0 && (
        <Card>
          <CardHeader icon={Camera} title={t('fieldEvidenceCard')} subtitle={`${report.evidence.length} photo(s) • ${t('prototypeStorageNote')}`} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {report.evidence.map((p, i) => (
              <div key={p.id || i} className="border border-gov-border rounded-xl overflow-hidden bg-white">
                <img src={p.dataUrl} alt={`Field evidence ${i + 1}`} className="aspect-square w-full object-cover" />
                <div className="p-2">
                  <p className="text-[11px] font-bold text-gov-navy">{EVIDENCE_CATEGORY_LABELS[p.category] || `Photo ${i + 1}`}</p>
                  {p.description ? <p className="text-[11px] text-gov-text mt-0.5">{p.description}</p> : null}
                  {p.capturedAt && <p className="text-[10px] text-gov-textSec mt-0.5">{p.capturedAt}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {report.severity && (report.severity.affectedArea || report.severity.spread) && (
        <Card>
          <CardHeader title={t('severitySpreadCard')} />
          <dl className="space-y-2 text-sm">
            {report.severity.affectedArea && <Row label={t('affectedAreaLabel')} value={report.severity.affectedArea} />}
            {report.severity.spread && <Row label={t('spreadLabel')} value={report.severity.spread} />}
          </dl>
        </Card>
      )}

      {(report.trapCount != null || report.trend) && (
        <Card>
          <CardHeader icon={ScanLine} title={t('smartTrapObservationTitle')} />
          <dl className="space-y-2 text-sm">
            {report.trapCount != null && <Row label={t('trapCount')} value={report.trapCount} />}
            {report.trend && <Row label={t('trendLabel')} value={report.trend} />}
          </dl>
        </Card>
      )}

      {/* PRELIMINARY ASSESSMENT — AI-assisted, always flagged as advisory-only */}
      {report.aiAssessment && (
        <Card>
          <CardHeader title={t('aiPrelimAssessment')} subtitle={t('advisoryOnly')} />
          <dl className="space-y-2 text-sm">
            <Row label={t('possibleIssue')} value={report.aiAssessment.diagnosis} />
            <Row label={t('confidenceReport')} value={`${report.aiAssessment.confidence}%`} />
          </dl>
        </Card>
      )}

      {/* SCOUT VERIFICATION — the human check on the AI's preliminary read */}
      {report.scoutVerification && (
        <Card>
          <CardHeader icon={ShieldCheck} title={t('scoutVerification')} />
          <dl className="space-y-2 text-sm">
            <Row label={t('verificationStatus')} value={VERIFY_LABELS[report.scoutVerification.status] || report.scoutVerification.status} />
            {report.scoutVerification.note && <Row label={t('verificationNote')} value={report.scoutVerification.note} />}
          </dl>
        </Card>
      )}

      {(report.visitOutcome || report.outcomeLabel) && (
        <Card>
          <CardHeader icon={ClipboardList} title={t('fieldVisitOutcomeCard')} />
          <dl className="space-y-2 text-sm">
            <Row label={t('outcome')} value={report.outcomeLabel || report.visitOutcome} />
            {report.outcomeNote && <Row label={t('notesLabel')} value={report.outcomeNote} />}
          </dl>
        </Card>
      )}

      <Card>
        <CardHeader title={t('dataQualityLabel')} />
        <div className="flex items-center justify-between">
          <span className="text-sm text-gov-textSec">{t('overallScoreLabel')}</span>
          <span className="text-lg font-bold text-gov-navy">{report.dataQuality}%</span>
        </div>
      </Card>

      {/* Audit trail */}
      <Card>
        <CardHeader icon={History} title={t('reviewAuditTrailTitle')} />
        {report.reviewHistory && report.reviewHistory.length > 0 ? (
          <div className="space-y-2.5">
            {report.reviewHistory.map((h, i) => (
              <div key={i} className="text-sm border-l-2 border-gov-blue/30 pl-3">
                <p className="font-bold text-gov-navy">{h.decision} {h.officerName ? `— ${h.officerName}` : ''}</p>
                {h.note && <p className="text-xs text-gov-text mt-0.5">{h.note}</p>}
                <p className="text-[11px] text-gov-textSec mt-0.5">{h.reviewedAt}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gov-textSec">{t('noDecisionRecordedYet')}</p>
        )}
      </Card>

      {/* OFFICER DECISION */}
      {isReviewable && !submitted && (
        <Card className="border-gov-blue/30">
          <CardHeader title={t('officerDecisionCard')} subtitle={t('officerDecisionSubtitle')} />

          <label className="block text-xs font-bold text-gov-textSec uppercase tracking-wide mb-1.5">{t('yourNameLabel')}</label>
          <input
            value={officerName}
            onChange={(e) => setOfficerName(e.target.value)}
            placeholder={t('namePlaceholder')}
            className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none mb-1 ${
              nameValid ? 'border-gov-border focus:border-gov-blue' : 'border-red-300 focus:border-red-500'
            }`}
          />
          {!nameValid && <p className="text-[11px] text-red-600 mb-3">{t('nameRequiredNote')}</p>}

          {!mode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              <button
                onClick={() => setMode('verify')}
                className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-gov-blue hover:bg-gov-navy rounded-lg py-3"
              >
                <CheckCircle2 size={16} /> {t('verifyReportBtn')}
              </button>
              <button
                onClick={() => setMode('revisit')}
                className="flex items-center justify-center gap-2 text-sm font-bold text-red-700 border border-red-300 bg-white hover:bg-red-50 rounded-lg py-3"
              >
                <RefreshCw size={16} /> {t('requestRevisitBtn')}
              </button>
            </div>
          )}

          {mode === 'verify' && (
            <div className="mt-3 space-y-2">
              <label className="block text-xs font-bold text-gov-textSec uppercase tracking-wide">{t('reviewNoteOptionalLabel')}</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder={t('reviewNotePlaceholder')}
                className="w-full px-3 py-2.5 text-sm border border-gov-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gov-blue/30 focus:border-gov-blue"
              />
              <div className="flex gap-2">
                <button onClick={() => { setMode(null); setNote(''); }} className="flex-1 text-sm font-bold text-gov-textSec border border-gov-border rounded-lg py-2.5">{t('cancelLabel')}</button>
                <button
                  onClick={() => handleConfirm('verified')}
                  disabled={!nameValid}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold text-white bg-gov-blue hover:bg-gov-navy disabled:opacity-40 rounded-lg py-2.5"
                >
                  <CheckCircle2 size={15} /> {t('confirmVerifyBtn')}
                </button>
              </div>
            </div>
          )}

          {mode === 'revisit' && (
            <div className="mt-3 space-y-2">
              <label className="block text-xs font-bold text-gov-textSec uppercase tracking-wide">{t('reasonForRevisitLabel')}</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder={t('reasonRevisitPlaceholder')}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none ${
                  reasonValid ? 'border-gov-border focus:border-gov-blue' : 'border-red-300 focus:border-red-500'
                }`}
              />
              {!reasonValid && <p className="text-[11px] text-red-600 flex items-center gap-1"><AlertTriangle size={12} /> {t('reasonRequiredNote')}</p>}
              <div className="flex gap-2">
                <button onClick={() => { setMode(null); setNote(''); }} className="flex-1 text-sm font-bold text-gov-textSec border border-gov-border rounded-lg py-2.5">{t('cancelLabel')}</button>
                <button
                  onClick={() => handleConfirm('revisit')}
                  disabled={!nameValid || !reasonValid}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded-lg py-2.5"
                >
                  <RefreshCw size={15} /> {t('confirmRevisitBtn')}
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {!isReviewable && !submitted && (
        <p className="text-xs text-gov-textSec text-center flex items-center justify-center gap-1.5">
          <ShieldCheck size={13} /> {t('alreadyReviewedNote')}
        </p>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-gov-textSec shrink-0">{label}</dt>
      <dd className="font-semibold text-gov-navy text-right">{value}</dd>
    </div>
  );
}
