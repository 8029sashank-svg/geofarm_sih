import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../../contexts/LanguageContext.jsx';

/**
 * English / Marathi / Hindi selector. Untranslated strings fall back to
 * English (see LanguageContext.t), so switching never breaks a screen.
 */
export default function LanguageSelector({ compact = false, className = '' }) {
  const { language, setLanguage } = useLanguage();
  const order = ['en', 'mr', 'hi'];
  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center rounded-md border border-gov-border bg-white overflow-hidden ${className}`}
    >
      {!compact && <Languages size={13} className="mx-1.5 text-gov-textSec shrink-0" />}
      {order.map((code) => {
        const active = language === code;
        const label = code === 'en' ? 'EN' : LANGUAGES[code].nativeLabel;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLanguage(code)}
            aria-pressed={active}
            className={`px-2 py-1 text-[11px] font-bold transition-colors ${
              active ? 'bg-gov-blue text-white' : 'text-gov-textSec hover:text-gov-blue'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
