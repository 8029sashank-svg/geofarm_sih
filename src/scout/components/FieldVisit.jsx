import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, MapPin, CheckCircle2, ClipboardList, Camera, Upload, X, Package,
  Loader2, Bug, Thermometer, Droplets, Waves, CloudRain, ShieldCheck, XCircle,
  HelpCircle, ScanLine, ClipboardCheck, PartyPopper, Wifi, WifiOff, Pencil, MessageCircleQuestion,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { useScout } from '../ScoutContext.jsx';
import { RiskChip } from './Chips.jsx';
import { SYMPTOM_OPTIONS, NEARBY_CASES, NEARBY_CASE_DETAILS, EVIDENCE_CATEGORIES } from '../mockData.js';
import { simulateLeafAnalysis, simulateTrapScan, computeFieldRisk, computeDataQuality } from '../utils/aiSim.js';
import FieldAssistant from './FieldAssistant.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

/**
 * Geo-Farm — unified Field Visit workflow.
 *
 * One coherent process (this used to be two separate, overlapping flows:
 * FieldVisit.jsx and FieldSurvey.jsx). Every entry point — Mission Detail's
 * "Start Field Visit" and My Assignments' "Start Field Visit" — now opens
 * this same component.
 *
 * Steps: Check-in -> Crop & Field -> Observation -> Evidence -> Smart Trap
 * & Conditions -> Severity & Spread -> AI Preliminary Assessment ->
 * Scout Verification -> Review & Submit.
 *
 * Everything here is mock/simulated: no real GPS, no real AI, no real
 * upload. That is stated plainly in the UI rather than implied.
 */

const STEPS = [
  'Check-in',
  'Crop & Field',
  'Observation',
  'Evidence',
  'Smart Trap',
  'Severity',
  'AI Assessment',
  'Verification',
  'Outcome',
  'Review',
];

const STEP_KEYS = [
  'stepCheckin',
  'stepCropField',
  'stepObservation',
  'stepEvidence',
  'stepSmartTrap',
  'stepSeverity',
  'stepAiAssessment',
  'stepVerification',
  'stepOutcome',
  'stepReview',
];

const OUTCOME_LABEL_KEYS = {
  issue_verified: 'outcomeIssueVerified',
  no_issue_found: 'outcomeNoIssue',
  inconclusive: 'outcomeInconclusive',
  farmer_unavailable: 'outcomeFarmerUnavailable',
  field_inaccessible: 'outcomeFieldInaccessible',
  revisit_required: 'outcomeRevisitRequired',
};

const OUTCOME_HINT_KEYS = {
  issue_verified: 'outcomeIssueVerifiedHint',
  no_issue_found: 'outcomeNoIssueHint',
  inconclusive: 'outcomeInconclusiveHint',
  farmer_unavailable: 'outcomeFarmerUnavailableHint',
  field_inaccessible: 'outcomeFieldInaccessibleHint',
  revisit_required: 'outcomeRevisitRequiredHint',
};

const AFFECTED_AREA_KEYS = {
  'Less than 5%': 'areaLessThan5',
  '5–20%': 'area5to20',
  '20–50%': 'area20to50',
  'More than 50%': 'areaMoreThan50',
};

const SPREAD_KEYS = {
  'Isolated plants': 'spreadIsolated',
  'Scattered patches': 'spreadScattered',
  'Widespread': 'spreadWidespread',
  'Field-wide': 'spreadFieldWide',
};

const CONDITION_KEYS = {
  'Healthy': 'healthy',
  'Mild stress': 'mildStress',
  'Moderate stress': 'moderateStress',
  'Severe stress': 'severeStress',
};

const KIT_ITEM_KEYS = {
  'Smartphone / app': 'kitSmartphone',
  'Power bank / solar charger': 'kitPowerbank',
  'Hand lens / magnifying glass': 'kitLens',
  'Sample bags / vials': 'kitSampleBags',
  'Gloves': 'kitGloves',
  'Soil pH / moisture kit': 'kitSoilKit',
  'Pest & disease reference booklet': 'kitBooklet',
};

const VISIT_OUTCOME_OPTIONS = [
  { value: 'issue_verified',      label: 'Issue Verified',         hint: 'Problem confirmed in the field.' },
  { value: 'no_issue_found',      label: 'No Issue Found',         hint: 'Field visited; no significant problem observed.' },
  { value: 'inconclusive',        label: 'Symptoms Inconclusive',  hint: 'Symptoms present but uncertain.' },
  { value: 'farmer_unavailable',  label: 'Farmer Unavailable',     hint: 'Could not meet the farmer at the time of visit.' },
  { value: 'field_inaccessible',  label: 'Field Inaccessible',     hint: 'Could not reach the field.' },
  { value: 'revisit_required',    label: 'Revisit Required',       hint: 'More information needed; will revisit.' },
];

const AFFECTED_AREA_OPTIONS = ['Less than 5%', '5–20%', '20–50%', 'More than 50%'];
const SPREAD_OPTIONS = ['Isolated plants', 'Scattered patches', 'Widespread', 'Field-wide'];

const MAX_PHOTOS = 8;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_REASON = { humidity: 65, leafWetness: 'Moderate', nearbyReports: 0 };

function compressImage(dataUrl, maxWidth, maxHeight, quality) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (_err) {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function readAsPhoto(file, category) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const compressedDataUrl = await compressImage(reader.result, 800, 800, 0.7);
        resolve({
          id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          category,
          name: file.name,
          type: 'image/jpeg',
          size: Math.round((compressedDataUrl.length * 3) / 4),
          dataUrl: compressedDataUrl,
          description: '',
          capturedAt: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
        });
      } catch (_err) {
        resolve({
          id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          category,
          name: file.name,
          type: file.type || 'image/jpeg',
          size: file.size,
          dataUrl: reader.result,
          description: '',
          capturedAt: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
        });
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function StepDots({ step }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
      {STEPS.map((s, i) => (
        <div key={s} className={`h-1.5 rounded-full transition-all shrink-0 ${i === step ? 'w-5 bg-gov-blue' : i < step ? 'w-1.5 bg-gov-blue/50' : 'w-1.5 bg-gray-200'}`} />
      ))}
    </div>
  );
}

