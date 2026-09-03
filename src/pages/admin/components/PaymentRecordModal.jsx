import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { CreditCard, CheckCircle, Receipt } from 'lucide-react';

export const PaymentRecordModal = ({ isOpen, onClose, billingRecord, onSavePayment, mutating }) => {
  if (!billingRecord) return null;

  const totalCost = Number(billingRecord.total_cost || 0);
  const alreadyPaid = Number(billingRecord.amount_paid !== undefined && billingRecord.amount_paid !== null ? billingRecord.amount_paid : (billingRecord.is_paid ? totalCost : 0));
  const outstanding = Math.max(0, totalCost - alreadyPaid);

  const [amountInput, setAmountInput] = useState(outstanding.toString());
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [txnRef, setTxnRef] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg('Please enter a valid positive payment amount.');
      return;
    }

    if (amt > outstanding + 0.01) {
      setErrorMsg(`Payment amount cannot exceed outstanding balance (₹${outstanding.toFixed(2)}).`);
      return;
    }

    onSavePayment({
      assignmentId: billingRecord.assignment_id,
      patientId: billingRecord.patient_id,
      amount: amt,
      newTotalPaid: alreadyPaid + amt,
      isFullyPaid: (alreadyPaid + amt) >= totalCost,
      paymentMode,
      txnRef
    });

    onClose();
  };

  const patientName = `${billingRecord.patient?.first_name || 'Patient'} ${billingRecord.patient?.surname || ''}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💳 Record Ledger Payment / Advance">
      <form onSubmit={handleSubmit} style={styles.container}>
        <div style={styles.summaryCard}>
          <h4 style={styles.patientTitle}>{patientName}</h4>
          <span style={styles.caseCode}>Code: {billingRecord.patient?.patient_code}</span>
          <div style={styles.ledgerRow}>
            <span>Accrued Cost: <strong>₹{totalCost.toFixed(2)}</strong></span>
            <span>Already Settled: <strong style={{ color: 'var(--success)' }}>₹{alreadyPaid.toFixed(2)}</strong></span>
          </div>
          <div style={styles.dueRow}>
            <span>Outstanding Due: <strong style={{ color: 'var(--danger)', fontSize: '15px' }}>₹{outstanding.toFixed(2)}</strong></span>
          </div>
        </div>

        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

        <Input
          type="number"
          step="0.01"
          label="Payment Amount (₹)"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          placeholder="Enter payment amount..."
          autoFocus
        />

        <Select
          label="Payment Mode / Method"
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          options={[
            { value: 'UPI', label: 'UPI / GPay / PhonePe / Paytm' },
            { value: 'Cash', label: 'Cash Payment' },
            { value: 'CreditCard', label: 'Credit / Debit Card' },
            { value: 'BankTransfer', label: 'Bank NEFT / IMPS / Transfer' }
          ]}
        />

        <Input
          type="text"
          label="Transaction Ref / Receipt Note (Optional)"
          placeholder="e.g. UPI Ref #91823019283"
          value={txnRef}
          onChange={(e) => setTxnRef(e.target.value)}
        />

        <div style={styles.actions}>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" loading={mutating}>
            <CheckCircle size={16} style={{ marginRight: 6 }} /> Confirm & Save Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  patientTitle: {
    margin: 0,
    fontSize: 'var(--text-base)',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  caseCode: {
    fontSize: '11px',
    color: 'var(--primary)',
    fontWeight: '700'
  },
  ledgerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'var(--text-xs)',
    color: 'var(--text-secondary)',
    borderTop: '1px solid rgba(255, 255, 255, 0.02)',
    paddingTop: '6px',
    marginTop: '4px'
  },
  dueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'var(--text-xs)',
    color: 'var(--text-primary)',
    borderTop: '1px dashed var(--border-color)',
    paddingTop: '6px'
  },
  errorBox: {
    padding: '8px 12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid var(--danger)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--danger)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--space-sm)',
    marginTop: 'var(--space-xs)'
  }
};

export default PaymentRecordModal;
