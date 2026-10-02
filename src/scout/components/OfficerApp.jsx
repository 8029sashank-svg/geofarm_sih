import React, { useState } from 'react';
import OfficerShell from './OfficerShell.jsx';
import OfficerQueue from './OfficerQueue.jsx';
import OfficerReportDetail from './OfficerReportDetail.jsx';

/**
 * Agriculture Officer Portal (demo role) — root.
 *
 * Simple two-screen state router (queue -> report detail), mirroring the
 * lightweight state-based navigation pattern already used by ScoutApp.jsx
 * (no react-router in this project). Renders inside the same
 * <ScoutProvider> as the Student portal, so it reads/writes the same
 * `reports` / `missions` state — see ScoutContext.submitOfficerReview().
 */
export default function OfficerApp({ onExitOfficer }) {
  const [screen, setScreen] = useState('queue'); // 'queue' | 'reportDetail'
  const [activeReportId, setActiveReportId] = useState(null);

  const openReport = (id) => {
    setActiveReportId(id);
    setScreen('reportDetail');
  };

  return (
    <OfficerShell onExitOfficer={onExitOfficer}>
      {screen === 'reportDetail' ? (
        <OfficerReportDetail reportId={activeReportId} onBack={() => setScreen('queue')} />
      ) : (
        <OfficerQueue onOpenReport={openReport} />
      )}
    </OfficerShell>
  );
}
