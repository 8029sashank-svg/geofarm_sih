import React from 'react';
import { Landmark, ArrowLeftRight, Inbox } from 'lucide-react';

/**
 * Agriculture Officer Portal shell (demo).
 *
 * This is a DEMO role switch, not real authentication — there is no
 * officer login. It exists so the Student <-> Officer report review
 * workflow can be demonstrated end-to-end in one build. Clearly labeled
 * as such in the header so it's never mistaken for a production access
 * control boundary.
 */
export default function OfficerShell({ children, onExitOfficer }) {
  return (
    <div className="min-h-screen bg-gov-bg flex flex-col">
      <header className="bg-white border-b border-gov-border sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gov-navy flex items-center justify-center shrink-0">
              <Landmark size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gov-navy leading-tight truncate">Geo-Farm — Agriculture Officer</p>
              <p className="text-[11px] text-amber-700 font-semibold leading-tight flex items-center gap-1">
                <Inbox size={11} /> Demo role view — not a real officer login
              </p>
            </div>
          </div>
          <button
            onClick={onExitOfficer}
            className="flex items-center gap-1.5 text-xs font-bold text-gov-textSec hover:text-gov-navy border border-gov-border rounded-lg px-3 py-2 shrink-0"
          >
            <ArrowLeftRight size={13} /> <span className="hidden sm:inline">Back to Student Portal</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 pb-10">{children}</main>
    </div>
  );
}
