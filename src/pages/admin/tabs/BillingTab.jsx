import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import SearchBar from '../../../components/ui/SearchBar';
import PaymentRecordModal from '../components/PaymentRecordModal';
import { CreditCard, FileSpreadsheet, Lock, CheckCircle, Clock } from 'lucide-react';

export const BillingTab = ({ billing = [], onMarkAsPaid, mutating, isRevenueUnlocked, onOpenUnlockModal }) => {
  const [filter, setFilter] = useState('all'); // all | paid | pending
  const [query, setQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filteredBilling = billing.filter((b) => {
    if (filter === 'paid' && !b.is_paid) return false;
    if (filter === 'pending' && b.is_paid) return false;

    if (query.trim()) {
      const q = query.toLowerCase();
      const patientName = `${b.patient?.first_name || ''} ${b.patient?.surname || ''}`.toLowerCase();
      const code = (b.patient?.patient_code || '').toLowerCase();
      return (
        patientName.includes(q) ||
        code.includes(q)
      );
    }

    return true;
  });

  // Calculate totals
  let totalAccrued = 0;
  let totalSettled = 0;
  let totalPending = 0;

  billing.forEach((b) => {
    const cost = Number(b.total_cost || 0);
    const paid = Number(b.amount_paid !== undefined && b.amount_paid !== null ? b.amount_paid : (b.is_paid ? cost : 0));
    totalAccrued += cost;
    totalSettled += paid;
    totalPending += Math.max(0, cost - paid);
  });

  const collectionRatePct = totalAccrued > 0 ? Math.round((totalSettled / totalAccrued) * 100) : 100;

  const handleExportCSV = () => {
    const headers = ["Patient Code", "Patient Name", "Primary Physio", "Sessions", "Cost Per Session", "Total Accrued", "Amount Paid", "Outstanding Dues", "Status"];
    const rows = billing.map((b) => {
      const pName = `${b.patient?.first_name || ''} ${b.patient?.surname || ''}`;
      const totalCost = Number(b.total_cost || 0);
      const paid = Number(b.amount_paid !== undefined && b.amount_paid !== null ? b.amount_paid : (b.is_paid ? totalCost : 0));
      const due = Math.max(0, totalCost - paid);
      const status = due === 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";
      return [
        b.patient?.patient_code || '',
        `"${pName}"`,
        `"${b.physiotherapist?.name || ''}"`,
        b.total_sessions || 0,
        b.cost_per_session || 0,
        totalCost,
        paid,
        due,
        status
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clinic_billing_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      {/* Payment Entry Modal */}
      {selectedRecord && (
        <PaymentRecordModal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          billingRecord={selectedRecord}
          onSavePayment={({ assignmentId }) => {
            onMarkAsPaid(assignmentId);
          }}
          mutating={mutating}
        />
      )}

      {/* Financial Health Summary Bar (If Unlocked) */}
      {isRevenueUnlocked ? (
        <div style={styles.summaryBar} className="glass-panel">
          <div style={styles.summaryCol}>
            <span style={styles.summaryLabel}>Total Accrued Ledger</span>
            <span style={styles.summaryVal}>₹{totalAccrued.toFixed(2)}</span>
          </div>
          <div style={styles.summaryCol}>
            <span style={styles.summaryLabel}>Total Settled Payments</span>
            <span style={{ ...styles.summaryVal, color: 'var(--success)' }}>₹{totalSettled.toFixed(2)}</span>
          </div>
          <div style={styles.summaryCol}>
            <span style={styles.summaryLabel}>Outstanding Balance Due</span>
            <span style={{ ...styles.summaryVal, color: 'var(--danger)' }}>₹{totalPending.toFixed(2)}</span>
          </div>
          <div style={styles.summaryCol}>
            <span style={styles.summaryLabel}>Collection Rate</span>
            <span style={{ ...styles.summaryVal, color: 'var(--primary)' }}>{collectionRatePct}%</span>
          </div>
          <Button size="sm" variant="secondary" onClick={handleExportCSV}>
            <FileSpreadsheet size={14} style={{ marginRight: 4 }} /> Export Ledger CSV
          </Button>
        </div>
      ) : (
        <div style={styles.restrictedSummaryBar} className="glass-panel" onClick={onOpenUnlockModal}>
          <Lock size={16} style={{ color: 'var(--warning)' }} />
          <span>Financial Ledger Totals Restricted - Click to enter Head/Admin PIN</span>
        </div>
      )}

      {/* Controls & Search */}
      <div style={styles.controls}>
        <div style={styles.filterBtns}>
          <button
            style={filter === 'all' ? styles.activeFilter : styles.filterBtn}
            onClick={() => setFilter('all')}
          >
            All Ledger
          </button>
          <button
            style={filter === 'paid' ? styles.activeFilter : styles.filterBtn}
            onClick={() => setFilter('paid')}
          >
            Paid / Settled
          </button>
          <button
            style={filter === 'pending' ? styles.activeFilter : styles.filterBtn}
            onClick={() => setFilter('pending')}
          >
            Pending / Outstanding
          </button>
        </div>

        <SearchBar value={query} onChange={setQuery} placeholder="Search patient name, code..." />
      </div>

      {/* Transaction Cards Grid */}
      <div style={styles.grid}>
        {filteredBilling.length === 0 ? (
          <div style={styles.emptyState}>No transaction cards found matching filters.</div>
        ) : (
          filteredBilling.map((b) => {
            const patientName = `${b.patient?.first_name || 'Patient'} ${b.patient?.surname || ''}`;
            const totalSessions = Number(b.total_sessions) || 0;
            const cost = Number(b.total_cost) || 0;
            const amtPaid = Number(b.amount_paid !== undefined && b.amount_paid !== null ? b.amount_paid : (b.is_paid ? cost : 0));
            const isFullyPaid = cost > 0 ? (amtPaid >= cost) : true;
            const isPartial = !isFullyPaid && amtPaid > 0;
            const outstanding = Math.max(0, cost - amtPaid);

            return (
              <Card
                key={b.assignment_id}
                title={patientName}
                subtitle={`Case Code: ${b.patient?.patient_code}`}
                className="glass-panel"
                extra={
                  <Badge variant={isFullyPaid ? 'success' : isPartial ? 'warning' : 'danger'}>
                    {isFullyPaid ? 'Fully Paid' : isPartial ? `Partially Paid` : 'Pending'}
                  </Badge>
                }
              >
                <div style={styles.cardContent}>
                  <div style={styles.meta}>
                    <p style={styles.text}><strong>Primary Physiotherapist:</strong> {b.physiotherapist?.name}</p>
                    <p style={styles.text}><strong>Base Rate / Session:</strong> ₹{Number(b.cost_per_session).toFixed(2)}</p>
                    <p style={styles.text}><strong>Sessions Attended:</strong> {totalSessions} session(s)</p>
                    
                    {isRevenueUnlocked ? (
                      <>
                        <p style={styles.text}><strong>Accrued Total:</strong> ₹{cost.toFixed(2)}</p>
                        <p style={{ ...styles.text, color: 'var(--success)' }}><strong>Paid / Settled:</strong> ₹{amtPaid.toFixed(2)}</p>
                        <p style={{ ...styles.text, color: isFullyPaid ? 'var(--primary)' : 'var(--danger)', fontWeight: '700' }}>
                          <strong>Outstanding Due:</strong> ₹{outstanding.toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <div style={styles.cardMaskedBox} onClick={onOpenUnlockModal}>
                        <Lock size={12} /> Financial Dues Masked (Head Access)
                      </div>
                    )}
                  </div>

                  {!isFullyPaid && (
                    <div style={styles.actions}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedRecord(b)}
                        loading={mutating}
                      >
                        Record Payment / Advance
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  },
  summaryBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--space-md)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    flexWrap: 'wrap',
    gap: 'var(--space-md)'
  },
  restrictedSummaryBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: 'var(--space-md)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    border: '1px dashed var(--warning)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--warning)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    cursor: 'pointer'
  },
  summaryCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  summaryLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase'
  },
  summaryVal: {
    fontSize: 'var(--text-lg)',
    fontWeight: '800',
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif"
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--space-md)',
    flexWrap: 'wrap',
    marginBottom: 'var(--space-sm)'
  },
  filterBtns: {
    display: 'flex',
    gap: 'var(--space-sm)'
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  activeFilter: {
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--primary-light)',
    border: '1px solid var(--primary)',
    color: 'var(--primary)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-glow)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'var(--space-lg)'
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: 'var(--space-2xl) 0',
    color: 'var(--text-muted)',
    fontSize: 'var(--text-sm)'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    gap: 'var(--space-md)'
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  text: {
    margin: 0,
    fontSize: 'var(--text-xs)',
    color: 'var(--text-secondary)'
  },
  cardMaskedBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px dashed var(--warning)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--warning)',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px'
  },
  actions: {
    display: 'flex',
    gap: 'var(--space-sm)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: 'var(--space-sm)',
    marginTop: 'var(--space-xs)'
  }
};

export default BillingTab;
