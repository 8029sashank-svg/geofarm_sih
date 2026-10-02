/**
 * Geo-Farm — Field Assistant engine
 *
 * A small, local (no network, no LLM API key) rule-based helper that turns
 * the CURRENT Field Visit state into contextual guidance for the student.
 * Supports multilingual output through optional translation helper `t`.
 */

import { DISEASE_GUIDE, KNOWLEDGE_LIBRARY, FIELD_GUIDE_SECTIONS, EVIDENCE_CATEGORIES } from '../mockData.js';

export const QUICK_ACTIONS = [
  { id: 'document', label: 'How do I document this?' },
  { id: 'photo', label: 'What photo should I take?' },
  { id: 'checkNext', label: 'What should I check next?' },
  { id: 'explainAI', label: 'Explain the AI result' },
  { id: 'missing', label: 'What is still missing?' },
  { id: 'spread', label: 'How should I assess spread?' },
];

const PHOTO_TIPS = FIELD_GUIDE_SECTIONS.find((s) => s.title === 'How to photograph a leaf')?.steps || [];

function contextSummary(ctx, t) {
  const bits = [];
  const cropPrefix = t ? t('cropLabel') || 'Crop' : 'Crop';
  const stagePrefix = t ? t('cropStage') || 'Stage' : 'Stage';
  const symptomsPrefix = t ? t('symptomsLabel') || 'Symptoms' : 'Symptoms';
  const severityPrefix = t ? t('severitySpread') || 'Severity' : 'Severity';

  if (ctx.crop) bits.push(`${cropPrefix}: ${ctx.crop}`);
  if (ctx.growthStage) bits.push(`${stagePrefix}: ${ctx.growthStage}`);
  if (ctx.symptoms?.length) bits.push(`${symptomsPrefix}: ${ctx.symptoms.join(', ')}`);
  if (ctx.affectedArea || ctx.spread) bits.push(`${severityPrefix}: ${[ctx.affectedArea, ctx.spread].filter(Boolean).join(' / ')}`);
  return bits;
}

function hasMeaningfulContext(ctx) {
  return !!(ctx.crop || ctx.symptoms?.length || ctx.evidencePhotos?.length || ctx.aiResult);
}

// Look up existing knowledge (never invent new disease/pest facts).
function findKnowledgeFor(label) {
  if (!label) return null;
  const norm = label.toLowerCase();
  const kb = KNOWLEDGE_LIBRARY.find((k) => k.title.toLowerCase() === norm);
  const guide = DISEASE_GUIDE.find((d) => d.name.toLowerCase() === norm);
  return kb || guide ? { kb, guide } : null;
}

function matchSymptomsToGuide(symptoms = []) {
  const usable = symptoms.filter((s) => s !== 'Other' && s !== 'No visible symptoms');
  if (!usable.length) return [];
  const lowerWords = usable.flatMap((s) => s.toLowerCase().split(/\s+/)).filter((w) => w.length > 3);
  return DISEASE_GUIDE.filter((d) => {
    const text = d.symptoms.toLowerCase();
    return lowerWords.some((w) => text.includes(w));
  });
}

function reply(heading, lines = [], opts = {}) {
  return { heading, lines, bullets: opts.bullets || null, cta: opts.cta || null };
}

function missingReply(ctx, t) {
  const missing = ctx.missingItems || [];
  if (missing.length === 0) {
    return reply(t ? t('aHeadingReadiness') : 'Report Readiness', [
      t ? t('aReadinessOk') : 'Nothing outstanding — every required item for this visit has been recorded.',
      t ? t('aReadinessDoubleCheck') : 'Double-check the Review step before you submit.',
    ], { cta: { label: t ? t('aGoToReview') : 'Go to Review', step: 9 } });
  }
  return reply(
    t ? t('aReadinessMissing') : 'Report Readiness — still missing',
    [t ? t('aReadinessMissingList') : 'Your report is still missing:'],
    {
      bullets: missing.map((m) => m.label),
      cta: { label: `${t ? t('aGoToMissingStep') : 'Go to missing step:'} ${missing[0].label}`, step: missing[0].step },
    }
  );
}

