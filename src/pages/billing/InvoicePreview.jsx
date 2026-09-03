import React from 'react';
import { ExternalLink, Mail, History } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatDateTime } from '../../utils/dateHelpers';
import styles from './InvoicePreview.module.css';

export const InvoicePreview = ({
  patient,
  assignment,
  sessionsCount,
  costPerSession,
  totalCost,
  onMarkAsPaid,
  onPrintReceipt,
  invoiceUrl,
  onResendEmail,
  emailSending,
  mutating,
  reportStep
}) => {
  const amtPaid = Number(
    assignment?.amount_paid !== undefined && assignment?.amount_paid !== null
      ? assignment.amount_paid
      : assignment?.is_paid
      ? totalCost
      : 0
  );

  const isFullyPaid = totalCost > 0 ? amtPaid >= totalCost : true;
  const isPartial = !isFullyPaid && amtPaid > 0;
  const outstanding = Math.max(0, Number(totalCost) - amtPaid);

  const rawHistory = assignment?.payment_history || [];
  const paymentHistory = Array.isArray(rawHistory)
    ? rawHistory
    : typeof rawHistory === 'string'
    ? JSON.parse(rawHistory)
    : [];

  return (
    <div className={styles.container}>
      <Card
        title="Session Billing Summary"
        subtitle={`Invoice Preview for Patient ${patient?.patient_code}`}
        extra={
          <Badge variant={isFullyPaid ? 'success' : isPartial ? 'warning' : 'danger'}>
            {isFullyPaid
              ? 'Fully Paid'
              : isPartial
              ? `Partially Paid (Advance: ₹${amtPaid.toFixed(2)})`
              : 'Payment Pending'}
          </Badge>
        }
        className="glass-panel"
      >
        <div className={styles.content}>
          <div className={styles.grid}>
            <div className={styles.detailBlock}>
              <span className={styles.label}>Patient Code</span>
              <span className={styles.value}>{patient?.patient_code}</span>
            </div>

            <div style={{ flex: 1 }} className={styles.detailBlock}>
              <span className={styles.label}>Total Sessions Logged</span>
              <span className={styles.value}>{sessionsCount} Session(s)</span>
            </div>

            <div className={styles.detailBlock}>
              <span className={styles.label}>Fee per Session</span>
              <span className={styles.value}>₹{Number(costPerSession).toFixed(2)}</span>
            </div>

            <div className={styles.detailBlock}>
              <span className={styles.label}>Primary Physiotherapist</span>
              <span className={styles.value}>
                {assignment?.physiotherapists?.name ||
                  assignment?.physiotherapist?.name ||
                  'Rostered Therapist'}
              </span>
            </div>
          </div>

          <div className={styles.calculations}>
            <div className={styles.calcRow}>
              <span>Subtotal accrued:</span>
              <span>₹{Number(totalCost).toFixed(2)}</span>
            </div>
            <div className={styles.calcRow}>
              <span>Taxes & Fees:</span>
              <span>₹0.00</span>
            </div>
            <div className={`${styles.calcRow} ${styles.boldRow}`}>
              <span>Total Accrued Cost:</span>
              <span>₹{Number(totalCost).toFixed(2)}</span>
            </div>
            <div className={`${styles.calcRow} ${styles.successText}`}>
              <span>Advance / Payments Received:</span>
              <span>₹{Number(amtPaid).toFixed(2)}</span>
            </div>
            <div
              className={`${styles.calcRow} ${styles.boldRow} ${
                isFullyPaid ? '' : styles.dangerText
              } ${styles.dashedBorder}`}
            >
              <span>Outstanding Balance Due:</span>
              <span>₹{Number(outstanding).toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Transaction History Table */}
          <div className={styles.historySection}>
            <div className={styles.historyHeader}>
              <History size={16} className={styles.historyIcon} />
              <h4 className={styles.historyTitle}>
                Payment Installment Ledger ({paymentHistory.length})
              </h4>
            </div>

            {paymentHistory.length === 0 ? (
              <div className={styles.emptyHistory}>
                No installment payments or advance transactions logged yet.
              </div>
            ) : (
              <div className={styles.historyTableWrapper}>
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Payment Mode</th>
                      <th>Notes / Description</th>
                      <th style={{ textAlign: 'right' }}>Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td>{formatDateTime(item.date)}</td>
                        <td>
                          <span className={styles.modeTag}>{item.mode || 'Cash'}</span>
                        </td>
                        <td>{item.notes || 'Advance / Installment Payment'}</td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: '700',
                            color: 'var(--primary)'
                          }}
                        >
                          ₹{Number(item.amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            {!isFullyPaid && (
              <Button onClick={onMarkAsPaid} variant="primary" loading={mutating}>
                Record Advance / Payment
              </Button>
            )}

            {invoiceUrl && (
              <Button
                onClick={() => window.open(invoiceUrl, '_blank')}
                variant="secondary"
              >
                <ExternalLink size={15} />
                View Invoice PDF
              </Button>
            )}

            {patient?.email && invoiceUrl && (
              <Button
                onClick={onResendEmail}
                variant="outline"
                loading={emailSending}
              >
                <Mail size={15} />
                Resend Email Receipt
              </Button>
            )}

            <Button
              onClick={onPrintReceipt}
              variant="accent"
              loading={reportStep === 'generating'}
              disabled={sessionsCount === 0}
            >
              {invoiceUrl ? 'Re-generate PDF Invoice' : 'Generate PDF Receipt'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvoicePreview;
