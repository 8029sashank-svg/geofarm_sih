import React from 'react';
import { ArrowLeft, UserPlus, IdCard, ShieldCheck, BadgeCheck, Languages } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

export default function VerifyInfo({ onBack }) {
  const { t, language, toggleLanguage } = useLanguage();

  const STEPS = [
    { icon: UserPlus, title: t('verifyStep1Title'), desc: t('verifyStep1Desc') },
    { icon: IdCard, title: t('verifyStep2Title'), desc: t('verifyStep2Desc') },
    { icon: ShieldCheck, title: t('verifyStep3Title'), desc: t('verifyStep3Desc') },
    { icon: BadgeCheck, title: t('verifyStep4Title'), desc: t('verifyStep4Desc') },
  ];

  return (
    <div className="min-h-screen bg-gov-bg flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gov-textSec hover:text-gov-navy">
            <ArrowLeft size={16} /> {t('verifyBackLink')}
          </button>
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gov-border text-gov-navy shadow-sm hover:border-gov-blue transition-colors"
            title="Toggle Language"
          >
            <Languages size={14} /> {language === 'en' ? 'मराठी' : 'English'}
          </button>
        </div>

        <h1 className="text-xl font-bold text-gov-navy mb-1">{t('verifyTitle')}</h1>
        <p className="text-sm text-gov-textSec mb-6">
          {t('verifySubtitle')}
        </p>

        <div className="space-y-3">
          {STEPS.map((s, i) => (
            <div key={i} className="bg-white border border-gov-border rounded-xl p-4 flex gap-3 shadow-card">
              <div className="w-9 h-9 rounded-full bg-gov-bg border border-gov-border flex items-center justify-center shrink-0 text-xs font-bold text-gov-blue">
                {i + 1}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <s.icon size={15} className="text-gov-blue shrink-0" />
                  <h3 className="text-sm font-bold text-gov-navy">{s.title}</h3>
                </div>
                <p className="text-xs text-gov-textSec">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-gov-bg border border-gov-border rounded-xl p-4 text-xs text-gov-textSec">
          {t('verifyDemoNote')}{' '}
          <span className="font-semibold text-gov-navy">{t('verifyDemoBtn')}</span>{' '}
          {t('verifyDemoEnd')}
        </div>

        <button
          onClick={onBack}
          className="w-full mt-6 bg-gov-blue hover:bg-gov-navy text-white font-bold py-3 rounded-lg transition-colors"
        >
          {t('verifyBackToLogin')}
        </button>
      </div>
    </div>
  );
}