function documentReply(ctx, t) {
  const lines = [t ? t('aDocIntro') : 'Preliminary guidance for documenting this observation:'];
  const bullets = [
    t ? t('aDocBullet1') : 'Note what you actually saw, not a conclusion (e.g. "white powder-like patches on upper leaf surface" rather than "has powdery mildew").',
    t ? t('aDocBullet2') : 'Record where on the plant/field it appears and roughly how much of the field is affected.',
    t ? t('aDocBullet3') : 'Mention anything unusual about recent weather, irrigation, or neighboring fields.',
  ];
  if (ctx.symptoms?.length) {
    bullets.unshift(`${t ? t('aDocSymptomsPrefix') : "You've flagged:"} ${ctx.symptoms.join(', ')} ${t ? t('aDocSymptomsDescribe') : '— describe these in your own words in Field Notes.'}`);
  }
  if (!ctx.fieldNotes) {
    lines.push(t ? t('aDocEmptyNotes') : 'Field Notes is currently empty — a couple of specific sentences is enough.');
  }
  return reply(t ? t('aHeadingDoc') : 'Field guidance — documentation', lines, { bullets, cta: { label: t ? t('aGoToObservation') : 'Go to Observation', step: 2 } });
}

function photoReply(ctx, t) {
  const have = new Set((ctx.evidencePhotos || []).map((p) => p.category));
  const missingCats = EVIDENCE_CATEGORIES.filter((c) => !have.has(c.key));
  const lines = [t ? t('aPhotoConsider') : 'Consider capturing:'];
  const bullets = (missingCats.length ? missingCats : EVIDENCE_CATEGORIES).map((c) => `${c.label} — ${c.placeholder}`);
  const tips = PHOTO_TIPS.slice(0, 3);
  return reply(t ? t('aHeadingPhoto') : 'Field guidance — photo evidence', lines, {
    bullets: [...bullets, ...(tips.length ? ['—'] : []), ...tips],
    cta: { label: t ? t('aGoToEvidence') : 'Go to Evidence', step: 3 },
  });
}

function checkNextReply(ctx, t) {
  const byStep = {
    0: [t ? t('aCheckNextStep0_0') : 'Confirm farmer availability before you start.', t ? t('aCheckNextStep0_1') : 'Note the field kit items you actually have with you.'],
    1: [t ? t('aCheckNextStep1_0') : 'Record the growth stage as precisely as you can — officers use it to judge urgency.', t ? t('aCheckNextStep1_1') : 'Confirm crop and variety match what was assigned.'],
    2: [t ? t('aCheckNextStep2_0') : 'Check the underside of leaves, not just the top.', t ? t('aCheckNextStep2_1') : 'Note whether symptoms are on old growth, new growth, or both.'],
    3: [t ? t('aCheckNextStep3_0') : 'Capture both a wide field view and a close-up of the symptom.', t ? t('aCheckNextStep3_1') : 'Avoid blurry or very dark photos — retake if unclear.'],
    4: [t ? t('aCheckNextStep4_0') : 'If a smart trap is assigned, confirm the Trap ID before scanning.', t ? t('aCheckNextStep4_1') : 'Cross-check today\'s reading against the trend chart.'],
    5: [t ? t('aCheckNextStep5_0') : 'Estimate affected area conservatively — "more than 50%" should mean it, not a guess.', t ? t('aCheckNextStep5_1') : 'Note whether the spread is isolated or field-wide.'],
    6: [t ? t('aCheckNextStep6_0') : 'Run the AI assessment only after evidence is captured — it works from what you\'ve recorded.', t ? t('aCheckNextStep6_1') : 'Treat the result as a starting point, not the answer.'],
    7: [t ? t('aCheckNextStep7_0') : 'Compare the AI suggestion against what you actually saw in the field.', t ? t('aCheckNextStep7_1') : 'If unsure, mark "Not sure" rather than guessing.'],
    8: [t ? t('aCheckNextStep8_0') : 'Pick the outcome that matches what actually happened at the field — including Field Inaccessible or Revisit Required if that\'s the case.'],
    9: [t ? t('aCheckNextStep9_0') : 'Walk through the Report Readiness checklist before submitting.'],
  };
  const tips = byStep[ctx.step] || [t ? t('aCheckNextDefault') : 'Continue through the current step, then check Report Readiness before submitting.'];
  const prefix = t ? t('aCheckNextAt') : 'At';
  return reply(t ? t('aHeadingCheckNext') : 'Field guidance — what to check next', [`${prefix} "${ctx.stepLabel || ''}":`.trim()], { bullets: tips });
}

