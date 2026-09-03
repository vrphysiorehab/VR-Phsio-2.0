import React from 'react';
import Card from '../../../components/ui/Card';
import { TrendingUp } from 'lucide-react';

export const AdminCharts = ({ revenueAccrued, revenuePaid, revenuePending, recentSessions = [], allAssignments = [] }) => {
  // Compute diagnosis breakdown
  const diagnosisCounts = {};
  allAssignments.forEach((a) => {
    const diag = a.diagnosis ? a.diagnosis.trim() : 'General Physical Rehab';
    diagnosisCounts[diag] = (diagnosisCounts[diag] || 0) + 1;
  });

  const topDiagnoses = Object.entries(diagnosisCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const totalDiagCount = allAssignments.length || 1;

  // Compute daily session velocity
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const sessionCountsByDay = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  
  recentSessions.forEach((s) => {
    if (s.session_date) {
      const d = new Date(s.session_date).getDay();
      sessionCountsByDay[d] = (sessionCountsByDay[d] || 0) + 1;
    }
  });

  const maxSessionDay = Math.max(...Object.values(sessionCountsByDay), 1);

  // Financial percentages for visual bar
  const totalFinancial = Math.max(revenueAccrued, 1);
  const paidPct = Math.min(100, Math.round((revenuePaid / totalFinancial) * 100));
  const pendingPct = Math.min(100 - paidPct, Math.round((revenuePending / totalFinancial) * 100));

  return (
    <div style={styles.grid}>
      {/* 1. Revenue Ledger Visual Ratio */}
      <Card title="Revenue Stream & Settlement Ratio" subtitle="Accrued vs Settled vs Outstanding Dues" className="glass-panel">
        <div style={styles.chartBox}>
          <div style={styles.kpiHeader}>
            <div>
              <span style={styles.kpiSub}>Total Billed Ledger</span>
              <h3 style={styles.kpiVal}>₹{revenueAccrued.toFixed(2)}</h3>
            </div>
            <div style={styles.kpiBadge}>
              <TrendingUp size={14} style={{ marginRight: 4 }} /> {paidPct}% Collected
            </div>
          </div>

          {/* Visual SVG Progress Bar */}
          <div style={styles.barContainer}>
            <div style={{ ...styles.barSegment, width: `${paidPct}%`, backgroundColor: 'var(--primary)' }} title={`Settled: ₹${revenuePaid.toFixed(2)}`} />
            <div style={{ ...styles.barSegment, width: `${pendingPct}%`, backgroundColor: 'var(--danger)' }} title={`Pending: ₹${revenuePending.toFixed(2)}`} />
          </div>

          <div style={styles.legendRow}>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: 'var(--primary)' }} />
              <span>Settled (₹{revenuePaid.toFixed(2)})</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: 'var(--danger)' }} />
              <span>Outstanding (₹{revenuePending.toFixed(2)})</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Session Velocity Histogram */}
      <Card title="Weekly Session Stream Velocity" subtitle="Daily therapy session density" className="glass-panel">
        <div style={styles.histogramBox}>
          {daysOfWeek.map((dayName, idx) => {
            const count = sessionCountsByDay[idx] || 0;
            const barHeightPct = Math.max(12, Math.round((count / maxSessionDay) * 100));
            return (
              <div key={dayName} style={styles.histoCol}>
                <span style={styles.histoVal}>{count}</span>
                <div style={styles.histoTrack}>
                  <div
                    style={{
                      ...styles.histoFill,
                      height: `${barHeightPct}%`,
                      backgroundColor: count > 0 ? 'var(--accent)' : 'var(--border-color)'
                    }}
                  />
                </div>
                <span style={styles.histoLabel}>{dayName}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. Diagnosis Distribution Breakdown */}
      <Card title="Clinical Diagnosis Split" subtitle="Case classification distribution" className="glass-panel">
        <div style={styles.diagBox}>
          {topDiagnoses.length === 0 ? (
            <p style={styles.emptyText}>No treatment diagnoses logged yet.</p>
          ) : (
            topDiagnoses.map(([diagName, count]) => {
              const pct = Math.round((count / totalDiagCount) * 100);
              return (
                <div key={diagName} style={styles.diagItem}>
                  <div style={styles.diagHeader}>
                    <span style={styles.diagName}>{diagName}</span>
                    <span style={styles.diagVal}>{count} cases ({pct}%)</span>
                  </div>
                  <div style={styles.diagTrack}>
                    <div style={{ ...styles.diagFill, width: `${pct}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
    gap: 'var(--space-md)',
    marginBottom: 'var(--space-md)'
  },
  chartBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  kpiSub: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-secondary)'
  },
  kpiVal: {
    margin: 0,
    fontSize: 'var(--text-xl)',
    fontWeight: '800',
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif"
  },
  kpiBadge: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    backgroundColor: 'rgba(202, 159, 66, 0.15)',
    border: '1px solid var(--primary)',
    borderRadius: 'var(--radius-full)',
    color: 'var(--primary)',
    fontSize: '11px',
    fontWeight: '700'
  },
  barContainer: {
    height: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    display: 'flex'
  },
  barSegment: {
    height: '100%',
    transition: 'width var(--transition-normal)'
  },
  legendRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: 'var(--text-secondary)'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  histogramBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '130px',
    paddingTop: 'var(--space-md)'
  },
  histoCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
    height: '100%'
  },
  histoVal: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-secondary)'
  },
  histoTrack: {
    flex: 1,
    width: '18px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden'
  },
  histoFill: {
    width: '100%',
    borderRadius: 'var(--radius-sm)',
    transition: 'height var(--transition-normal)'
  },
  histoLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)'
  },
  diagBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)'
  },
  diagItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  diagHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px'
  },
  diagName: {
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  diagVal: {
    color: 'var(--text-secondary)'
  },
  diagTrack: {
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden'
  },
  diagFill: {
    height: '100%',
    backgroundColor: 'var(--primary)',
    borderRadius: 'var(--radius-full)'
  },
  emptyText: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)',
    fontStyle: 'italic'
  }
};

export default AdminCharts;
