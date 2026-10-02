import React, { useState } from 'react';
import {
  Mail, Lock, IdCard, Loader2, ShieldCheck, ArrowRight, ArrowLeft,
  Satellite, Bug, ClipboardCheck, MapPin, Camera, Radar, Sparkles, UserCheck,
} from 'lucide-react';
import LanguageSelector from './LanguageSelector.jsx';
import { SCOUT_PROFILE } from '../mockData.js';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

// Inline wheat-spike SVG — no external dependency, pure decorative element
function WheatIcon({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Stem */}
      <line x1="20" y1="36" x2="20" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Left grains */}
      <ellipse cx="15" cy="28" rx="4.5" ry="2.5" transform="rotate(-30 15 28)" fill="currentColor" opacity="0.85" />
      <ellipse cx="13" cy="22" rx="4.5" ry="2.5" transform="rotate(-30 13 22)" fill="currentColor" opacity="0.70" />
      <ellipse cx="12" cy="16" rx="4" ry="2.2" transform="rotate(-30 12 16)" fill="currentColor" opacity="0.55" />
      {/* Right grains */}
      <ellipse cx="25" cy="28" rx="4.5" ry="2.5" transform="rotate(30 25 28)" fill="currentColor" opacity="0.85" />
      <ellipse cx="27" cy="22" rx="4.5" ry="2.5" transform="rotate(30 27 22)" fill="currentColor" opacity="0.70" />
      <ellipse cx="28" cy="16" rx="4" ry="2.2" transform="rotate(30 28 16)" fill="currentColor" opacity="0.55" />
      {/* Top tip */}
      <ellipse cx="20" cy="10" rx="2.5" ry="4" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

// Subtle repeating furrow/field-line texture for the brand panel — pure CSS,
// no external asset, kept faint so it reads as texture rather than pattern.
const FIELD_TEXTURE_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 28px)',
};

// Smooth-scroll to an in-page section. Used by the landing nav — every
// nav item points at a real section on this same page (no dead links).
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ════════════════════════════════════════════════════════════════════
   LANDING — pre-login introduction to Geo-Farm Field Operations.
   Visually inspired by the Farmers' Rights institutional site (clean
   white header, thin green institutional strip, large field imagery,
   spacious editorial layout) — content, branding and imagery are all
   Geo-Farm's own.
   ════════════════════════════════════════════════════════════════════ */

