import React from 'react';
import { BadgeCheck, School, LogOut, IndianRupee, Wallet, MapPin, Phone, Clock } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { useScout } from '../ScoutContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

export default function Profile({ onLogout }) {
  const { scout, sessionCompletions } = useScout();
  const { t } = useLanguage();

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* ── IDENTITY ───────────────────────────────────────────── */}
      <div className="bg-white border border-gov-border rounded-xl shadow-card p-5 text-center">
        <div className="w-16 h-16 rounded-full bg-gov-navy text-white flex items-center justify-center text-lg font-bold mx-auto">
          {scout.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <h1 className="text-lg font-bold text-gov-navy mt-3">{scout.name}</h1>
        <p className="text-xs text-gov-textSec mt-0.5">{scout.role} · {scout.specialization}</p>
        <div className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
          <BadgeCheck size={13} /> {t('profileVerifiedBadge')}
        </div>
      </div>

      <Card>
        <CardHeader icon={School} title={t('scoutDetails')} />
        <dl className="space-y-2 text-sm">
          <Row label={t('scoutId')} value={scout.scoutId} />
          <Row label={t('college')} value={scout.college} />
          <Row label={t('programme')} value={scout.programme} />
          <Row label={t('department')} value={scout.department} />
          <Row label={t('year')} value={scout.year} />
          <Row label={t('specialization')} value={scout.specialization} />
        </dl>
      </Card>

      {/* ── FIELD ASSIGNMENT ───────────────────────────────────── */}
      <Card>
        <CardHeader icon={MapPin} title={t('sectionFieldAssignment')} />
        <dl className="space-y-2 text-sm">
          <Row label={t('assignedDistrict')} value={scout.district} />
          <Row label={t('assignedBlock')} value={scout.block} />
          <Row label={t('operatingRadius')} value={`${scout.operatingRadiusKm} km`} />
          <Row label={t('primaryCrops')} value={scout.primaryCrops.join(', ')} />
        </dl>
      </Card>

      {/* ── FIELD ACTIVITY ─────────────────────────────────────── */}
      <Card>
        <CardHeader icon={Clock} title={t('sectionFieldActivity')} subtitle={t('verifiedFieldDataQuality')} />
        <div className="grid grid-cols-2 gap-3">
          <Stat label={t('missionsCompleted')} value={scout.stats.missionsCompleted + sessionCompletions} />
          <Stat label={t('reportsSubmitted')} value={scout.stats.reportsSubmitted + sessionCompletions} />
          <Stat label={t('reportsVerified')} value={scout.stats.reportsVerified} />
          <Stat label={t('reportsAwaitingReview')} value={scout.stats.reportsAwaitingReview} />
          <Stat label={t('revisitRequests')} value={scout.stats.revisitRequests} />
          <Stat label={t('verificationRate')} value={`${scout.stats.verificationRate}%`} />
        </div>
        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-800">{t('fieldDataQuality')}</span>
            <span className="text-lg font-bold text-green-700">{scout.stats.dataQuality}%</span>
          </div>
        </div>
        <dl className="space-y-2 text-sm mt-3 pt-3 border-t border-gray-100">
          <Row label={t('lastFieldActivity')} value={scout.lastFieldActivity} />
          <Row label={t('lastSync')} value={scout.lastSync} />
        </dl>
      </Card>

      {/* ── ACCOUNT & CONTACT ──────────────────────────────────── */}
      <Card>
        <CardHeader icon={Phone} title={t('sectionAccountContact')} />
        <dl className="space-y-2 text-sm">
          <Row label={t('email')} value={scout.email} />
          <Row label={t('registeredPhone')} value={scout.phone} />
          <Row label={t('accountStatus')} value={<span className="text-green-700 font-bold">{scout.accountStatus}</span>} />
        </dl>
      </Card>

      {/* ── REIMBURSEMENT / FIELD VISITS ───────────────────────── */}
      <Card>
        <CardHeader icon={IndianRupee} title={t('reimbursementTitle')} subtitle={t('reimbursementSubtitle')} />
        <div className="space-y-3">
          <div className="border border-gov-border rounded-lg p-3 text-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-gov-navy">GF-1042 — Dindori</p>
                <p className="text-xs text-gov-textSec mt-0.5">{t('powderyMildewVisit')}</p>
              </div>
              <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs border border-green-200">
                {t('approvedLabel')}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gov-textSec">{t('stipendAmount')}</span>
              <span className="font-bold text-gov-navy">₹150</span>
            </div>
          </div>

          <div className="border border-gov-border rounded-lg p-3 text-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-gov-navy">GF-1038 — Niphad</p>
                <p className="text-xs text-gov-textSec mt-0.5">{t('fruitFlyVisit')}</p>
              </div>
              <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-xs border border-purple-200">
                {t('underReviewLabel')}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gov-textSec">{t('stipendAmount')}</span>
              <span className="font-bold text-gov-navy">₹150</span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader icon={Wallet} title={t('paymentDetails')} subtitle={t('paymentSubtitle')} />
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-orange-800 font-medium">
            {t('paymentWarning')}
          </p>
        </div>
        <dl className="space-y-2 text-sm">
          <Row label={t('upiId')} value="aarav-demo@upi" />
          <Row label={t('bankAccount')} value="••••4821" />
          <Row label={t('ifscCode')} value="DEMO0001234" />
          <Row label={t('status')} value={<span className="text-orange-600 font-bold">{t('demoNotVerified')}</span>} />
        </dl>
      </Card>

      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-600 border border-red-200 bg-red-50 rounded-lg py-3"
      >
        <LogOut size={15} /> {t('logOut')}
      </button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-gov-textSec">{label}</dt>
      <dd className="font-semibold text-gov-navy text-right">{value}</dd>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-gov-bg border border-gov-border rounded-lg p-3">
      <p className="text-2xl font-bold text-gov-navy">{value}</p>
      <p className="text-[11px] font-semibold text-gov-textSec">{label}</p>
    </div>
  );
}
