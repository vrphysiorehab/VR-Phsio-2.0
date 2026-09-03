import React from 'react';
import ClinicHeader from './ClinicHeader';
import { numberToWords } from '../../utils/numberToWords';
import { formatDate, formatDateTime } from '../../utils/dateHelpers';

export const InvoiceTemplate = ({ patient, assignment, sessions = [], invoiceNumber, date }) => {
  if (!patient || !assignment) return null;

  const {
    patient_code,
    title,
    first_name,
    middle_name,
    surname,
    mobile,
    email,
    address
  } = patient;

  const fullName = [title, first_name, middle_name, surname].filter(Boolean).join(' ');
  const costPerSession = Number(assignment.cost_per_session) || 0;
  const totalSessionsCount = sessions.length;
  const primaryPhysioName = assignment.physiotherapists?.name || 'Primary Therapist';
  
  const totalAmount = sessions.length > 0
    ? sessions.reduce((acc, s) => acc + Number(s.cost || 0), 0)
    : (totalSessionsCount * costPerSession);

  const amountPaid = Number(assignment.amount_paid !== undefined && assignment.amount_paid !== null
    ? assignment.amount_paid
    : (assignment.is_paid ? totalAmount : 0));

  const isFullyPaid = assignment.is_paid || (totalAmount > 0 && amountPaid >= totalAmount);
  const isPartial = !isFullyPaid && amountPaid > 0;
  const outstandingBalance = Math.max(0, totalAmount - amountPaid);

  const regDate = patient.registration_date || patient.intake_data?.registration_date || patient.created_at;
  const registrationDateStr = regDate ? formatDate(regDate) : 'N/A';

  const formattedDate = date ? formatDate(date) : formatDate(new Date());
  const invoiceId = invoiceNumber || `INV-${patient_code.replace('-', '')}-${assignment.id.substr(0, 4).toUpperCase()}`;



  return (
    <div style={styles.container}>
      <div style={styles.page}>
        <div>
          <ClinicHeader />
          
          <div style={styles.invoiceMeta}>
            <div style={styles.invoiceTitleBlock}>
              <h2 style={styles.invoiceTitle}>INVOICE / RECEIPT</h2>
              <p style={styles.invoiceNumber}>Invoice #: <strong>{invoiceId}</strong></p>
            </div>
            <div style={styles.invoiceDateBlock}>
              <p style={styles.dateLine}>Date: <strong>{formattedDate}</strong></p>
              <p style={styles.statusLine}>
                Payment Status: 
                <span style={isFullyPaid ? styles.paidBadge : isPartial ? styles.partialBadge : styles.pendingBadge}>
                  {isFullyPaid ? 'PAID' : isPartial ? `PARTIALLY PAID (₹${amountPaid.toFixed(2)})` : 'PENDING'}
                </span>
              </p>
            </div>
          </div>

          <div style={styles.billingGrid}>
            <div>
              <h4 style={styles.sectionTitle}>Billed To:</h4>
              <p style={styles.clientDetail}><strong>Patient Name:</strong> {fullName}</p>
              <p style={styles.clientDetail}><strong>Patient Code:</strong> {patient_code}</p>
              <p style={styles.clientDetail}><strong>Registration Date:</strong> {registrationDateStr}</p>
              <p style={styles.clientDetail}><strong>Contact No:</strong> {mobile}</p>
              <p style={styles.clientDetail}><strong>Address:</strong> {address || 'N/A'}</p>
            </div>
            <div>
              <h4 style={styles.sectionTitle}>Provider Details:</h4>
              <p style={styles.clientDetail}><strong>Primary Physiotherapist:</strong> {primaryPhysioName}</p>
              <p style={styles.clientDetail}><strong>Diagnosis:</strong> {assignment.diagnosis || 'General R&R'}</p>
            </div>
          </div>

          <h4 style={styles.sectionTitle}>Billed Services Summary</h4>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={{ ...styles.thCol, width: '55%' }}>Description of Service (Diagnosis)</th>
                <th style={{ ...styles.thCol, width: '15%', textAlign: 'center' }}>Units (Sessions)</th>
                <th style={{ ...styles.thCol, width: '15%', textAlign: 'center' }}>Price per Session</th>
                <th style={styles.thColRight}>Total Fee (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={styles.trRow}>
                <td style={styles.tdColDesc}>
                  <strong>Physiotherapy Care & Rehabilitation</strong>
                  <br />
                  <span style={styles.subtext}>Diagnosis: {assignment.diagnosis || 'General R&R'}</span>
                </td>
                <td style={{ ...styles.tdCol, textAlign: 'center' }}>
                  {totalSessionsCount}
                </td>
                <td style={{ ...styles.tdCol, textAlign: 'center' }}>
                  ₹{costPerSession.toFixed(2)}
                </td>
                <td style={styles.tdColRight}>
                  ₹{totalAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={styles.summarySection}>
            <div style={styles.amountInWordsBlock}>
              <span style={styles.wordsLabel}>Amount in Words:</span>
              <p style={styles.wordsText}>
                {numberToWords(totalAmount)}
              </p>
            </div>

            <div style={styles.summaryTableWrapper}>
              <table style={styles.summaryTable}>
                <tbody>
                  <tr>
                    <td style={styles.summaryLabel}>Subtotal:</td>
                    <td style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style={styles.summaryLabel}>Tax / Surcharges:</td>
                    <td style={styles.summaryValue}>₹0.00</td>
                  </tr>
                  <tr style={styles.totalRow}>
                    <td style={styles.totalLabel}>Total Bill:</td>
                    <td style={styles.totalValue}>₹{totalAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style={styles.summaryLabel}>Amount Received:</td>
                    <td style={{ ...styles.summaryValue, color: '#10b981', fontWeight: 'bold' }}>
                      ₹{amountPaid.toFixed(2)}
                    </td>
                  </tr>
                  <tr style={styles.outstandingRow}>
                    <td style={styles.outstandingLabel}>Outstanding Balance:</td>
                    <td style={styles.outstandingValue}>
                      ₹{outstandingBalance.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div style={styles.noteBlock}>
            <h4 style={styles.noteTitle}>Important Information:</h4>
            <p style={styles.noteText}>
              1. This is a computer-generated invoice and requires no physical signature.<br />
              2. Payments made for physiotherapy sessions are non-refundable.<br />
              3. For queries regarding your case diagnosis or session breakdown, please contact info@vrphysioclinic.com.
            </p>
          </div>

          <div style={styles.footerText}>Thank you for choosing VR Physio Clinic • Official Invoice Receipt</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#ffffff',
    color: '#1f2937',
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    lineHeight: '1.4'
  },
  page: {
    width: '210mm',
    height: '296.5mm',
    padding: '15mm 20mm',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff'
  },
  invoiceMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    padding: '12px 15px',
    marginBottom: '20px',
    pageBreakInside: 'avoid',
    breakInside: 'avoid'
  },
  invoiceTitleBlock: {
    display: 'flex',
    flexDirection: 'column'
  },
  invoiceTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '800',
    color: '#090d16'
  },
  invoiceNumber: {
    margin: '4px 0 0 0',
    color: '#4b5563'
  },
  invoiceDateBlock: {
    textAlign: 'right'
  },
  dateLine: {
    margin: 0,
    color: '#4b5563'
  },
  statusLine: {
    margin: '4px 0 0 0',
    fontWeight: '500',
    color: '#4b5563'
  },
  paidBadge: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: 'bold',
    marginLeft: '6px'
  },
  partialBadge: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: 'bold',
    marginLeft: '6px'
  },
  pendingBadge: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: 'bold',
    marginLeft: '6px'
  },
  billingGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    marginBottom: '20px'
  },
  sectionTitle: {
    margin: '0 0 8px 0',
    fontSize: '11px',
    color: '#10b981',
    textTransform: 'uppercase',
    fontWeight: '700',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '2px'
  },
  clientDetail: {
    margin: '0 0 4px 0',
    fontSize: '10px',
    color: '#4b5563'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '25px'
  },
  thRow: {
    backgroundColor: '#f3f4f6',
    borderBottom: '2px solid #cbd5e1'
  },
  thCol: {
    padding: '10px 8px',
    textAlign: 'left',
    fontSize: '10px',
    fontWeight: '700',
    color: '#374151'
  },
  thColRight: {
    padding: '10px 8px',
    textAlign: 'right',
    fontSize: '10px',
    fontWeight: '700',
    color: '#374151'
  },
  trRow: {
    borderBottom: '1px solid #e5e7eb',
    pageBreakInside: 'avoid',
    breakInside: 'avoid'
  },
  tdColDesc: {
    padding: '10px 8px',
    fontSize: '10px',
    color: '#1f2937'
  },
  subtext: {
    fontSize: '9px',
    color: '#6b7280',
    fontStyle: 'italic'
  },
  tdColRight: {
    padding: '10px 8px',
    textAlign: 'right',
    fontSize: '10px',
    color: '#1f2937',
    fontWeight: '500'
  },
  summarySection: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '30px',
    marginBottom: '30px',
    pageBreakInside: 'avoid',
    breakInside: 'avoid'
  },
  amountInWordsBlock: {
    flex: 1,
    border: '1px solid #e5e7eb',
    padding: '10px 12px',
    borderRadius: '4px',
    backgroundColor: '#f9fafb',
    height: 'fit-content'
  },
  wordsLabel: {
    fontSize: '9px',
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '4px'
  },
  wordsText: {
    margin: 0,
    fontSize: '10px',
    fontWeight: '600',
    color: '#374151',
    lineHeight: '1.3'
  },
  summaryTableWrapper: {
    width: '260px'
  },
  summaryTable: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  summaryLabel: {
    padding: '4px 0',
    textAlign: 'left',
    color: '#4b5563',
    fontSize: '10px'
  },
  summaryValue: {
    padding: '4px 0',
    textAlign: 'right',
    color: '#1f2937',
    fontSize: '10px',
    fontWeight: '500'
  },
  totalRow: {
    borderTop: '1px solid #cbd5e1',
    borderBottom: '2px double #cbd5e1'
  },
  totalLabel: {
    padding: '6px 0',
    textAlign: 'left',
    fontWeight: '700',
    color: '#090d16',
    fontSize: '11px'
  },
  totalValue: {
    padding: '6px 0',
    textAlign: 'right',
    fontWeight: '700',
    color: '#090d16',
    fontSize: '11px'
  },
  outstandingRow: {
    borderTop: '1px dashed #cbd5e1'
  },
  outstandingLabel: {
    padding: '6px 0',
    textAlign: 'left',
    fontWeight: '700',
    color: '#ef4444',
    fontSize: '10px'
  },
  outstandingValue: {
    padding: '6px 0',
    textAlign: 'right',
    fontWeight: '700',
    color: '#ef4444',
    fontSize: '10px'
  },
  noteBlock: {
    borderTop: '1px solid #cbd5e1',
    paddingTop: '12px',
    marginBottom: '20px',
    pageBreakInside: 'avoid',
    breakInside: 'avoid'
  },
  noteTitle: {
    margin: '0 0 6px 0',
    fontSize: '9px',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase'
  },
  noteText: {
    margin: 0,
    fontSize: '9px',
    color: '#9ca3af',
    lineHeight: '1.4'
  },
  footerText: {
    textAlign: 'center',
    fontSize: '9px',
    color: '#9ca3af',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '8px',
    marginTop: '15px'
  }
};

export default InvoiceTemplate;