function ReadinessItem({ label, done, onFix, notRequired, notRequiredLabel, fixLabel }) {
  if (notRequired) {
    return (
      <div className="flex items-center justify-between text-xs py-1">
        <span className="text-gray-400 flex items-center gap-1.5"><CheckCircle2 size={14} className="text-gray-300" /> {label}</span>
        <span className="text-gray-400 text-[10px] font-semibold bg-gray-100 px-1.5 py-0.5 rounded">{notRequiredLabel || 'Not Required'}</span>
      </div>
    );
  }
  if (done) {
    return (
      <div className="flex items-center justify-between text-xs py-1">
        <span className="text-green-700 font-medium flex items-center gap-1.5"><CheckCircle2 size={14} /> {label}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between text-xs py-1">
      <span className="text-red-600 font-medium flex items-center gap-1.5"><XCircle size={14} /> {label}</span>
      <button onClick={onFix} className="text-gov-blue font-bold text-[11px] bg-gov-blue/10 px-2 py-0.5 rounded hover:bg-gov-blue/20 transition-colors">{fixLabel || 'Fix'}</button>
    </div>
  );
}

export default function FieldVisit({ visitId, onBack, onComplete }) {
  const { t } = useLanguage();
  const {
    scout,
    missions,
    traps,
    isOnline,
    reports,
    submitReport,
    addVisitPhotos,
    farmerAvailabilities,
    updateFarmerAvailability
  } = useScout();

  const mission = missions.find((m) => m.id === visitId);
  const nearbyCase = NEARBY_CASES.find((c) => c.id === visitId);
  const caseDetail = NEARBY_CASE_DETAILS[visitId];

  const [step, setStep] = useState(0);

  // Step 0 — check-in
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkinAt, setCheckinAt] = useState(null);
  const [kitPacked, setKitPacked] = useState({});
  const [showKit, setShowKit] = useState(false);

  // Step 8 — field visit outcome
  const [visitOutcome, setVisitOutcome] = useState(null);
  const [outcomeNote, setOutcomeNote] = useState('');

  // Step 1 — crop & field
  const [crop, setCrop] = useState(mission?.crop || nearbyCase?.crop || '');
  const [variety, setVariety] = useState(mission?.crop === 'Grapes' ? 'Thompson Seedless' : '');
  const [growthStage, setGrowthStage] = useState(mission?.cropStage || '');
  const [area, setArea] = useState('2.5');

  // Step 2 — observation
  const [condition, setCondition] = useState('Moderate stress');
  const [symptoms, setSymptoms] = useState([]);
  const [fieldNotes, setFieldNotes] = useState('');

  // Step 3 — evidence
  const [evidencePhotos, setEvidencePhotos] = useState([]);
  const fileInputRef = useRef(null);
  const [pendingCategory, setPendingCategory] = useState(null);

  // Step 4 — trap
  const [trapScanning, setTrapScanning] = useState(false);
  const [trapResult, setTrapResult] = useState(null);
  const [trapVerification, setTrapVerification] = useState(null);

  // Step 5 — severity
  const [affectedArea, setAffectedArea] = useState(null);
  const [spread, setSpread] = useState(null);

  // Step 6 — AI
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Step 7 — scout verification (kept separate from the AI result)
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const [saveStatus, setSaveStatus] = useState('');
  // Set the moment Submit is pressed so a pending autosave timer can never
  // re-create a draft after it has been cleared.
  const submittedRef = useRef(false);
  const draftKey = `geofarm_draft_${visitId}`;

  // Field Assistant — contextual in-visit help panel (see FieldAssistant.jsx).
  const [assistantOpen, setAssistantOpen] = useState(false);
  
  // Read draft on mount
  React.useEffect(() => {
    // If the report was already submitted (has an ID), don't restore the draft unless this is an active revisit
    const isSubmitted = reports && reports.some(r => r.missionId === visitId && r.status !== 'Needs Revisit');
    if (isSubmitted) return;
    try {
      const stored = localStorage.getItem(draftKey);
      if (stored) {
        const draft = JSON.parse(stored);
        if (draft.step !== undefined) setStep(draft.step);
        if (draft.checkedIn !== undefined) setCheckedIn(draft.checkedIn);
        if (draft.checkinAt !== undefined) setCheckinAt(draft.checkinAt);
        if (draft.visitOutcome !== undefined) setVisitOutcome(draft.visitOutcome);
        if (draft.outcomeNote !== undefined) setOutcomeNote(draft.outcomeNote);
        if (draft.crop !== undefined) setCrop(draft.crop);
        if (draft.variety !== undefined) setVariety(draft.variety);
        if (draft.growthStage !== undefined) setGrowthStage(draft.growthStage);
        if (draft.area !== undefined) setArea(draft.area);
        if (draft.condition !== undefined) setCondition(draft.condition);
        if (draft.symptoms !== undefined) setSymptoms(draft.symptoms);
        if (draft.fieldNotes !== undefined) setFieldNotes(draft.fieldNotes);
        if (draft.evidencePhotos !== undefined) setEvidencePhotos(draft.evidencePhotos);
        if (draft.trapResult !== undefined) setTrapResult(draft.trapResult);
        if (draft.trapVerification !== undefined) setTrapVerification(draft.trapVerification);
        if (draft.affectedArea !== undefined) setAffectedArea(draft.affectedArea);
        if (draft.spread !== undefined) setSpread(draft.spread);
        if (draft.aiResult !== undefined) setAiResult(draft.aiResult);
        if (draft.verificationStatus !== undefined) setVerificationStatus(draft.verificationStatus);
        if (draft.verificationNote !== undefined) setVerificationNote(draft.verificationNote);
        setSaveStatus(t('draftRestored'));
      }
    } catch (e) {
      console.error('Failed to restore draft', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save draft on state changes
  React.useEffect(() => {
    const isSubmitted = (reports && reports.some(r => r.missionId === visitId && r.status !== 'Needs Revisit')) || submitted;
    if (isSubmitted) return;
    
    const draftState = {
      step, checkedIn, checkinAt, visitOutcome, outcomeNote, crop, variety, growthStage,
      area, condition, symptoms, fieldNotes, evidencePhotos, trapResult, trapVerification,
      affectedArea, spread, aiResult, verificationStatus, verificationNote
    };

    const timer = setTimeout(() => {
      if (submittedRef.current) return;
      try {
        localStorage.setItem(draftKey, JSON.stringify(draftState));
        setSaveStatus(`${t('savedLocallyAt')} ${new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`);
      } catch (e) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
          try {
            // Strip large photo dataUrls to keep the draft safely under quota
            const lightDraft = {
              ...draftState,
              evidencePhotos: (draftState.evidencePhotos || []).map((p) => ({ ...p, dataUrl: '' })),
            };
            localStorage.setItem(draftKey, JSON.stringify(lightDraft));
            setSaveStatus(`${t('savedLocallyAt')} ${new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`);
          } catch (_e2) {
            setSaveStatus(t('failedSaveFull'));
          }
        } else {
          setSaveStatus(t('failedSave'));
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    draftKey, submitted, reports, visitId, t,
    step, checkedIn, checkinAt, visitOutcome, outcomeNote, crop, variety, growthStage,
    area, condition, symptoms, fieldNotes, evidencePhotos, trapResult, trapVerification,
    affectedArea, spread, aiResult, verificationStatus, verificationNote
  ]);

  const caseTitle = caseDetail?.problem || mission?.title || nearbyCase?.issue || visitId;
  const farmer = mission?.farmerName || nearbyCase?.farmer || null;
  const location = mission?.location || nearbyCase?.village || '—';
  const fieldName = mission?.fieldName || location;
  const trap = mission?.trapId ? traps[mission.trapId] : null;
  const reason = mission?.reason || DEFAULT_REASON;
  const distanceKm = mission?.distanceKm ?? nearbyCase?.distanceKm ?? null;

  const symptomOptions = useMemo(() => {
    const caseSymptoms = caseDetail?.symptoms || [];
    return [...new Set([...caseSymptoms, ...SYMPTOM_OPTIONS])];
  }, [caseDetail]);

  const toggleSymptom = (s) => {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleCheckIn = () => {
    setCheckedIn(true);
    setCheckinAt(new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }));
  };

  const openPickerFor = (categoryKey) => {
    setPendingCategory(categoryKey);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []).filter((f) => ACCEPTED_TYPES.includes(f.type) || f.type.startsWith('image/'));
    e.target.value = '';
    if (!files.length || !pendingCategory) return;
    const remaining = MAX_PHOTOS - evidencePhotos.length;
    const toAdd = files.slice(0, Math.max(0, remaining));
    const rawObjs = await Promise.all(toAdd.map((f) => readAsPhoto(f, pendingCategory)));
    const objs = rawObjs.filter(Boolean);
    setEvidencePhotos((prev) => [...prev, ...objs]);
    setPendingCategory(null);
  };

  const SAMPLE_PHOTOS_MAP = {
    field: '/agriculture/grapes/vineyard.jpg',
    plant: '/agriculture/grapes/vineyard.jpg',
    symptom: '/agriculture/grapes/fruit-fly.jpg',
    damage: '/agriculture/grapes/fruit-fly.jpg',
    trap: '/agriculture/grapes/fruit-fly.jpg',
  };

  const addSamplePhoto = (categoryKey) => {
    if (evidencePhotos.length >= MAX_PHOTOS) return;
    const sampleUrl = SAMPLE_PHOTOS_MAP[categoryKey] || '/agriculture/grapes/vineyard.jpg';
    const sampleObj = {
      id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      category: categoryKey,
      name: `${categoryKey}-evidence.jpg`,
      type: 'image/jpeg',
      size: 45000,
      dataUrl: sampleUrl,
      description: '',
      capturedAt: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
    };
    setEvidencePhotos((prev) => [...prev, sampleObj]);
  };

  const removeEvidencePhoto = (id) => {
    setEvidencePhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const updateEvidenceDescription = (id, description) => {
    setEvidencePhotos((prev) => prev.map((p) => (p.id === id ? { ...p, description } : p)));
  };

  const runTrapScan = () => {
    setTrapScanning(true);
    setTimeout(() => {
      setTrapResult(simulateTrapScan(trap?.previousTotal ?? 18));
      setTrapScanning(false);
    }, 1000);
  };

  const runAiAssessment = () => {
    setAiLoading(true);
    setTimeout(() => {
      setAiResult(simulateLeafAnalysis());
      setAiLoading(false);
    }, 900);
  };

  const risk = useMemo(() => computeFieldRisk({
    trapChangePct: trapResult?.changePct ?? 0,
    humidity: reason.humidity,
    hasSymptoms: symptoms.length > 0 && !symptoms.includes('No visible symptoms'),
    nearbyReports: reason.nearbyReports,
  }), [trapResult, reason, symptoms]);

  const dataQuality = useMemo(() => computeDataQuality({
    gps: checkedIn,
    timestamp: checkedIn,
    requiredFieldsComplete: !!crop && !!growthStage && symptoms.length > 0,
    photoQualityGood: evidencePhotos.length > 0,
    trapVerified: trap ? trapVerification !== null : true,
    severityRecorded: !!affectedArea && !!spread,
  }), [checkedIn, crop, growthStage, symptoms, evidencePhotos, trap, trapVerification, affectedArea, spread]);

  const isInaccessible = visitOutcome === 'field_inaccessible';
  const canSubmit = checkedIn && !!visitOutcome && (isInaccessible || (symptoms.length > 0 && evidencePhotos.length > 0 && !!affectedArea && !!spread && !!verificationStatus));

  // Single source of truth for Report Readiness — used by the Review step's
  // checklist UI below AND by the Field Assistant's "what's missing" answer.
  // Do not fork this into a second, separately-maintained checklist.
  const readinessChecklist = useMemo(() => ([
    { key: 'checkin', label: t('readinessCheckin'), done: checkedIn, step: 0 },
    { key: 'outcome', label: t('readinessOutcome'), done: !!visitOutcome, step: 8 },
    { key: 'crop', label: t('readinessCrop'), done: !!crop && !!growthStage && !!area, step: 1, notRequired: isInaccessible },
    { key: 'symptoms', label: t('readinessSymptoms'), done: symptoms.length > 0, step: 2, notRequired: isInaccessible },
    { key: 'evidence', label: t('readinessEvidence'), done: evidencePhotos.length > 0, step: 3, notRequired: isInaccessible },
    { key: 'severity', label: t('readinessSeverity'), done: !!affectedArea && !!spread, step: 5, notRequired: isInaccessible },
    { key: 'verification', label: t('readinessVerification'), done: !!verificationStatus, step: 7, notRequired: isInaccessible },
  ]), [t, checkedIn, visitOutcome, crop, growthStage, area, symptoms, evidencePhotos, affectedArea, spread, verificationStatus, isInaccessible]);

  const missingItems = useMemo(
    () => readinessChecklist.filter((i) => !i.done && !i.notRequired),
    [readinessChecklist]
  );

  const handleSubmit = () => {
    if (!canSubmit) return;
    submittedRef.current = true;
    setSubmitting(true);
    if (evidencePhotos.length > 0) addVisitPhotos(visitId, evidencePhotos);
    const missionLike = mission || { id: visitId, location, crop, coords: null };
    const outcomeLabel = VISIT_OUTCOME_OPTIONS.find((o) => o.value === visitOutcome)?.label || visitOutcome;
    
    // Clear the draft on submit
    try {
      localStorage.removeItem(draftKey);
    } catch (_e) {
      /* ignore */
    }

    setTimeout(() => {
      const report = submitReport(missionLike, {
        finding: aiResult ? aiResult.primary.label : 'Field observation',
        risk: risk.level,
        dataQuality: dataQuality.score,
        aiAssessment: aiResult ? { diagnosis: aiResult.primary.label, confidence: aiResult.primary.confidence, alternatives: aiResult.alternatives } : null,
        scoutVerification: verificationStatus ? { status: verificationStatus, note: verificationNote } : null,
        visitOutcome,
        outcomeLabel,
        outcomeNote: outcomeNote.trim() || null,
        severity: (affectedArea || spread) ? { affectedArea, spread } : null,
        trapCount: trapResult?.total ?? null,
        trend: trapResult ? `+${trapResult.changePct}%` : null,
        photos: evidencePhotos.length,
        evidence: evidencePhotos,
        symptoms,
        condition,
        fieldNotes,
        variety,
        growthStage,
        area,
        timeline: [
          { time: 'now', icon: 'pin', label: t('timelineFieldCheckin') },
          { time: 'now', icon: 'camera', label: `${evidencePhotos.length} ${t('timelinePhotosCaptured')}` },
          ...(trap ? [{ time: 'now', icon: 'trap', label: t('timelineTrapScanned') }] : []),
          ...(aiResult ? [{ time: 'now', icon: 'ai', label: t('timelineAiCompleted') }] : []),
          { time: 'now', icon: 'grad', label: t('timelineScoutVerification') },
          { time: 'now', icon: 'outcome', label: `${t('fieldVisitOutcomeCard')}: ${outcomeLabel}` },
          { time: 'now', icon: 'chart', label: t('timelineRiskRecalc') },
          { time: 'now', icon: 'cloud', label: t('timelineReportUploaded') },
          { time: 'now', icon: 'gov', label: t('timelineAwaitingOfficer') },
        ],
      });
      try {
        localStorage.removeItem(draftKey);
      } catch (_e) {
        /* ignore */
      }
      setSubmitting(false);
      setSubmitted(report);
    }, 1100);
  };

  const goToStep = (i) => setStep(i);

  // Snapshot of everything the Field Assistant is allowed to reason about —
  // all of it pulled from state/values that already exist in this component
  // (nothing new is invented for the assistant).
  const assistantContext = useMemo(() => ({
    step,
    stepLabel: STEPS[step],
    caseTitle,
    farmer,
    crop,
    variety,
    growthStage,
    condition,
    symptoms,
    fieldNotes,
    evidencePhotos,
    trap,
    trapResult,
    affectedArea,
    spread,
    aiResult,
    verificationStatus,
    visitOutcome,
    isInaccessible,
    readinessChecklist,
    missingItems,
    risk,
    dataQuality,
  }), [
    step, caseTitle, farmer, crop, variety, growthStage, condition, symptoms, fieldNotes,
    evidencePhotos, trap, trapResult, affectedArea, spread, aiResult, verificationStatus,
    visitOutcome, isInaccessible, readinessChecklist, missingItems, risk, dataQuality,
  ]);

  if (!mission && !nearbyCase) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gov-textSec">
          <ArrowLeft size={16} /> {t('back')}
        </button>
        <p className="text-sm text-gov-textSec">{t('visitNotFound')}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-10 space-y-5">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
          <CheckCircle2 size={34} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gov-navy">{t('fieldReportSubmitted')}</h1>
          <p className="text-sm text-gov-textSec mt-1">{t('reportSentToOfficer')}</p>
        </div>
        <Card className="text-left">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gov-textSec">{t('reportId')}</dt><dd className="font-bold text-gov-navy">{submitted.id}</dd></div>
            <div className="flex justify-between"><dt className="text-gov-textSec">{t('statusLabel')}</dt><dd className="font-bold text-purple-700">{submitted.status}</dd></div>
            <div className="flex justify-between"><dt className="text-gov-textSec">{t('fieldRisk')}</dt><dd><RiskChip level={risk.level} size="sm" /></dd></div>
          </dl>
        </Card>
        <button onClick={() => onComplete(submitted)} className="w-full bg-gov-blue hover:bg-gov-navy text-white font-bold py-3 rounded-lg">
          {t('backToDashboard')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-4">
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFileSelect} />

      <div className="flex items-center justify-between gap-2">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gov-textSec hover:text-gov-navy shrink-0">
          <ArrowLeft size={16} /> {t('exit')}
        </button>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex flex-col items-end min-w-0">
            <span className="text-xs font-bold text-gov-textSec truncate">{t(STEP_KEYS[step])} · {step + 1}/{STEPS.length}</span>
            {saveStatus && <span className="text-[10px] text-gov-textSec/80 truncate">{saveStatus}</span>}
          </div>
          <button
            onClick={() => setAssistantOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-gov-blue border border-gov-blue/30 bg-gov-blue/5 hover:bg-gov-blue/10 rounded-lg px-3 py-2 shrink-0"
          >
            <MessageCircleQuestion size={15} /> <span className="hidden sm:inline">{t('fieldAssistantBtn')}</span>
          </button>
        </div>
      </div>
      <StepDots step={step} />

      {/* STEP 0: Check-in */}
      {step === 0 && (
        <Card>
          <CardHeader icon={ClipboardList} title={t('fieldVisitCard')} subtitle={caseTitle} />
          <dl className="grid grid-cols-2 gap-y-2.5 text-sm mb-4">
            <dt className="text-gov-textSec">{t('missionCase')}</dt>
            <dd className="font-semibold text-gov-navy text-right">{visitId}</dd>
            {farmer && (<><dt className="text-gov-textSec">{t('farmerLabel')}</dt><dd className="font-semibold text-gov-navy text-right">{farmer}</dd></>)}
            <dt className="text-gov-textSec">{t('cropLabelCheckin')}</dt>
            <dd className="font-semibold text-gov-navy text-right">{crop || '—'}</dd>
            <dt className="text-gov-textSec">{t('fieldLocation')}</dt>
            <dd className="font-semibold text-gov-navy text-right">{fieldName}</dd>
            {mission?.plotNumber && (
              <>
                <dt className="text-gov-textSec">{t('plotNumber')}</dt>
                <dd className="font-semibold text-gov-navy text-right">{mission.plotNumber}</dd>
              </>
            )}
            <dt className="text-gov-textSec">{t('studentLabel')}</dt>
            <dd className="font-semibold text-gov-navy text-right">{scout.name}</dd>
            <dt className="text-gov-textSec">{t('dateLabel')}</dt>
            <dd className="font-semibold text-gov-navy text-right">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</dd>
          </dl>

          <div className="border-t border-gray-100 pt-3 pb-2">
            <label className="block text-xs font-bold text-gov-textSec uppercase tracking-wide mb-1.5">
              {t('farmerAvailLabel')}
            </label>
            <select 
              value={farmerAvailabilities[mission?.id] || ''}
              onChange={(e) => updateFarmerAvailability(mission?.id, e.target.value)}
              className="w-full bg-white border border-gov-border rounded-lg p-2.5 text-sm focus:outline-none focus:border-gov-blue text-gov-navy font-semibold"
            >
              <option value="" disabled>{t('selectAvailability')}</option>
              <option value="Available">{t('availableOption')}</option>
              <option value="Unavailable">{t('unavailableOption')}</option>
              <option value="Not Contacted">{t('notContactedOption')}</option>
              <option value="Unable to Reach">{t('unableToReachOption')}</option>
            </select>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gov-textSec uppercase tracking-wide mb-2">{t('farmLocationCheckin')}</p>
            {!checkedIn ? (
              <div className="space-y-3">
                {distanceKm != null && (
                  <p className="text-xs text-gov-textSec">{t('assignedFieldApprox')} <span className="font-semibold text-gov-navy">{distanceKm} km</span> {t('away')}</p>
                )}
                <button
                  onClick={handleCheckIn}
                  className="w-full bg-gov-blue hover:bg-gov-navy text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin size={16} /> {t('checkInAtFarm')}
                </button>
                <p className="text-[11px] text-gov-textSec text-center">{t('simulatedCheckin')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-bold text-green-800 flex items-center gap-1.5"><CheckCircle2 size={15} /> {t('locationVerified')}</p>
                  <div className="grid grid-cols-2 gap-y-1.5 text-xs text-green-800 mt-2">
                    <span>{t('checkedIn')}</span><span className="font-semibold text-right">{checkinAt}</span>
                    <span>{t('assignedField')}</span><span className="font-semibold text-right">{fieldName}</span>
                    {distanceKm != null && (<><span>{t('distanceToField')}</span><span className="font-semibold text-right">{distanceKm} km</span></>)}
                    <span>{t('connectivity')}</span>
                    <span className="font-semibold text-right flex items-center justify-end gap-1">{isOnline ? <Wifi size={12} /> : <WifiOff size={12} />} {isOnline ? t('online') : t('offlineCapable')}</span>
                  </div>
                </div>
                <p className="text-[11px] text-gov-textSec text-center">{t('simulatedCheckin')}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowKit((v) => !v)}
            className="w-full mt-4 flex items-center justify-between text-xs font-bold text-gov-textSec border-t border-gray-100 pt-3"
          >
            <span className="flex items-center gap-1.5"><Package size={13} /> {t('fieldKitChecklist')}</span>
            <span>{Object.values(kitPacked).filter(Boolean).length}/{KIT_ITEMS.length} {t('packed')}</span>
          </button>
          {showKit && (
            <div className="space-y-1.5 mt-2">
              {KIT_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => setKitPacked((prev) => ({ ...prev, [item]: !prev[item] }))}
                  className="w-full flex items-center gap-2.5 text-left text-sm border border-gov-border rounded-lg px-3 py-2 hover:border-gov-blue"
                >
                  <span className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${kitPacked[item] ? 'bg-gov-blue border-gov-blue text-white' : 'bg-white border-gov-border text-transparent'}`}>
                    <CheckCircle2 size={14} />
                  </span>
                  <span className={kitPacked[item] ? 'text-gov-textSec line-through' : 'text-gov-navy font-medium'}>{KIT_ITEM_KEYS[item] ? t(KIT_ITEM_KEYS[item]) : item}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* STEP 1: Crop & Field details */}
      {step === 1 && (
        <Card>
          <CardHeader title={t('cropFieldDetails')} />
          {mission?.plotNumber && (
            <div className="bg-gov-bg border border-gov-border rounded-lg px-3 py-2.5 mb-3">
              <p className="text-[11px] font-bold text-gov-textSec uppercase tracking-wide">{t('plotNumber')}</p>
              <p className="text-sm font-bold text-gov-navy mt-0.5">{mission.plotNumber}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('cropLabelField')}><input className="input" value={crop} onChange={(e) => setCrop(e.target.value)} /></Field>
            <Field label={t('varietyLabel')}><input className="input" value={variety} onChange={(e) => setVariety(e.target.value)} /></Field>
            <Field label={t('growthStageLabel')}><input className="input" value={growthStage} onChange={(e) => setGrowthStage(e.target.value)} /></Field>
            <Field label={t('fieldAreaLabel')}><input className="input" value={area} onChange={(e) => setArea(e.target.value)} /></Field>
          </div>
        </Card>
      )}

      {/* STEP 2: Observation & symptoms */}
      {step === 2 && (
        <Card>
          <CardHeader title={t('fieldObservationSymptoms')} subtitle={t('fieldObservationSubtitle')} />
          <h4 className="text-sm font-bold text-gov-navy mb-2">{t('cropConditionLabel')}</h4>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {['Healthy', 'Mild stress', 'Moderate stress', 'Severe stress'].map((c) => (
              <button
                key={c}
                onClick={() => setCondition(c)}
                className={`text-left text-sm font-semibold px-3 py-3 rounded-lg border-2 transition-colors ${condition === c ? 'bg-gov-blue/10 border-gov-blue text-gov-blue font-bold' : 'border-gov-border text-gov-text'}`}
              >
                {CONDITION_KEYS[c] ? t(CONDITION_KEYS[c]) : c}
              </button>
            ))}
          </div>

          <h4 className="text-sm font-bold text-gov-navy mb-2">{t('symptomsObserved')}</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {symptomOptions.map((s) => (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                className={`text-xs font-bold px-3.5 py-2.5 rounded-full border-2 transition-colors ${symptoms.includes(s) ? 'bg-gov-blue text-white border-gov-blue' : 'bg-white text-gov-text border-gov-border'}`}
              >
                {s === 'No visible symptoms' ? t('noVisibleSymptoms') : s}
              </button>
            ))}
          </div>

          <label className="block text-xs font-bold text-gov-textSec uppercase tracking-wide mb-1.5">{t('fieldNotesLabel')}</label>
          <textarea
            value={fieldNotes}
            onChange={(e) => setFieldNotes(e.target.value)}
            rows={4}
            placeholder={t('fieldNotesPlaceholder')}
            className="w-full px-3 py-2.5 text-sm border border-gov-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gov-blue/30 focus:border-gov-blue"
          />
        </Card>
      )}

      {/* STEP 3: Evidence */}
      {step === 3 && (
        <Card>
          <CardHeader icon={Camera} title={t('evidenceCollection')} subtitle={`${evidencePhotos.length} / ${MAX_PHOTOS} ${t('photosSection').toLowerCase()} • ${t('prototypeStorageNote')}`} />
          <div className="space-y-4">
            {EVIDENCE_CATEGORIES.map((cat) => {
              const photosInCat = evidencePhotos.filter((p) => p.category === cat.key);
              return (
                <div key={cat.key} className="border border-gov-border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-gov-navy">{cat.label}</p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => addSamplePhoto(cat.key)}
                        disabled={evidencePhotos.length >= MAX_PHOTOS}
                        className="flex items-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-lg border border-gov-border text-gov-navy hover:border-gov-blue hover:bg-gov-blue/5 disabled:opacity-40 transition-colors"
                        title="Add demonstration sample photo"
                      >
                        <Camera size={12} /> {t('samplePhoto') || 'Sample'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openPickerFor(cat.key)}
                        disabled={evidencePhotos.length >= MAX_PHOTOS}
                        className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-gov-blue text-white hover:bg-gov-navy disabled:opacity-40 transition-colors"
                      >
                        <Upload size={12} /> {t('addPhoto')}
                      </button>
                    </div>
                  </div>
                  {photosInCat.length === 0 ? (
                    <p className="text-xs text-gov-textSec">{t('noPhotoAdded')}</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {photosInCat.map((p, i) => (
                        <div key={p.id} className="border border-gov-border rounded-lg overflow-hidden bg-white">
                          <div className="relative">
                            <img src={p.dataUrl} alt={`${cat.label} ${i + 1}`} className="aspect-square w-full object-cover" />
                            <button
                              onClick={() => removeEvidencePhoto(p.id)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <input
                            value={p.description}
                            onChange={(e) => updateEvidenceDescription(p.id, e.target.value)}
                            placeholder={cat.placeholder}
                            className="w-full text-[11px] border-0 border-t border-gov-border px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gov-blue/30"
                          />
                          <p className="text-[9px] text-green-700 font-semibold px-2 pb-1.5">✓ {p.capturedAt}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* STEP 4: Smart Trap & Field Conditions */}
      {step === 4 && (
        <Card>
          <CardHeader icon={ScanLine} title={t('smartTrapConditions')} subtitle={t('autoAvailableReadings')} />
          {trap ? (
            <div className="mb-5">
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <Info label={t('trapId')} value={trap.id} />
                <Info label={t('trapType')} value={trap.type} />
                <Info label={t('lastScan')} value={trap.lastScan} />
                <Info label={t('battery')} value={`${trap.battery}%`} />
              </div>

              {!trapResult && (
                <button
                  onClick={runTrapScan}
                  disabled={trapScanning}
                  className="w-full bg-gov-blue hover:bg-gov-navy text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2"
                >
                  {trapScanning ? <><Loader2 size={16} className="animate-spin" /> {t('scanningTrap')}</> : t('scanTrap')}
                </button>
              )}

              {trapResult && (
                <div className="space-y-3">
                  <div className="border border-gov-border rounded-xl p-4">
                    <p className="text-xs font-bold text-gov-textSec uppercase tracking-wide mb-2">{t('pestCount')}</p>
                    <div className="space-y-1.5 text-sm">
                      {Object.entries(trapResult.counts).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-gov-text flex items-center gap-1.5"><Bug size={13} className="text-gov-textSec" /> {k}</span>
                          <span className="font-bold text-gov-navy">{v}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-gray-100 font-bold">
                        <span className="text-gov-navy">{t('total')}</span>
                        <span className="text-gov-navy">{trapResult.total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-gov-bg rounded-lg p-2 border border-gov-border"><p className="text-gov-textSec">{t('previous')}</p><p className="font-bold text-gov-navy">{trapResult.previousTotal}</p></div>
                    <div className="bg-gov-bg rounded-lg p-2 border border-gov-border"><p className="text-gov-textSec">{t('current')}</p><p className="font-bold text-gov-navy">{trapResult.total}</p></div>
                    <div className="bg-red-50 rounded-lg p-2 border border-red-200"><p className="text-red-700">{t('change')}</p><p className="font-bold text-red-700">+{trapResult.changePct}%</p></div>
                  </div>

                  <div className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...(trap.history || []), { day: 'Now', count: trapResult.total }]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" width={24} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#e65100" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gov-textSec mb-2">{t('doesTrapLookCorrect')}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <VerifyBtn active={trapVerification === 'correct'} onClick={() => setTrapVerification('correct')} icon={ShieldCheck} label={t('looksCorrect')} color="green" />
                      <VerifyBtn active={trapVerification === 'incorrect'} onClick={() => setTrapVerification('incorrect')} icon={XCircle} label={t('incorrectCount')} color="red" />
                      <VerifyBtn active={trapVerification === 'unsure'} onClick={() => setTrapVerification('unsure')} icon={HelpCircle} label={t('notSure')} color="amber" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gov-textSec mb-5">{t('noTrapAssigned')}</p>
          )}

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gov-textSec uppercase tracking-wide mb-2">{t('fieldConditions')}</p>
            <div className="grid grid-cols-2 gap-3">
              <Reading icon={Thermometer} label={t('temperature')} value="28.4°C" />
              <Reading icon={Droplets} label={t('humidity')} value={`${reason.humidity}%`} />
              <Reading icon={Waves} label={t('soilMoisture')} value="62%" />
              <Reading icon={Waves} label={t('leafWetness')} value={reason.leafWetness} />
              <Reading icon={CloudRain} label={t('rainfall24h')} value="4.2 mm" />
            </div>
          </div>
        </Card>
      )}

      {/* STEP 5: Severity & Spread */}
      {step === 5 && (
        <Card>
          <CardHeader title={t('severitySpreadCard')} subtitle={t('scoutEstimate')} />
          <h4 className="text-sm font-bold text-gov-navy mb-2">{t('affectedAreaCard')}</h4>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {AFFECTED_AREA_OPTIONS.map((a) => (
              <button
                key={a}
                onClick={() => setAffectedArea(a)}
                className={`text-left text-sm font-semibold px-3 py-3 rounded-lg border-2 transition-colors ${affectedArea === a ? 'bg-gov-blue/10 border-gov-blue text-gov-blue font-bold' : 'border-gov-border text-gov-text'}`}
              >
                {AFFECTED_AREA_KEYS[a] ? t(AFFECTED_AREA_KEYS[a]) : a}
              </button>
            ))}
          </div>
          <h4 className="text-sm font-bold text-gov-navy mb-2">{t('spreadDistribution')}</h4>
          <div className="grid grid-cols-2 gap-2">
            {SPREAD_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSpread(s)}
                className={`text-left text-sm font-semibold px-3 py-3 rounded-lg border-2 transition-colors ${spread === s ? 'bg-gov-blue/10 border-gov-blue text-gov-blue font-bold' : 'border-gov-border text-gov-text'}`}
              >
                {SPREAD_KEYS[s] ? t(SPREAD_KEYS[s]) : s}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* STEP 6: AI Preliminary Assessment */}
      {step === 6 && (
        <Card>
          <CardHeader title={t('aiPrelimAssessmentCard')} />
          {evidencePhotos.length === 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
              {t('addEvidencePhotoHint')}
            </p>
          )}
          {!aiResult && !aiLoading && (
            <button onClick={runAiAssessment} className="w-full bg-gov-blue hover:bg-gov-navy text-white font-bold py-2.5 rounded-lg">
              {t('runAiAssessment')}
            </button>
          )}
          {aiLoading && (
            <div className="flex items-center justify-center gap-2 py-4 text-gov-blue text-sm font-semibold">
              <Loader2 size={16} className="animate-spin" /> {t('runningOnDevice')}
            </div>
          )}
          {aiResult && (
            <div className="border border-gov-border rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-gov-textSec uppercase tracking-wide">{t('possibleIssue')}</p>
              <div>
                <p className="text-base font-bold text-gov-navy">{aiResult.primary.label}</p>
                <p className="text-sm text-gov-textSec">{t('confidenceReport')}: {aiResult.primary.confidence}%</p>
              </div>
              <div className="text-xs text-gov-textSec space-y-0.5">
                {aiResult.alternatives.map((a) => (<p key={a.label}>{a.label} — {a.confidence}%</p>))}
              </div>
              <p className="text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
                {t('aiPrelimNote')}
              </p>
              <p className="text-[11px] text-gov-textSec">{t('aiDemoSimNote')}</p>
            </div>
          )}
        </Card>
      )}

      {/* STEP 7: Scout Verification */}
      {step === 7 && (
        <Card>
          <CardHeader title={t('scoutVerificationCard')} subtitle={t('scoutVerificationSubtitle')} />
          {aiResult ? (
            <p className="text-xs text-gov-textSec mb-3">{t('aiSuggested')} <span className="font-semibold text-gov-navy">{aiResult.primary.label}</span> ({aiResult.primary.confidence}%){t('doesObservationSupport')}</p>
          ) : (
            <p className="text-xs text-gov-textSec mb-3">{t('noAiAssessmentRun')}</p>
          )}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <VerifyBtn active={verificationStatus === 'consistent'} onClick={() => setVerificationStatus('consistent')} icon={ShieldCheck} label={t('looksConsistent')} color="green" />
            <VerifyBtn active={verificationStatus === 'incorrect'} onClick={() => setVerificationStatus('incorrect')} icon={XCircle} label={t('looksIncorrect')} color="red" />
            <VerifyBtn active={verificationStatus === 'unsure'} onClick={() => setVerificationStatus('unsure')} icon={HelpCircle} label={t('notSure')} color="amber" />
          </div>
          <label className="block text-xs font-bold text-gov-textSec uppercase tracking-wide mb-1.5">{t('verificationNoteLabel')}</label>
          <textarea
            value={verificationNote}
            onChange={(e) => setVerificationNote(e.target.value)}
            rows={3}
            placeholder={t('verificationNotePlaceholder')}
            className="w-full px-3 py-2.5 text-sm border border-gov-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gov-blue/30 focus:border-gov-blue"
          />
        </Card>
      )}

      {/* STEP 8: Field Visit Outcome */}
      {step === 8 && (
        <Card>
          <CardHeader icon={ClipboardCheck} title={t('fieldVisitOutcomeStep')} subtitle={t('fieldVisitOutcomeSubtitle')} />
          <div className="space-y-2 mb-4">
            {VISIT_OUTCOME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setVisitOutcome(opt.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  visitOutcome === opt.value
                    ? 'bg-gov-blue/10 border-gov-blue'
                    : 'border-gov-border hover:border-gov-blue/50 bg-white'
                }`}
              >
                <p className={`text-sm font-bold ${visitOutcome === opt.value ? 'text-gov-blue' : 'text-gov-navy'}`}>
                  {OUTCOME_LABEL_KEYS[opt.value] ? t(OUTCOME_LABEL_KEYS[opt.value]) : opt.label}
                </p>
                <p className="text-xs text-gov-textSec mt-0.5">
                  {OUTCOME_HINT_KEYS[opt.value] ? t(OUTCOME_HINT_KEYS[opt.value]) : opt.hint}
                </p>
              </button>
            ))}
          </div>
          <label className="block text-xs font-bold text-gov-textSec uppercase tracking-wide mb-1.5">{t('outcomeNotesLabel')}</label>
          <textarea
            value={outcomeNote}
            onChange={(e) => setOutcomeNote(e.target.value)}
            rows={3}
            placeholder={t('outcomeNotesPlaceholder')}
            className="w-full px-3 py-2.5 text-sm border border-gov-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gov-blue/30 focus:border-gov-blue"
          />
        </Card>
      )}

      {/* STEP 9: Review */}
      {step === 9 && (
        <Card>
          <CardHeader icon={ClipboardCheck} title={t('reviewFieldReport')} subtitle={t('whatOfficerWillSee')} />

          <ReviewSection title={t('fieldVisitSection')} onEdit={() => goToStep(0)} editLabel={t('editLabel')}>
            <Row label={t('missionCase')} value={visitId} />
            <Row label={t('studentLabel')} value={scout.name} />
            <Row label={t('checkIn')} value={checkinAt || '—'} />
            <Row label={t('locationLabel')} value={fieldName} />
            {mission?.plotNumber && <Row label={t('plotNumber')} value={mission.plotNumber} />}
          </ReviewSection>

          <ReviewSection title={t('cropSection')} onEdit={() => goToStep(1)} editLabel={t('editLabel')}>
            <Row label={t('cropLabelField')} value={crop || '—'} />
            <Row label={t('varietySection')} value={variety || '—'} />
            <Row label={t('growthStageSection')} value={growthStage || '—'} />
            <Row label={t('areaSection')} value={area ? `${area} ${t('acresUnit')}` : '—'} />
          </ReviewSection>

          <ReviewSection title={t('fieldObservationSection')} onEdit={() => goToStep(2)} editLabel={t('editLabel')}>
            <Row label={t('cropConditionSection')} value={CONDITION_KEYS[condition] ? t(CONDITION_KEYS[condition]) : condition} />
            <Row label={t('symptomsSection')} value={symptoms.length ? symptoms.map((s) => s === 'No visible symptoms' ? t('noVisibleSymptoms') : s).join(', ') : '—'} />
            {fieldNotes && <Row label={t('fieldNotesSection')} value={fieldNotes} />}
          </ReviewSection>

          <ReviewSection title={t('severitySection')} onEdit={() => goToStep(5)} editLabel={t('editLabel')}>
            <Row label={t('affectedAreaSection')} value={AFFECTED_AREA_KEYS[affectedArea] ? t(AFFECTED_AREA_KEYS[affectedArea]) : affectedArea || '—'} />
            <Row label={t('spreadSection')} value={SPREAD_KEYS[spread] ? t(SPREAD_KEYS[spread]) : spread || '—'} />
          </ReviewSection>

          <ReviewSection title={t('aiAssessmentSection')} onEdit={() => goToStep(6)} editLabel={t('editLabel')}>
            <Row label={t('resultLabel')} value={aiResult ? aiResult.primary.label : t('notRun')} />
            <Row label={t('confidenceSection')} value={aiResult ? `${aiResult.primary.confidence}%` : '—'} />
          </ReviewSection>

          <ReviewSection title={t('scoutVerificationSection')} onEdit={() => goToStep(7)} editLabel={t('editLabel')}>
            <Row label={t('verificationStatus')} value={verificationStatus ? (verificationStatus === 'consistent' ? t('looksConsistent') : verificationStatus === 'incorrect' ? t('looksIncorrect') : t('notSure')) : '—'} />
            {verificationNote && <Row label={t('verificationNote')} value={verificationNote} />}
          </ReviewSection>

          <ReviewSection title={t('fieldVisitOutcomeSection')} onEdit={() => goToStep(8)} editLabel={t('editLabel')}>
            <Row label={t('outcome')} value={visitOutcome ? (OUTCOME_LABEL_KEYS[visitOutcome] ? t(OUTCOME_LABEL_KEYS[visitOutcome]) : (VISIT_OUTCOME_OPTIONS.find((o) => o.value === visitOutcome)?.label || visitOutcome)) : '—'} />
            {outcomeNote.trim() && <Row label={t('notesLabel')} value={outcomeNote.trim()} />}
          </ReviewSection>

          <ReviewSection title={t('smartTrapConditionsSection')} onEdit={() => goToStep(4)} editLabel={t('editLabel')}>
            <Row label={t('trapCountLabel')} value={trapResult ? trapResult.total : trap ? t('notScanned') : t('noTrap')} />
            {trapResult && <Row label={t('trendLabel')} value={`+${trapResult.changePct}%`} />}
            <Row label={t('humiditySection')} value={`${reason.humidity}%`} />
          </ReviewSection>

          <ReviewSection title={t('evidenceSection')} onEdit={() => goToStep(3)} editLabel={t('editLabel')}>
            <Row label={t('photosSection')} value={evidencePhotos.length} />
            <Row label={t('categoriesSection')} value={[...new Set(evidencePhotos.map((p) => EVIDENCE_CATEGORIES.find((c) => c.key === p.category)?.label))].join(', ') || '—'} />
          </ReviewSection>

          <ReviewSection title={t('riskSection')} onEdit={() => goToStep(4)} editLabel={t('editLabel')}>
            <div className="flex items-center justify-between">
              <dt className="text-gov-textSec">{t('fieldRiskSection')}</dt>
              <dd><RiskChip level={risk.level} size="sm" /></dd>
            </div>
          </ReviewSection>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-green-800">{t('dataQualitySection')}</span>
              <span className="text-lg font-bold text-green-700">{dataQuality.score}%</span>
            </div>
            <div className="mt-2 space-y-1">
              {dataQuality.checks.map((c) => (
                <p key={c.label} className={`text-[11px] flex items-center gap-1.5 ${c.pass ? 'text-green-700' : 'text-gray-400'}`}>
                  {c.pass ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {c.label}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gov-border rounded-lg p-3 mb-4">
            <h4 className="text-sm font-bold text-gov-navy mb-2">{t('reportReadiness')}</h4>
            <div className="space-y-0.5 divide-y divide-gray-100">
              {readinessChecklist.map((item) => (
                <ReadinessItem
                  key={item.key}
                  label={item.label}
                  done={item.done}
                  onFix={() => goToStep(item.step)}
                  notRequired={item.notRequired}
                  notRequiredLabel={t('notRequired')}
                  fixLabel={t('fix')}
                />
              ))}
            </div>
          </div>

          <p className="text-xs text-gov-textSec mb-4">{t('reportWillBeSent')}</p>

          <button
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="w-full bg-gov-blue hover:bg-gov-navy disabled:opacity-50 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 size={17} className="animate-spin" /> {t('submitting')}</> : <><PartyPopper size={16} /> {t('submitFieldReport')}</>}
          </button>
        </Card>
      )}

      {/* Nav buttons */}
      {step < STEPS.length - 1 && (
        <div className="flex gap-3 sticky bottom-16 lg:bottom-2">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="flex-1 bg-white border border-gov-border text-gov-navy font-bold py-3 rounded-lg">
              {t('back')}
            </button>
          )}
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={(step === 0 && !checkedIn) || (step === 8 && !visitOutcome)}
            className="flex-1 bg-gov-blue hover:bg-gov-navy disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            {t('continueBtn')} <ArrowRight size={16} />
          </button>
        </div>
      )}
      {step === STEPS.length - 1 && (
        <button onClick={() => setStep((s) => s - 1)} className="w-full bg-white border border-gov-border text-gov-navy font-bold py-3 rounded-lg">
          {t('back')}
        </button>
      )}

      <FieldAssistant
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        context={assistantContext}
        onGoToStep={goToStep}
      />
    </div>
  );
}

const KIT_ITEMS = [
  'Smartphone / app',
  'Power bank / solar charger',
  'Hand lens / magnifying glass',
  'Sample bags / vials',
  'Gloves',
  'Soil pH / moisture kit',
  'Pest & disease reference booklet',
];

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold text-gov-textSec uppercase tracking-wide mb-1">{label}</span>
      {children}
    </label>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-gov-bg border border-gov-border rounded-lg p-2.5">
      <p className="text-gov-textSec">{label}</p>
      <p className="font-bold text-gov-navy mt-0.5">{value}</p>
    </div>
  );
}

function Reading({ icon: Icon, label, value }) {
  return (
    <div className="bg-gov-bg border border-gov-border rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-gov-textSec text-xs font-semibold"><Icon size={13} /> {label}</div>
      <p className="text-lg font-bold text-gov-navy mt-0.5">{value}</p>
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

function ReviewSection({ title, onEdit, editLabel, children }) {
  return (
    <div className="mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 last:mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-bold text-gov-textSec uppercase tracking-wide">{title}</p>
        <button onClick={onEdit} className="flex items-center gap-1 text-[11px] font-bold text-gov-blue">
          <Pencil size={11} /> {editLabel || 'Edit'}
        </button>
      </div>
      <dl className="space-y-1.5 text-sm">{children}</dl>
    </div>
  );
}

function VerifyBtn({ active, onClick, icon: Icon, label, color }) {
  const colorMap = {
    green: active ? 'bg-green-600 text-white border-green-600' : 'border-gov-border text-green-700',
    red: active ? 'bg-red-600 text-white border-red-600' : 'border-gov-border text-red-600',
    amber: active ? 'bg-amber-500 text-white border-amber-500' : 'border-gov-border text-amber-600',
  };
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1.5 py-3.5 rounded-lg border-2 text-xs font-bold transition-colors ${colorMap[color]}`}>
      <Icon size={20} /> {label}
    </button>
  );
}