function LandingHeader({ t, onEnterLogin }) {
  return (
    <header className="sticky top-0 z-20 bg-white">
      {/* Thin institutional strip */}
      <div className="bg-[#E4EFE2] px-5 lg:px-10 py-1.5">
        <p className="max-w-[1400px] mx-auto text-[10.5px] font-medium tracking-wide text-[#3A5A3A]">
          Field Operations Platform · Maharashtra
        </p>
      </div>

      <div className="border-b border-[#E0E8E0]">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 h-16 flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => scrollToId('gf-top')}
            className="flex items-center gap-2.5 shrink-0"
          >
            <img src="/agriculture/geofarm-logo.png" alt="Geo-Farm" className="h-9 w-auto object-contain" />
            <span className="hidden sm:block text-[15px] font-bold text-[#1A2E1A] tracking-tight">
              Geo-Farm
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <button
              type="button"
              onClick={() => scrollToId('gf-about')}
              className="text-[13.5px] font-medium text-[#3A5A3A] hover:text-[#00592D] transition-colors"
            >
              {t('landingNavAbout')}
            </button>
            <button
              type="button"
              onClick={() => scrollToId('gf-how')}
              className="text-[13.5px] font-medium text-[#3A5A3A] hover:text-[#00592D] transition-colors"
            >
              {t('landingNavHow')}
            </button>
            <button
              type="button"
              onClick={onEnterLogin}
              className="text-[13.5px] font-medium text-[#3A5A3A] hover:text-[#00592D] transition-colors"
            >
              {t('landingNavField')}
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <LanguageSelector compact className="hidden sm:inline-flex" />
            <button
              type="button"
              onClick={onEnterLogin}
              className="bg-[#00592D] hover:bg-[#004825] text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {t('landingCtaFieldLogin')}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function LandingHero({ t, onEnterLogin }) {
  return (
    <section id="gf-about" className="bg-white">
      <div className="max-w-[1400px] mx-auto lg:px-10 lg:py-14">
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-14">
          {/* Image */}
          <div className="lg:w-[52%] shrink-0">
            <img
              src="/agriculture/cotton/cotton-field.jpg"
              alt="Field scout inspecting a cotton field in Maharashtra"
              className="w-full h-[300px] sm:h-[420px] lg:h-full lg:min-h-[480px] object-cover"
            />
          </div>

          {/* Text */}
          <div className="lg:w-[48%] flex flex-col justify-center px-5 py-10 lg:px-0 lg:py-0">
            <div className="flex items-center gap-2 text-[#00592D]">
              <WheatIcon size={15} className="text-[#00592D]" />
              <span className="text-[11px] font-semibold tracking-[0.16em] uppercase">
                {t('landingTagline')}
              </span>
            </div>

            <h1 className="mt-4 text-[30px] sm:text-[36px] lg:text-[40px] font-bold text-[#1A2E1A] leading-[1.12] tracking-tight max-w-md">
              {t('landingHeroHeading')}
            </h1>

            <p className="mt-5 text-[15px] text-[#4A6A4A] leading-relaxed max-w-md">
              {t('landingHeroDescription')}
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={onEnterLogin}
                className="inline-flex items-center gap-2 bg-[#00592D] hover:bg-[#004825] text-white text-[13.5px] font-bold px-6 py-3.5 rounded-xl transition-colors shadow-sm"
              >
                {t('landingCtaFieldLogin')}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingSecondSection({ t, onEnterLogin }) {
  const points = [
    { icon: MapPin, label: t('landingBullet1') },
    { icon: Camera, label: t('landingBullet2') },
    { icon: Radar, label: t('landingBullet3') },
    { icon: Sparkles, label: t('landingBullet4') },
    { icon: UserCheck, label: t('landingBullet5') },
  ];

  return (
    <section id="gf-how" className="bg-[#F7FAF7] border-y border-[#E0E8E0]">
      <div className="max-w-[1400px] mx-auto lg:px-10 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-14">
          {/* Image */}
          <div className="lg:w-[46%] shrink-0">
            <img
              src="/agriculture/grapes/vineyard.jpg"
              alt="Vineyard rows in a Maharashtra farming district"
              className="w-full h-[280px] sm:h-[380px] lg:h-full lg:min-h-[440px] object-cover"
            />
          </div>

          {/* Text */}
          <div className="lg:w-[54%] flex flex-col justify-center px-5 py-10 lg:px-0 lg:py-0">
            <h2 className="text-[26px] sm:text-[30px] font-bold text-[#1A2E1A] leading-tight tracking-tight max-w-lg">
              {t('landingSecondHeading')}
            </h2>

            <p className="mt-4 text-[14.5px] text-[#4A6A4A] leading-relaxed max-w-lg">
              {t('landingSecondDescription')}
            </p>

            <ul className="mt-7 space-y-3.5 max-w-lg">
              {points.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#E8EEE8] border border-[#C8D8C8] flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-[#00592D]" />
                  </span>
                  <span className="text-[13.5px] font-medium text-[#3A5A3A]">{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <button
                type="button"
                onClick={onEnterLogin}
                className="inline-flex items-center gap-2 border-2 border-[#00592D] text-[#00592D] hover:bg-[#00592D] hover:text-white text-[13.5px] font-bold px-6 py-3.5 rounded-xl transition-colors"
              >
                {t('landingCtaEnterOps')}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="bg-white border-t border-[#E0E8E0] px-5 lg:px-10 py-6">
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-[11px] text-[#7A9A7A]">
          Geo-Farm Field Operations · Agricultural Field Operations Portal
        </p>
        <img src="/agriculture/geofarm-icon.png" alt="" className="h-5 w-auto object-contain opacity-70" />
      </div>
    </footer>
  );
}

function LandingView({ t, onEnterLogin }) {
  return (
    <div id="gf-top" className="min-h-screen bg-white">
      <LandingHeader t={t} onEnterLogin={onEnterLogin} />
      <main>
        <LandingHero t={t} onEnterLogin={onEnterLogin} />
        <LandingSecondSection t={t} onEnterLogin={onEnterLogin} />
      </main>
      <LandingFooter />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   LOGIN — existing, unmodified functionality (demo auth, fields,
   language switching, verification flow). Only the entry point changed:
   it now renders after the landing introduction instead of immediately.
   ════════════════════════════════════════════════════════════════════ */

export default function Login({ onLogin, onShowVerify }) {
  const { t } = useLanguage();
  const [view, setView] = useState('landing'); // 'landing' | 'form'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Frontend demo only — authentication is simulated. Any credentials
    // resembling the demo scout account are accepted.
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 700);
  };

  const fillDemo = () => {
    setEmail(SCOUT_PROFILE.email);
    setStudentId(SCOUT_PROFILE.studentId);
    setPassword('••••••••');
  };

  if (view === 'landing') {
    return <LandingView t={t} onEnterLogin={() => setView('form')} />;
  }

  return (
    <div className="min-h-screen bg-[#F2F4F0] flex flex-col lg:flex-row">

      {/* ══════════════════════════════════════════════════════════════
          LEFT — Brand / institutional panel (hidden on very small
          screens to keep the login form the priority on mobile).
          ══════════════════════════════════════════════════════════════ */}
      <div
        className="relative hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between overflow-hidden bg-[#00381D] shrink-0"
        style={FIELD_TEXTURE_STYLE}
      >
        {/* Soft radial glow + base gradient, restrained agriculture palette */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00492A] via-[#00381D] to-[#012A15]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#2F7D4F]/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10 px-10 xl:px-14 pt-10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/60">
            <WheatIcon size={16} className="text-white/50" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase">
              Field Operations Platform
            </span>
          </div>
          <button
            type="button"
            onClick={() => setView('landing')}
            className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-[11px] font-medium transition-colors"
          >
            <ArrowLeft size={12} /> {t('landingBackToOverview')}
          </button>
        </div>

        <div className="relative z-10 px-10 xl:px-14 flex-1 flex flex-col justify-center max-w-lg">
          <img
            src="/agriculture/geofarm-logo.png"
            alt="Geo-Farm logo"
            className="h-24 w-auto object-contain mb-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
          />

          <h1 className="text-white text-[28px] xl:text-[32px] font-bold leading-tight tracking-tight">
            Field Operations &amp; Crop Surveillance
          </h1>
          <p className="text-white/70 text-[14px] mt-4 leading-relaxed">
            The Geo-Farm Field Scout Portal is where agricultural field scouts log
            crop disease &amp; pest surveillance visits, submit verified reports and
            coordinate with district officers — supporting early detection across
            Maharashtra&apos;s farming districts.
          </p>

          {/* Institutional feature strip — sober, informational, not marketing */}
          <div className="mt-10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Satellite size={15} className="text-white/80" />
              </div>
              <div>
                <p className="text-white text-[13px] font-semibold">Satellite &amp; field-data fusion</p>
                <p className="text-white/55 text-[12px] mt-0.5">Ground reports cross-checked with remote-sensing indicators</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Bug size={15} className="text-white/80" />
              </div>
              <div>
                <p className="text-white text-[13px] font-semibold">Early disease &amp; pest detection</p>
                <p className="text-white/55 text-[12px] mt-0.5">Structured scouting reduces outbreak response time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <ClipboardCheck size={15} className="text-white/80" />
              </div>
              <div>
                <p className="text-white text-[13px] font-semibold">Verified reporting chain</p>
                <p className="text-white/55 text-[12px] mt-0.5">Every field visit is logged, reviewed and traceable</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-10 xl:px-14 pb-8">
          <div className="border-t border-white/10 pt-4">
            <p className="text-white/40 text-[11px]">
              Geo-Farm Field Operations · Agricultural Field Operations Portal
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          RIGHT — Login card
          ══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Compact top bar — brand on mobile (left panel hidden), language selector always */}
        <div className="bg-[#00592D] lg:bg-white lg:border-b lg:border-[#E0E8E0] px-5 py-2.5 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setView('landing')}
            className="flex items-center gap-2 text-white/85 hover:text-white lg:text-[#3A5A3A] lg:hover:text-[#00592D] transition-colors"
          >
            <ArrowLeft size={14} />
            <img
              src="/agriculture/geofarm-logo.png"
              alt="Geo-Farm"
              className="h-6 w-auto object-contain lg:hidden"
            />
            <span className="hidden lg:inline text-[11px] font-semibold tracking-wide">
              Geo-Farm · Field Operations
            </span>
            <span className="lg:hidden text-white text-[11px] font-semibold tracking-wide">
              Geo-Farm · Field Operations
            </span>
          </button>
          <LanguageSelector compact />
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-[420px]">

            {/* Brand block — shown here on mobile only; on desktop the left
                panel already carries the branding, so keep this compact. */}
            <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="lg:hidden mb-5">
                <img
                  src="/agriculture/geofarm-logo.png"
                  alt="Geo-Farm logo"
                  className="h-16 w-auto object-contain mx-auto"
                />
              </div>

              <p className="hidden lg:block text-2xl font-bold text-[#1A2E1A] tracking-tight leading-none">
                Geo-Farm
              </p>
              <p className="hidden lg:block text-[11px] font-semibold text-[#00592D] mt-1 tracking-wider uppercase">
                Field Operations &amp; Crop Surveillance
              </p>

              {/* Institutional descriptor */}
              <div className="bg-[#E8EEE8] border border-[#C8D8C8] rounded-xl px-4 py-2.5 text-center lg:text-left max-w-sm mt-4 mx-auto lg:mx-0">
                <p className="text-[12px] text-[#3A5A3A] font-medium leading-snug">
                  Agricultural Student Field Operations Portal
                </p>
                <p className="text-[11px] text-[#5A7A5A] mt-0.5">
                  Maharashtra · Crop Disease &amp; Pest Surveillance
                </p>
              </div>
            </div>

            {/* ── Login card ── */}
            <div className="bg-white border border-[#D5DDD5] rounded-2xl shadow-[0_2px_12px_rgba(0,89,45,0.08)] overflow-hidden">

              {/* Card header */}
              <div className="bg-[#F7FAF7] border-b border-[#E0E8E0] px-6 py-4">
                <h1 className="text-[15px] font-bold text-[#1A2E1A]">{t('loginHeading')}</h1>
                <p className="text-[12px] text-[#5A7A5A] mt-0.5">
                  Sign in with your registered agricultural student credentials
                </p>
              </div>

              {/* Form */}
              <div className="px-6 py-5">
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#3A5A3A] uppercase tracking-wider mb-1.5">
                      {t('loginEmail')}
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AAA8A]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="aarav.patil@mpkv.ac.in"
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#C8D8C8] rounded-xl bg-[#FAFCFA] focus:outline-none focus:ring-2 focus:ring-[#00592D]/20 focus:border-[#00592D]/50 placeholder:text-gray-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Student ID */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#3A5A3A] uppercase tracking-wider mb-1.5">
                      {t('loginStudentId')}
                    </label>
                    <div className="relative">
                      <IdCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AAA8A]" />
                      <input
                        type="text"
                        required
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="AG2024-248"
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#C8D8C8] rounded-xl bg-[#FAFCFA] focus:outline-none focus:ring-2 focus:ring-[#00592D]/20 focus:border-[#00592D]/50 placeholder:text-gray-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#3A5A3A] uppercase tracking-wider mb-1.5">
                      {t('loginPassword')}
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AAA8A]" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#C8D8C8] rounded-xl bg-[#FAFCFA] focus:outline-none focus:ring-2 focus:ring-[#00592D]/20 focus:border-[#00592D]/50 placeholder:text-gray-400 transition-colors"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-700 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#00592D] hover:bg-[#004825] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-1 shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={17} className="animate-spin" /> {t('loginSigningIn')}
                      </>
                    ) : (
                      <>
                        {t('loginSignIn')} <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>

                {/* Demo fill */}
                <button
                  onClick={fillDemo}
                  type="button"
                  className="w-full mt-3 text-[12px] text-[#5A7A5A] hover:text-[#00592D] underline underline-offset-2 transition-colors"
                >
                  {t('loginFillDemo')}
                </button>

                {/* New scout registration */}
                <div className="mt-5 pt-4 border-t border-[#E8EEE8] text-center">
                  <button
                    onClick={onShowVerify}
                    className="text-[13px] font-semibold text-[#00592D] hover:text-[#004825] transition-colors"
                  >
                    {t('loginNewScout')}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Demo entry (bypass) ── */}
            <button
              onClick={onLogin}
              className="w-full mt-4 flex items-center justify-center gap-2 text-[13px] font-semibold text-[#3A5A3A] hover:text-[#00592D] border border-dashed border-[#C8D8C8] rounded-xl py-3 bg-white/60 hover:bg-white transition-colors"
            >
              <ShieldCheck size={15} /> {t('loginDemoScout')}
            </button>

            {/* ── Footer note ── */}
            <p className="text-center lg:text-left text-[11px] text-[#7A9A7A] mt-5 leading-relaxed">
              {t('loginFarmerNote')}
            </p>

          </div>
        </div>

        {/* ── Institutional footer (mobile only — desktop footer lives in the left panel) ── */}
        <div className="lg:hidden border-t border-[#D5DDD5] bg-white/60 px-5 py-3 text-center shrink-0">
          <p className="text-[10px] text-[#9AAA9A]">
            Geo-Farm Field Operations · Agricultural Field Operations Portal
          </p>
        </div>
      </div>

    </div>
  );
}
