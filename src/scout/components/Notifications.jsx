import React, { useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle2, Clock } from 'lucide-react';
import { useScout } from '../ScoutContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

const LEVEL_STYLE = {
  critical: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  warning: { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  success: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
};

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useScout();
  const { t } = useLanguage();

  useEffect(() => {
    markAllNotificationsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLocalizedTitle = (n) => {
    if (n.id === 'N1') return t('notifTitle_N1');
    if (n.id === 'N2') return t('notifTitle_N2');
    if (n.id === 'N3') return t('notifTitle_N3');
    if (n.id === 'N4') return t('notifTitle_N4');
    if (n.title === 'New assignment') return t('notifTitle_new_assignment');
    return n.title;
  };

  const getLocalizedBody = (n) => {
    if (n.id === 'N1') return t('notifBody_N1');
    if (n.id === 'N2') return t('notifBody_N2');
    if (n.id === 'N3') return t('notifBody_N3');
    if (n.id === 'N4') return t('notifBody_N4');
    return n.body;
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gov-navy">{t('notificationsTitle')}</h1>
          <p className="text-sm text-gov-textSec mt-0.5">{t('notificationsSubtitle')}</p>
        </div>
      </div>

      <div className="space-y-2">
        {notifications.map((n) => {
          const style = LEVEL_STYLE[n.level] || LEVEL_STYLE.info;
          return (
            <button
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`w-full text-left rounded-xl border p-3.5 flex gap-3 ${style.bg} ${n.read ? 'opacity-70' : ''}`}
            >
              <style.icon size={18} className={`shrink-0 mt-0.5 ${style.color}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gov-navy">{getLocalizedTitle(n)}</p>
                <p className="text-xs text-gov-text mt-0.5">{getLocalizedBody(n)}</p>
                <p className="text-[11px] text-gov-textSec mt-1">{n.time}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-gov-blue shrink-0 mt-1" />}
            </button>
          );
        })}

        {notifications.length === 0 && (
          <div className="text-center py-10 text-sm text-gov-textSec">{t('noNotifications')}</div>
        )}
      </div>
    </div>
  );
}