function explainAiReply(ctx, t) {
  if (!ctx.aiResult) {
    return reply(t ? t('aHeadingAI') : 'AI Preliminary Assessment', [
      t ? t('aAINotRun') : 'The AI preliminary assessment has not been run yet for this visit.',
      t ? t('aAICaptureFirst') : 'Capture at least one evidence photo first, then run it from the AI Assessment step.',
    ], { cta: { label: t ? t('aGoToAI') : 'Go to AI Assessment', step: 6 } });
  }
  const { primary, alternatives } = ctx.aiResult;
  const known = findKnowledgeFor(primary.label);
  const lines = [
    `${t ? t('aAIPrefix') : 'AI preliminary assessment: possible issue —'} ${primary.label} (${primary.confidence}% ${t ? t('confidence') : 'confidence'}).`,
    t ? t('aAINotDiagnosis') : 'This is a preliminary indication, not a confirmed diagnosis.',
  ];
  const bullets = [];
  if (known?.kb || known?.guide) {
    const identification = known.kb?.identification;
    if (identification) bullets.push(`${t ? t('aAIRefId') : 'Reference identification cue:'} ${identification}`);
  }
  bullets.push(t ? t('aAICompare') : 'Compare this against what you actually observed in the field.');
  if (ctx.evidencePhotos?.length) {
    bullets.push(`${ctx.evidencePhotos.length} ${t ? t('aAIPhotosRecorded') : 'evidence photo(s) recorded — check they clearly show the symptom.'}`);
  } else {
    bullets.push(t ? t('aAINoPhotos') : 'No evidence photo recorded yet — add one before relying on this result.');
  }
  if (alternatives?.length) {
    bullets.push(`${t ? t('aAIOtherPossibilities') : 'Other possibilities the model considered:'} ${alternatives.map((a) => `${a.label} (${a.confidence}%)`).join(', ')}.`);
  }
  bullets.push(t ? t('aAIVerify') : 'Verify before submission using Scout Verification, and request officer review if unsure.');
  return reply(t ? t('aHeadingAI') : 'Field guidance — AI result explained', lines, { bullets, cta: { label: t ? t('aGoToVerification') : 'Go to Scout Verification', step: 7 } });
}

function spreadReply(ctx, t) {
  const lines = [t ? t('aSpreadIntro') : 'Field guidance — assessing spread:'];
  const bullets = [
    t ? t('aSpreadIsolated') : 'Isolated plants: a few plants here and there, not connected.',
    t ? t('aSpreadScattered') : 'Scattered patches: small clusters spread across the field.',
    t ? t('aSpreadWidespread') : 'Widespread: most of the field shows some sign.',
    t ? t('aSpreadFieldWide') : 'Field-wide: essentially the whole field is affected.',
  ];
  if (ctx.affectedArea || ctx.spread) {
    lines.push(`${t ? t('aSpreadCurrently') : 'Currently recorded:'} ${[ctx.affectedArea, ctx.spread].filter(Boolean).join(' / ') || '—'}.`);
  }
  return reply(t ? t('aHeadingSpread') : 'Field guidance — severity & spread', lines, { bullets, cta: { label: t ? t('aGoToSeverity') : 'Go to Severity & Spread', step: 5 } });
}

function unsureReply(t) {
  return reply(t ? t('aHeadingUnsure') : 'When you are unsure', [
    t ? t('aUnsure1') : "I don't have enough field evidence yet to say more.",
    t ? t('aUnsure2') : 'Check the affected leaves closely, capture a clear close-up and a wider view, and record how far the symptom has spread before drawing any conclusion.',
    t ? t('aUnsure3') : 'If you remain unsure after that, mark your verification as "Not sure" and flag the report for officer review or a revisit — the officer has final authority, not the AI or the app.',
  ]);
}

