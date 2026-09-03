import React from 'react';
import { Users, ShieldAlert, CreditCard, Activity, Calendar, Lock, Unlock, RefreshCw, FileText } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import AdminCharts from '../components/AdminCharts';
import styles from './DashboardTab.module.css';

export const DashboardTab = ({ metrics, isRevenueUnlocked, onOpenUnlockModal, onLockVault, onDownloadManual }) => {
  const {
    totalPatients,
    activeTreatments,
    activeTherapists,
    todaysSessionsCount,
    revenueAccrued,
    revenuePaid,
    revenuePending,
    noSessionsAssignments,
    pendingPaymentsAssignments,
    recentSessions,
    allAssignments,
    refresh
  } = metrics;

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className={styles.container}>
      {/* Clinic Greeting Banner & Executive Toolbar */}
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeTitleBlock}>
          <div className={styles.titleRow}>
            <h2 className={styles.welcomeTitle}>Clinic Executive Control</h2>
            {!isRevenueUnlocked ? (
              <Button size="sm" variant="outline" onClick={onOpenUnlockModal} className={styles.vaultBtn}>
                <Lock size={13} style={{ marginRight: 4, color: 'var(--warning)' }} /> Unlock Revenue Vault
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={onLockVault} className={styles.vaultBtn}>
                <Unlock size={13} style={{ marginRight: 4, color: 'var(--success)' }} /> Financial Vault Unlocked (Lock)
              </Button>
            )}
          </div>
          <p className={styles.welcomeSubtitle}>
            Welcome, Administrator. Real-time clinical roster & revenue diagnostics are synced.
          </p>
        </div>

        <div className={styles.toolbarRight}>
          {onDownloadManual && (
            <Button size="sm" variant="accent" onClick={onDownloadManual}>
              <FileText size={13} style={{ marginRight: 4 }} /> Executive Manual PDF
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={refresh}>
            <RefreshCw size={13} style={{ marginRight: 4 }} /> Refresh Stream
          </Button>
          <div className={styles.dateBadge}>{todayDateString}</div>
        </div>
      </div>

      {/* Actionable Clinical Alert Banners */}
      {(noSessionsAssignments.length > 0 || pendingPaymentsAssignments.length > 0) && (
        <div className={styles.alertsContainer}>
          {noSessionsAssignments.length > 0 && (
            <div className={styles.alertBanner}>
              <ShieldAlert size={18} style={{ color: 'var(--warning)' }} />
              <div>
                <strong>⚠️ {noSessionsAssignments.length} Inactive Treatment Plan(s):</strong> Cases registered with 0 sessions logged. Check assignments roster.
              </div>
            </div>
          )}

          {isRevenueUnlocked && pendingPaymentsAssignments.length > 0 && (
            <div className={styles.alertBannerDanger}>
              <CreditCard size={18} style={{ color: 'var(--danger)' }} />
              <div>
                <strong>💳 {pendingPaymentsAssignments.length} Outstanding Payment(s):</strong> Pending dues needing billing settlement follow-up.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upper Metrics Grid */}
      <div className={styles.metricsGrid}>
        <Card title="Total Patients Registered" className={`${styles.metricCard} glass-panel`}>
          <div className={styles.metricContent}>
            <Users size={28} style={{ color: 'var(--primary)' }} />
            <div className={styles.metricValBlock}>
              <span className={styles.metricVal}>{totalPatients}</span>
              <span className={`${styles.metricTrend} ${styles.trendUp}`}>Active Directory</span>
            </div>
          </div>
        </Card>

        <Card title="Active Treatment Plans" className={`${styles.metricCard} glass-panel`}>
          <div className={styles.metricContent}>
            <Activity size={28} style={{ color: 'var(--accent)' }} />
            <div className={styles.metricValBlock}>
              <span className={styles.metricVal}>{activeTreatments}</span>
              <span className={`${styles.metricTrend} ${styles.trendUp}`}>Ongoing Rehab</span>
            </div>
          </div>
        </Card>

        <Card title="Rostered Therapists" className={`${styles.metricCard} glass-panel`}>
          <div className={styles.metricContent}>
            <Users size={28} style={{ color: 'var(--warning)' }} />
            <div className={styles.metricValBlock}>
              <span className={styles.metricVal}>{activeTherapists}</span>
              <span className={`${styles.metricTrend} ${styles.trendNeutral}`}>On Duty</span>
            </div>
          </div>
        </Card>

        <Card title="Today's Session Logs" className={`${styles.metricCard} glass-panel`}>
          <div className={styles.metricContent}>
            <Calendar size={28} style={{ color: 'var(--primary)' }} />
            <div className={styles.metricValBlock}>
              <span className={styles.metricVal}>{todaysSessionsCount}</span>
              <span className={`${styles.metricTrend} ${styles.trendUp}`}>
                {todaysSessionsCount > 0 ? 'Logs Recorded' : 'Waiting for logs'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Grid - Masked if non-Head */}
      <div className={styles.revenueGrid}>
        <Card title="Total Accrued Revenue" subtitle="Billed treatments combined" className={`${styles.revenueCard} glass-panel`}>
          <div className={styles.revenueItem}>
            {!isRevenueUnlocked ? (
              <div className={styles.maskedBox} onClick={onOpenUnlockModal}>
                <Lock size={16} /> <span>Restricted (Head Access)</span>
              </div>
            ) : (
              <span className={styles.revenueVal}>₹{revenueAccrued.toFixed(2)}</span>
            )}
          </div>
        </Card>

        <Card title="Settled Payments" subtitle="Cleared ledger entries" className={`${styles.revenueCard} glass-panel`}>
          <div className={styles.revenueItem}>
            {!isRevenueUnlocked ? (
              <div className={styles.maskedBox} onClick={onOpenUnlockModal}>
                <Lock size={16} /> <span>Restricted (Head Access)</span>
              </div>
            ) : (
              <span className={styles.revenueVal} style={{ color: 'var(--primary)' }}>
                ₹{revenuePaid.toFixed(2)}
              </span>
            )}
          </div>
        </Card>

        <Card title="Unsettled Payouts" subtitle="Outstanding billing balance" className={`${styles.revenueCard} glass-panel`}>
          <div className={styles.revenueItem}>
            {!isRevenueUnlocked ? (
              <div className={styles.maskedBox} onClick={onOpenUnlockModal}>
                <Lock size={16} /> <span>Restricted (Head Access)</span>
              </div>
            ) : (
              <span className={styles.revenueVal} style={{ color: 'var(--danger)' }}>
                ₹{revenuePending.toFixed(2)}
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Visual Analytics SVG Charts - Only Unlocked for Head */}
      {isRevenueUnlocked ? (
        <AdminCharts
          revenueAccrued={revenueAccrued}
          revenuePaid={revenuePaid}
          revenuePending={revenuePending}
          recentSessions={recentSessions}
          allAssignments={allAssignments}
        />
      ) : (
        <Card title="📊 Visual Analytics & Revenue Intelligence" className="glass-panel" style={{ marginBottom: 'var(--space-md)' }}>
          <div className={styles.vaultPlaceholder}>
            <Lock size={32} style={{ color: 'var(--warning)', marginBottom: 8 }} />
            <h4 style={{ margin: '0 0 4px 0' }}>Executive Revenue Analytics Vault Locked</h4>
            <p style={{ margin: '0 0 12px 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Interactive revenue streams, payment velocity histograms, and diagnosis distribution graphs are reserved for Head/Admin access.
            </p>
            <Button size="sm" variant="primary" onClick={onOpenUnlockModal}>
              Enter Head PIN to Unlock Analytics
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardTab;
