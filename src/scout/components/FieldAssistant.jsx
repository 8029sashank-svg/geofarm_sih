import React, { useEffect, useRef, useState } from 'react';
import { X, MessageCircleQuestion, Send, ArrowRight, Sparkles } from 'lucide-react';
import { QUICK_ACTIONS, respondToQuestion, respondToQuickAction, contextSummary, hasMeaningfulContext } from '../utils/fieldAssistant.js';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

/**
 * Field Assistant — contextual, in-visit help for the Field Visit workflow.
 */
export default function FieldAssistant({ open, onClose, context, onGoToStep }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  if (!open) return null;

  const qaMap = {
    document: t('qaDocument'),
    photo: t('qaPhoto'),
    checkNext: t('qaCheckNext'),
    explainAI: t('qaExplainAI'),
    missing: t('qaMissing'),
    spread: t('qaSpread'),
  };

  const pushExchange = (questionLabel, answer) => {
    setMessages((prev) => [
      ...prev,
      { id: `q-${Date.now()}`, role: 'question', text: questionLabel },
      { id: `a-${Date.now() + 1}`, role: 'answer', payload: answer },
    ]);
  };

  const handleQuickAction = (action) => {
    const questionText = qaMap[action.id] || action.label;
    pushExchange(questionText, respondToQuickAction(action.id, context, t));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    pushExchange(text, respondToQuestion(text, context, t));
    setInput('');
  };

  const handleGoTo = (step) => {
    onGoToStep?.(step);
    onClose?.();
  };

  const summary = contextSummary(context, t);
  const hasContext = hasMeaningfulContext(context);

  return (
    <div className="fixed inset-0 z-50 flex sm:items-stretch sm:justify-end">
      {/* Backdrop — plain, no blur */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel: bottom sheet on mobile, right side panel on larger screens */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('fieldAssistantTitle')}
        className="relative w-full sm:w-[400px] sm:max-w-[92vw] bg-white border-t sm:border-t-0 sm:border-l border-gov-border rounded-t-2xl sm:rounded-none shadow-xl mt-auto sm:mt-0 max-h-[85vh] sm:max-h-none sm:h-full flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gov-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gov-bg border border-gov-border flex items-center justify-center shrink-0">
              <MessageCircleQuestion size={16} className="text-gov-blue" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gov-navy leading-tight">{t('fieldAssistantTitle')}</h2>
              <p className="text-[11px] text-gov-textSec leading-tight truncate">{t('fieldAssistantSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-gov-textSec hover:bg-gov-bg hover:text-gov-navy"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current context strip */}
        <div className="px-4 py-2.5 border-b border-gov-border bg-gov-bg/60 shrink-0">
          {hasContext ? (
            <div className="flex flex-wrap gap-1.5">
              {summary.map((s) => (
                <span key={s} className="text-[11px] font-semibold bg-white border border-gov-border rounded-full px-2.5 py-1 text-gov-navy">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gov-textSec">{t('noFieldDataYet')}</p>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {messages.length === 0 && (
            <p className="text-xs text-gov-textSec">
              {t('assistantIntro')}
            </p>
          )}

          {messages.map((m) =>
            m.role === 'question' ? (
              <div key={m.id} className="flex justify-end">
                <span className="max-w-[85%] text-xs font-semibold text-white bg-gov-navy rounded-lg px-3 py-2">{m.text}</span>
              </div>
            ) : (
              <div key={m.id} className="border border-gov-border rounded-lg p-3 bg-white">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gov-blue mb-1.5 flex items-center gap-1">
                  <Sparkles size={11} /> {m.payload.heading}
                </p>
                {m.payload.lines.map((line, i) => (
                  <p key={i} className="text-[13px] text-gov-text leading-snug mb-1 last:mb-0">{line}</p>
                ))}
                {m.payload.bullets && (
                  <ul className="mt-1.5 space-y-1">
                    {m.payload.bullets.map((b, i) => (
                      b === '—'
                        ? <li key={i} className="border-t border-gray-100 my-1" />
                        : <li key={i} className="text-[12.5px] text-gov-textSec pl-3 relative leading-snug">
                            <span className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-gov-blue/60" />
                            {b}
                          </li>
                    ))}
                  </ul>
                )}
                {m.payload.cta && (
                  <button
                    onClick={() => handleGoTo(m.payload.cta.step)}
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-gov-blue hover:bg-gov-navy rounded-lg py-2"
                  >
                    {m.payload.cta.label} <ArrowRight size={13} />
                  </button>
                )}
              </div>
            )
          )}
        </div>

        {/* Quick actions */}
        <div className="px-4 pt-2 pb-1 border-t border-gov-border shrink-0">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.id}
                onClick={() => handleQuickAction(a)}
                className="text-[12px] font-semibold text-gov-navy bg-gov-bg border border-gov-border rounded-full px-3 py-1.5 hover:border-gov-blue hover:text-gov-blue"
              >
                {qaMap[a.id] || a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type a question */}
        <form onSubmit={handleSubmit} className="px-4 pb-4 pt-1 shrink-0 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('askPlaceholder')}
            className="flex-1 text-sm border border-gov-border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gov-blue/30 focus:border-gov-blue"
          />
          <button
            type="submit"
            aria-label="Ask"
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-lg bg-gov-blue hover:bg-gov-navy text-white disabled:opacity-40"
            disabled={!input.trim()}
          >
            <Send size={16} />
          </button>
        </form>

        <p className="px-4 pb-3 text-[10px] text-gov-textSec/80 text-center shrink-0">
          {t('assistantDisclaimer')}
        </p>
      </div>
    </div>
  );
}