function symptomKnowledgeReply(ctx, t) {
  const matches = matchSymptomsToGuide(ctx.symptoms);
  if (!matches.length) {
    return unsureReply(t);
  }
  const lines = [t ? t('aSymptomRefIntro') : 'Field guidance based on the symptoms you\'ve recorded:'];
  const bullets = matches.slice(0, 3).map((d) => `${d.name} (${d.crop}) is typically described as: ${d.symptoms}`);
  bullets.push(t ? t('aSymptomRefSuffix') : 'These are reference patterns only — confirm with a clear close-up photo and record what you actually see.');
  return reply(t ? t('aHeadingSymptomRef') : 'Field guidance — symptom reference', lines, { bullets, cta: { label: t ? t('aGoToEvidenceStep') : 'Open Evidence step', step: 3 } });
}

function fallbackReply(ctx, t) {
  if (!hasMeaningfulContext(ctx)) {
    return reply(t ? t('aHeadingFallback') : 'Field Assistant', [
      t ? t('aFallbackNoData1') : "I don't have much field data to go on yet.",
      t ? t('aFallbackNoData2') : 'Start by recording the crop and any symptoms you can see, then ask me again — I\'ll use what you\'ve entered.',
    ]);
  }
  return reply(t ? t('aHeadingFallback') : 'Field Assistant', [
    t ? t('aFallbackHelp') : 'I can help with documentation, photo evidence, next steps, the AI result, report readiness, or assessing spread.',
    t ? t('aFallbackTry') : 'Try one of the quick questions below, or ask in your own words.',
  ]);
}

export function respondToQuickAction(id, ctx, t) {
  switch (id) {
    case 'document': return documentReply(ctx, t);
    case 'photo': return photoReply(ctx, t);
    case 'checkNext': return checkNextReply(ctx, t);
    case 'explainAI': return explainAiReply(ctx, t);
    case 'missing': return missingReply(ctx, t);
    case 'spread': return spreadReply(ctx, t);
    default: return fallbackReply(ctx, t);
  }
}

export function respondToQuestion(text, ctx, t) {
  const q = (text || '').toLowerCase().trim();
  if (!q) return fallbackReply(ctx, t);

  if (/unsure|not sure|don.?t know|confus|no idea|खात्री नाही/.test(q)) return unsureReply(t);
  if (/photo|picture|image|capture|shot|फोटो|चित्र/.test(q)) return photoReply(ctx, t);
  if (/missing|ready|readiness|complete|submit|बाकी|तयारी/.test(q)) return missingReply(ctx, t);
  if (/\bai\b|assessment|preliminary|confidence|diagnos|मूल्यांकन|निदान/.test(q)) return explainAiReply(ctx, t);
  if (/spread|severity|widespread|area affected|प्रसार|तीव्रता/.test(q)) return spreadReply(ctx, t);
  if (/document|record|note|write|नोंद|कसे/.test(q)) return documentReply(ctx, t);
  if (/next|what should i do|check|पुढे|काय/.test(q)) return checkNextReply(ctx, t);
  if (/symptom|mean|what is this|what does this|लक्षण/.test(q)) return symptomKnowledgeReply(ctx, t);
  if (/revisit|officer|escalate|verify|पुनर्भेट|अधिकारी/.test(q)) {
    return reply(t ? t('aHeadingRevisit') : 'When to ask for a revisit / officer review', [
      t ? t('aRevisit1') : 'Request a revisit or flag for officer review when: evidence is inconclusive, you were unable to access part of the field, or your own observation disagrees with the AI result.',
      t ? t('aRevisit2') : 'The Agriculture Officer has final authority — the AI result and your verification are both inputs to that review, not the final word.',
    ], { cta: { label: t ? t('aGoToOutcome') : 'Go to Field Visit Outcome', step: 8 } });
  }

  return fallbackReply(ctx, t);
}

export { contextSummary, hasMeaningfulContext };
