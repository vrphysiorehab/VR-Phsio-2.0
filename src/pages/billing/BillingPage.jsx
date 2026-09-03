import React, { useState, useRef, useEffect } from 'react';
import { CreditCard, FileText } from 'lucide-react';
import SearchBar from '../../components/ui/SearchBar';
import InvoicePreview from './InvoicePreview';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { usePatientSearch } from '../../hooks/usePatientSearch';
import { useBillingSummary } from '../../hooks/useBillingSummary';
import { useToast } from '../../hooks/useToast';
import { storageService } from '../../services/storageService';
import { generatePdf } from '../../components/pdf/PdfGenerator';
import InvoiceTemplate from '../../components/pdf/InvoiceTemplate';
import styles from './BillingPage.module.css';
import { emailService } from '../../services/emailService';
import { sessionsService } from '../../services/sessionsService';

export const BillingPage = () => {
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [targetAssignmentId, setTargetAssignmentId] = useState(null);
  const [invoiceStep, setInvoiceStep] = useState('idle'); // idle | generating | done
  const [invoiceUrl, setInvoiceUrl] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [emailSending, setEmailSending] = useState(false);

  // Search state
  const { query, setQuery, patients, loading: searchLoading } = usePatientSearch();

  const [payAmount, setPayAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [payMode, setPayMode] = useState('Cash');

  const [selectedBillingIndex, setSelectedBillingIndex] = useState(0);

  // Billing state for selected patient
  const {
    patient,
    billingRecords,
    loading: billingLoading,
    mutating,
    markAsPaid,
    recordPayment
  } = useBillingSummary(selectedPatientId);

  const toast = useToast();
  const pdfRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Pick selected billing record or default to first
  const activeBillingRecord = billingRecords && billingRecords.length > 0
    ? (billingRecords[selectedBillingIndex] || billingRecords[0])
    : null;

  const currentPaid = Number(activeBillingRecord?.amount_paid !== undefined && activeBillingRecord?.amount_paid !== null
    ? activeBillingRecord.amount_paid
    : (activeBillingRecord?.is_paid ? activeBillingRecord.total_cost : 0));
  
  const totalCost = Number(activeBillingRecord?.total_cost || 0);
  const outstanding = Math.max(0, totalCost - currentPaid);

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setSelectedBillingIndex(0);
    setInvoiceStep('idle');
    setInvoiceUrl(null);
  };

  const handleMarkAsPaidClick = () => {
    if (activeBillingRecord) {
      setTargetAssignmentId(activeBillingRecord.assignment_id);
      setPayAmount(outstanding > 0 ? outstanding.toString() : totalCost.toString());
      setDiscount('');
      setShowPayModal(true);
    }
  };

  const handleConfirmPayment = async () => {
    if (!targetAssignmentId) return;
    const amountNum = Number(payAmount || 0);
    const discountNum = Number(discount || 0);

    if (amountNum <= 0 && discountNum <= 0) {
      toast.error('Please enter a valid payment amount or discount waiver.');
      return;
    }

    setShowPayModal(false);
    toast.info('Processing payment transaction...');

    const totalCredited = amountNum + discountNum;
    const notes = discountNum > 0
      ? `Paid ₹${amountNum.toFixed(2)} (${payMode}) + Courtesy Discount Waiver ₹${discountNum.toFixed(2)}`
      : `Payment received via ${payMode}`;

    const { error } = await recordPayment(
      targetAssignmentId,
      totalCredited,
      payMode,
      notes,
      currentPaid,
      totalCost,
      activeBillingRecord?.payment_history || []
    );
    if (error) {
      toast.error(`Payment registration failed: ${error.message || 'Check database connectivity.'}`);
    } else {
      toast.success(
        `Payment of ₹${amountNum.toFixed(2)}${
          discountNum > 0 ? ` (with ₹${discountNum.toFixed(2)} discount waiver)` : ''
        } recorded successfully via ${payMode}!`
      );
      setDiscount('');
    }
  };

  const handleResendEmail = async () => {
    if (!patient || !patient.email || !activeBillingRecord) return;
    setEmailSending(true);
    toast.info(`Sending invoice receipt email to ${patient.email}...`);

    try {
      const fullName = [patient.title, patient.first_name, patient.middle_name, patient.surname]
        .filter(Boolean)
        .join(' ');
      const invoiceNumber = `INV-${patient.patient_code.replace('-', '')}-${Date.now()
        .toString()
        .substr(-5)}`;

      const res = await emailService.sendInvoiceEmail(
        patient.email,
        patient.patient_code,
        fullName,
        invoiceNumber,
        totalCost,
        null
      );

      if (res.success) {
        toast.success(`Invoice receipt email resent successfully to ${patient.email}!`);
      } else {
        toast.error(`Email delivery failed: ${res.error || 'Check SMTP configuration'}`);
      }
    } catch (err) {
      toast.error(`Error resending email: ${err.message}`);
    } finally {
      setEmailSending(false);
    }
  };

  const handlePrintReceiptClick = async () => {
    if (!patient || !activeBillingRecord) return;

    setInvoiceStep('generating');
    toast.info('Rendering and compiling PDF receipt invoice...');

    const timestamp = Date.now();
    const invoiceNumber = `INV-${patient.patient_code.replace('-', '')}-${timestamp.toString().substr(-5)}`;

    // Fetch real sessions for this assignment to get session physiotherapists and fees
    const { data: realSessions } = await sessionsService.getSessionsByAssignmentId(activeBillingRecord.assignment_id);

    setPdfData({
      patient,
      assignment: {
        ...activeBillingRecord,
        physiotherapists: activeBillingRecord.physiotherapist
      },
      sessions: realSessions || [],
      invoiceNumber,
      date: new Date().toISOString()
    });
  };

  // PDF receipt compilation effect
  useEffect(() => {
    if (pdfData && invoiceStep === 'generating') {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      const compileInvoice = async () => {
        await new Promise((resolve) => setTimeout(resolve, 300)); // allow render

        try {
          if (!pdfRef.current) {
            throw new Error('Invoice Element Ref not found');
          }

          const filename = `invoice-${pdfData.invoiceNumber}.pdf`;
          
          // Generate PDF Blob
          const blob = await generatePdf(pdfRef.current, filename);

          toast.info('Uploading transaction invoice to client folder...');

          // Upload to storage
          const path = `${patient.patient_code}/invoice-${Date.now()}.pdf`;
          const uploadRes = await storageService.uploadPdf(path, blob);
          if (uploadRes.error) throw uploadRes.error;

          const publicUrl = uploadRes.data.publicUrl;
          setInvoiceUrl(publicUrl);
          setInvoiceStep('done');
          toast.success('PDF invoice generated successfully!');

          // Send non-blocking invoice email with attachment
          if (patient.email) {
            const fullName = [patient.title, patient.first_name, patient.middle_name, patient.surname].filter(Boolean).join(' ');
            const totalCost = pdfData.assignment.total_cost || (Number(pdfData.assignment.cost_per_session) * Number(pdfData.assignment.total_sessions)) || 0;
            toast.info('Sending invoice receipt email to patient...');
            emailService.sendInvoiceEmail(patient.email, patient.patient_code, fullName, pdfData.invoiceNumber, totalCost, blob)
              .then(res => {
                if (res.success) {
                  toast.success('Invoice receipt email sent successfully.');
                } else {
                  console.warn("Invoice email failed to send:", res.error);
                }
              })
              .catch(err => console.error("Error sending invoice email:", err));
          }

          // Open PDF
          window.open(publicUrl, '_blank');
        } catch (err) {
          console.error('Invoice generation failed:', err);
          toast.error(`Receipt creation failed: ${err.message || 'Check database storage settings.'}`);
          setInvoiceStep('idle');
        } finally {
          // Cleanup
          setPdfData(null);
          isProcessingRef.current = false;
        }
      };

      compileInvoice();
    }
  }, [pdfData, invoiceStep, patient, toast]);

  return (
    <div className={styles.container}>
      {/* Off-screen PDF compilation */}
      <div className="pdf-print-wrapper">
        <div ref={pdfRef}>
          {pdfData && (
            <InvoiceTemplate
              patient={pdfData.patient}
              assignment={pdfData.assignment}
              sessions={pdfData.sessions}
              invoiceNumber={pdfData.invoiceNumber}
              date={pdfData.date}
            />
          )}
        </div>
      </div>

      {/* Payment / Advance Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title="Record Payment / Advance"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowPayModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmPayment}>
              Record Payment
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(202, 159, 66, 0.05)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Total Accrued Cost:</span>
              <strong>₹{totalCost.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--success)' }}>
              <span>Already Paid / Advance:</span>
              <strong>₹{currentPaid.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)', fontWeight: 'bold' }}>
              <span>Outstanding Balance Due:</span>
              <span>₹{outstanding.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              PAYMENT AMOUNT (INR)
            </label>
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="Enter amount to receive"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            />
            {/* Quick Preset Amount Chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setPayAmount('500')}
                style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                ₹500
              </button>
              <button
                type="button"
                onClick={() => setPayAmount('1000')}
                style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                ₹1,000
              </button>
              <button
                type="button"
                onClick={() => setPayAmount('2000')}
                style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                ₹2,000
              </button>
              <button
                type="button"
                onClick={() => setPayAmount('5000')}
                style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                ₹5,000
              </button>
              {outstanding > 0 && (
                <button
                  type="button"
                  onClick={() => setPayAmount(outstanding.toString())}
                  style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
                >
                  Full Outstanding (₹{outstanding.toFixed(2)})
                </button>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              COURTESY DISCOUNT / WAIVER CONCESSION (INR - OPTIONAL)
            </label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Enter discount amount (e.g. 200)"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              PAYMENT MODE
            </label>
            <select
              value={payMode}
              onChange={(e) => setPayMode(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="Cash">Cash</option>
              <option value="UPI / Online">UPI / QR Code / GPay</option>
              <option value="Card">Credit / Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>
      </Modal>

      <div className={styles.sidebarSection}>
        <Card title="Patient Lookup" subtitle="Search patient account ledger" className="glass-panel">
          <SearchBar value={query} onChange={setQuery} placeholder="Search name, code, mobile..." />

          <div className={styles.patientList}>
            {searchLoading ? (
              <div className={styles.searchState}>Searching patients...</div>
            ) : patients.length === 0 ? (
              <div className={styles.searchState}>
                {query ? 'No patients match query' : 'Type above to query billing logs'}
              </div>
            ) : (
              patients.map((p) => (
                <div
                  key={p.id}
                  className={`${styles.patientItem} ${
                    selectedPatientId === p.id ? styles.selectedItem : ''
                  }`}
                  onClick={() => handleSelectPatient(p.id)}
                >
                  <div className={styles.patientDetails}>
                    <span className={styles.patientName}>
                      {p.first_name} {p.surname}
                    </span>
                    <span className={styles.patientCode}>{p.patient_code}</span>
                  </div>
                  <span className={styles.patientPhone}>{p.mobile}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className={styles.contentSection}>
        {billingLoading ? (
          <div className={styles.centeredState}>Loading client invoices...</div>
        ) : !selectedPatientId ? (
          <div className={styles.selectPrompt}>
            <CreditCard size={48} style={{ opacity: 0.5, marginBottom: 'var(--space-md)' }} />
            <h3>No Patient Selected</h3>
            <p>Look up a patient using the left search sidebar to review invoice metrics, verify outstanding fees, and print receipts.</p>
          </div>
        ) : activeBillingRecord ? (
          <div className={styles.recordsWrapper}>
            {/* Header summary panel */}
            <div className={`${styles.patientHeader} glass-panel`}>
              <div className={styles.headerDetails}>
                <h1>
                  {patient?.first_name} {patient?.surname}
                </h1>
                <div className={styles.metaRow}>
                  <span className={styles.metaBadge}>{patient?.patient_code}</span>
                  <span>Contact: {patient?.mobile}</span>
                  <span>Billing status: <strong>{activeBillingRecord.is_paid ? 'Cleared' : 'Pending'}</strong></span>
                </div>
              </div>
            </div>

            {/* Treatment Invoice Plan Selector */}
            {billingRecords && billingRecords.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', padding: '12px 16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    Select Billed Treatment Plan ({billingRecords.length}):
                  </label>
                  <select
                    value={selectedBillingIndex}
                    onChange={(e) => {
                      setSelectedBillingIndex(Number(e.target.value));
                      setInvoiceStep('idle');
                      setInvoiceUrl(null);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: '600',
                      flex: 1
                    }}
                  >
                    {billingRecords.map((rec, idx) => (
                      <option key={rec.id} value={idx}>
                        Plan #{billingRecords.length - idx}: {rec.diagnosis || 'Rehab Plan'} ({rec.is_active ? 'Active' : 'Closed'}) - Accrued: ₹{Number(rec.total_cost).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <InvoicePreview
              patient={patient}
              assignment={activeBillingRecord}
              sessionsCount={Number(activeBillingRecord.total_sessions)}
              costPerSession={activeBillingRecord.cost_per_session}
              totalCost={activeBillingRecord.total_cost}
              onMarkAsPaid={handleMarkAsPaidClick}
              onPrintReceipt={handlePrintReceiptClick}
              invoiceUrl={invoiceUrl}
              onResendEmail={handleResendEmail}
              emailSending={emailSending}
              mutating={mutating}
              reportStep={invoiceStep}
            />
          </div>
        ) : (
          <div className={styles.centeredState}>
            <Card title="No Invoices Recorded" subtitle="No active treatments or billed sessions recorded for this patient." className="glass-panel">
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Please create a therapist assignment and record attendance sessions to compile invoice logs.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage;
