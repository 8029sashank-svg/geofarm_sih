import React, { useEffect, useRef, useState } from 'react';
import {
  Home,
  ClipboardList,
  BookOpen,
  Bell,
  User,
  Wifi,
  WifiOff,
  Plus,
  MapPin,
  ClipboardCheck,
  ArrowLeftRight,
  Map as MapIcon,
  MessageCircleQuestion,
  Menu,
  X,
} from 'lucide-react';
import { useScout } from '../ScoutContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import LanguageSelector from './LanguageSelector.jsx';

// Phase 1 — Agricultural Student Portal navigation.
// Legacy screen keys (missions, reports, guide, survey, trap) are still
// supported by ScoutApp.jsx router; the sidebar now exposes student terms.
//
// Grouped so every existing tool the portal already ships (Field Map,
// Field Assistant, Field Visit History) is reachable, not just the
// day-to-day core screens. No new screens are introduced here — every
// key below already resolves in ScoutApp.jsx's router.
// Still removed from primary nav (routes/files still exist for the demo):
// Chat with Farmers, Cluster Visits, Leaderboard, Certificates.
const NAV_GROUPS = [
  {
    labelKey: 'navGroupMain',
    items: [
      { key: 'dashboard',   label: 'Dashboard',       labelKey: 'navDashboard',   icon: Home },
      { key: 'nearby',      label: 'Nearby Cases',    labelKey: 'navNearby',      icon: MapPin },
      { key: 'assignments', label: 'My Assignments',  labelKey: 'navAssignments', icon: ClipboardList },
    ],
  },
  {
    labelKey: 'navGroupFieldTools',
    items: [
      { key: 'map',       label: 'Field Map',         labelKey: 'navFieldMap',       icon: MapIcon },
      { key: 'library',   label: 'Knowledge Library',  labelKey: 'navLibrary',        icon: BookOpen },
      { key: 'assistant', label: 'Field Assistant',    labelKey: 'navFieldAssistant', icon: MessageCircleQuestion },
    ],
  },
  {
    labelKey: 'navGroupActivity',
    items: [
      { key: 'notifications', label: 'Notifications',       labelKey: 'navNotifications', icon: Bell },
      { key: 'visits',        label: 'Field Visit History', labelKey: 'navVisitHistory',  icon: ClipboardCheck },
    ],
  },
  {
    labelKey: 'navGroupAccount',
    items: [
      { key: 'profile', label: 'My Profile', labelKey: 'navMyProfile', icon: User },
    ],
  },
];

// Flat list — used for lookups (active-state, mobile "more tools" panel).
const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

// Secondary tools that don't fit the 5-slot mobile bottom bar. Surfaced
// through the mobile "More" panel instead of being crammed into the tab
// bar (which would overflow on small screens).
const MOBILE_MORE_KEYS = ['map', 'library', 'assistant', 'visits'];

const MOBILE_NAV = [
  { key: 'dashboard',   label: 'Home',    labelKey: 'navHome',        icon: Home },
  { key: 'nearby',      label: 'Cases',   labelKey: 'navCases',       icon: MapPin },
  { key: 'visits',      label: 'Visit',   labelKey: 'navVisitTab',    icon: Plus,         primary: true },
  { key: 'assignments', label: 'Tasks',   labelKey: 'navAssignments', icon: ClipboardList },
  { key: 'profile',     label: 'Profile', labelKey: 'navMyProfile',   icon: User },
];

export default function AppShell({ screen, onNavigate, onEnterOfficer, children }) {
  const { scout, isOnline, toggleOnline, notifications } = useScout();
  const { t, isDevanagari } = useLanguage();
  const unread = notifications.filter((n) => !n.read).length;

  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Close the mobile "more tools" panel on outside click.
  useEffect(() => {
    if (!moreOpen) return undefined;
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [moreOpen]);

  const moreItems = ALL_NAV_ITEMS.filter((item) => MOBILE_MORE_KEYS.includes(item.key));

  return (
    <div className="min-h-screen bg-[#F2F4F0] flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-[#D9E0D9] sticky top-0 h-screen">

        {/* Brand header */}
        <div className="px-5 py-5 border-b border-[#E5EBE5]">
          <div className="flex items-center gap-3">
            {/* Geo-Farm logo badge */}
            <div className="w-10 h-10 rounded-lg bg-[#00381D] flex items-center justify-center shrink-0 shadow-sm p-1.5">
              <img
                src="/agriculture/geofarm-icon.png"
                alt="Geo-Farm"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-[#12200F] leading-none tracking-tight">Geo-Farm</p>
              <p className="text-[10px] text-[#5A8A5A] leading-tight mt-1 font-semibold uppercase tracking-wide">{t('studentPortal')}</p>
            </div>
          </div>
        </div>

        {/* Nav section label */}
        <p className="px-5 pt-5 pb-2 text-[10px] font-bold tracking-widest text-[#9AB09A] uppercase">
          {t('agriculturalStudent')}
        </p>

        {/* Nav items, grouped */}
        <nav className="flex-1 overflow-y-auto px-3 pb-2">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={group.labelKey} className={gIdx > 0 ? 'mt-4' : ''}>
              <p className="px-3 pb-1.5 text-[10px] font-bold tracking-widest text-[#AAB8AA] uppercase">
                {t(group.labelKey)}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = screen === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => onNavigate(item.key)}
                      aria-current={active ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 pl-3 pr-2.5 py-2.5 rounded-lg text-[13px] transition-colors relative border-l-[3px] ${
                        active
                          ? 'bg-[#EAF2EA] text-[#00381D] font-bold border-l-[#00592D]'
                          : 'text-[#3D4A3D] font-medium hover:bg-[#F4F7F4] border-l-transparent'
                      }`}
                    >
                      <item.icon size={16} strokeWidth={active ? 2.3 : 2} className={`shrink-0 ${active ? 'text-[#00592D]' : 'text-[#7C8C7C]'}`} />
                      <span className={`truncate ${isDevanagari ? 'font-devanagari' : ''}`}>
                        {item.labelKey ? t(item.labelKey) : item.label}
                      </span>
                      {item.key === 'notifications' && unread > 0 && (
                        <span className="ml-auto bg-[#B3261E] text-white text-[9px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1">
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3.5 py-3.5 border-t border-[#E5EBE5] space-y-3 bg-[#FAFCFA]">

          {/* Online/offline toggle */}
          <button
            onClick={toggleOnline}
            className={`w-full flex items-center gap-2 text-[11px] font-bold px-3 py-2 rounded-lg border transition-colors ${
              isOnline
                ? 'text-[#1E6B3C] bg-[#EAF6EE] border-[#CFE8D6] hover:bg-[#DDF0E3]'
                : 'text-[#9A5B12] bg-[#FBF1E5] border-[#F0DBBE] hover:bg-[#F7E8D2]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? 'bg-[#2E9B57]' : 'bg-[#D98A2B]'}`} />
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{isOnline ? t('online') : t('offline')}</span>
          </button>

          <LanguageSelector className="w-full justify-center" />

          {/* User info */}
          <div className="flex items-center gap-2.5 px-1 pt-1">
            <div className="w-8 h-8 rounded-full bg-[#00592D] text-white flex items-center justify-center text-[11px] font-bold shrink-0 ring-2 ring-white shadow-sm">
              {scout.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-[#1A2E1A] truncate">{scout.name}</p>
              <p className="text-[10px] text-[#8AAA8A] truncate">{t('agriculturalStudent')}</p>
            </div>
          </div>

          {/* Officer demo switch */}
          {onEnterOfficer && (
            <button
              onClick={onEnterOfficer}
              className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#7C8C7C] hover:text-[#12200F] hover:border-[#B9C7B9] border border-dashed border-[#D9E0D9] rounded-lg px-2.5 py-2 transition-colors"
              title="Demo role switch — not a real officer login"
            >
              <ArrowLeftRight size={11} /> {t('officerViewDemo')}
            </button>
          )}
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-[#D9E0D9] px-4 py-3 flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00381D] flex items-center justify-center p-1.5 shrink-0">
              <img
                src="/agriculture/geofarm-icon.png"
                alt="Geo-Farm"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[15px] font-bold text-[#12200F] tracking-tight">Geo-Farm</span>
          </div>
          <div className="flex items-center gap-3.5">
            <LanguageSelector compact />
            <button
              onClick={toggleOnline}
              aria-label={isOnline ? t('online') : t('offline')}
              className={`flex items-center justify-center w-9 h-9 rounded-lg ${isOnline ? 'text-[#1E6B3C] bg-[#EAF6EE]' : 'text-[#9A5B12] bg-[#FBF1E5]'}`}
            >
              {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
            </button>
            <button
              onClick={() => onNavigate('notifications')}
              className="relative flex items-center justify-center w-9 h-9 rounded-lg text-[#3D4A3D] hover:bg-[#F4F7F4]"
              aria-label="Notifications"
            >
              <Bell size={19} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 bg-[#B3261E] text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>

            {/* More tools — secondary items that don't fit the bottom tab
                bar (Field Map, Knowledge Library, Field Assistant, Field
                Visit History). Keeps the bottom bar at 5 slots. */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-[#3D4A3D] hover:bg-[#F4F7F4]"
                aria-label="More tools"
                aria-expanded={moreOpen}
              >
                {moreOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-11 w-60 bg-white border border-[#D9E0D9] rounded-xl shadow-[0_6px_20px_rgba(0,0,0,0.12)] py-1.5 z-30">
                  {moreItems.map((item) => {
                    const active = screen === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          setMoreOpen(false);
                          onNavigate(item.key);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] transition-colors ${
                          active ? 'text-[#00381D] font-bold bg-[#EAF2EA]' : 'text-[#3D4A3D] font-medium hover:bg-[#F4F7F4]'
                        }`}
                      >
                        <item.icon size={16} className={active ? 'text-[#00592D]' : 'text-[#7C8C7C]'} />
                        <span className={isDevanagari ? 'font-devanagari' : ''}>{item.labelKey ? t(item.labelKey) : item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {onEnterOfficer && (
              <button
                onClick={onEnterOfficer}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-[#7C8C7C] hover:bg-[#F4F7F4]"
                title="Demo role switch — not a real officer login"
                aria-label="Switch to officer view"
              >
                <ArrowLeftRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 pb-28 lg:pb-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#D9E0D9] flex items-stretch px-1 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {MOBILE_NAV.map((item) => {
            const active = screen === item.key;
            if (item.primary) {
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className="flex-1 flex flex-col items-center justify-center py-1.5 min-h-[56px]"
                  aria-label={item.labelKey ? t(item.labelKey) : item.label}
                >
                  <span className="w-12 h-12 -mt-6 rounded-full bg-[#00592D] text-white flex items-center justify-center shadow-[0_3px_10px_rgba(0,89,45,0.35)] ring-4 ring-[#F2F4F0]">
                    <item.icon size={21} />
                  </span>
                  <span className="text-[10px] font-bold text-[#00592D] mt-1">
                    {item.labelKey ? t(item.labelKey) : item.label}
                  </span>
                </button>
              );
            }
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] transition-colors ${
                  active ? 'text-[#00592D]' : 'text-[#9AAA9A]'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <item.icon size={20} strokeWidth={active ? 2.4 : 2} />
                <span className={`text-[10px] ${active ? 'font-bold' : 'font-semibold'}`}>{item.labelKey ? t(item.labelKey) : item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
