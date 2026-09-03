import React, { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { patientsService } from '../../../services/patientsService';
import { emailService } from '../../../services/emailService';
import { generatePdf } from '../../../components/pdf/PdfGenerator';
import TreatmentReportTemplate from '../../../components/pdf/TreatmentReportTemplate';
import InvoiceTemplate from '../../../components/pdf/InvoiceTemplate';
import { useToast } from '../../../hooks/useToast';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export const MailTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [editingEmailId, setEditingEmailId] = useState(null);
  const [emailsMap, setEmailsMap] = useState({}); // { [patientId]: string }
  const [emailType, setEmailType] = useState('both'); // 'treatment' | 'bill' | 'both'
  const [sendingId, setSendingId] = useState(null);

  // Hidden PDF Template Data States
  const [treatmentData, setTreatmentData] = useState(null);
  const [billData, setBillData] = useState(null);

  const toast = useToast();
  const treatmentRef = useRef(null);
  const billRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.info('Please enter a patient name to search.');
      return;
    }

    setSearching(true);
    try {
      const { data: patientsData, error: patientErr } = await supabase
        .from('patients')
        .select('*')
        .or(`first_name.ilike.%${searchQuery.trim()}%,surname.ilike.%${searchQuery.trim()}%`);

      if (patientErr) throw patientErr;

      if (!patientsData || patientsData.length === 0) {
        setResults([]);
        toast.info('No patients found matching that name.');
        return;
      }

      // Fetch patient assignments and billing statuses
      const patientIds = patientsData.map((p) => p.id);
      
      const { data: assignmentsData, error: assignErr } = await supabase
        .from('patient_assignments')
        .select('*, physiotherapists(*)')
        .in('patient_id', patientIds);

      if (assignErr) throw assignErr;

      const { data: billingData, error: billErr } = await supabase
        .from('v_patient_billing')
        .select('*')
        .in('patient_id', patientIds);

      if (billErr) throw billErr;

      const enriched = patientsData.map((p) => {
        const pAssigns = assignmentsData?.filter((a) => a.patient_id === p.id) || [];
        const activeAssign = pAssigns.find((a) => a.is_active) || pAssigns[0] || null;
        const billingInfo = billingData?.find((b) => b.patient_id === p.id && b.assignment_id === activeAssign?.id) || null;

        return {
          patient: p,
          assignment: activeAssign,
          billing: billingInfo
        };
      });

      setResults(enriched);
    } catch (err) {
      console.error('Patient search error:', err);
      toast.error(`Search failed: ${err.message || 'Check database connection.'}`);
    } finally {
      setSearching(false);
    }
  };

  const handleSaveEmail = async (patientId, emailStr) => {
    if (!emailStr || !emailStr.trim()) {
      toast.error('Email address cannot be empty.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr.trim())) {
      toast.error('Invalid email address format.');
      return;
    }

    try {
      const { error } = await patientsService.updatePatientEmail(patientId, emailStr.trim());
      if (error) throw error;

      setResults((prev) =>
        prev.map((item) =>
          item.patient.id === patientId
            ? { ...item, patient: { ...item.patient, email: emailStr.trim() } }
            : item
        )
      );

      toast.success('Patient email address updated successfully.');
      setEditingEmailId(null);
    } catch (err) {
      console.error('Email update error:', err);
      toast.error(`Failed to save email: ${err.message || 'database error.'}`);
    }
  };

  const handleSendMail = async (item) => {
    const recipientEmail = item.patient.email;
    if (!recipientEmail) {
      toast.error('Please enter and save a valid email for the patient first.');
      return;
    }

    setSendingId(item.patient.id);
    toast.info('Rendering clinical documents and compiling PDFs...');

    try {
      // 1. Fetch sessions
      let sessions = [];
      if (item.assignment) {
        const { data, error } = await supabase
          .from('sessions')
          .select('*, patients(*), physiotherapists(*)')
          .eq('assignment_id', item.assignment.id);
        if (error) throw error;
        sessions = data || [];
      }

      // 2. Load data into hidden render blocks
      let treatmentBlob = null;
      let billBlob = null;

      if (emailType === 'treatment' || emailType === 'both') {
        setTreatmentData({
          patient: item.patient,
          assignment: item.assignment,
          sessions
        });
      }

      if (emailType === 'bill' || emailType === 'both') {
        const invoiceNumber = `INV-${item.patient.patient_code.replace('-', '')}-${item.assignment?.id?.substr(0, 4).toUpperCase() || 'BILL'}`;
        setBillData({
          patient: item.patient,
          assignment: item.assignment,
          sessions,
          invoiceNumber
        });
      }

      // Wait 400ms for React to commit templates to DOM
      await new Promise((resolve) => setTimeout(resolve, 400));

      // 3. Compile PDFs from DOM elements
      if (emailType === 'treatment' || emailType === 'both') {
        if (!treatmentRef.current) throw new Error('Treatment template element not rendered');
        treatmentBlob = await generatePdf(treatmentRef.current, `treatment-report-${item.patient.patient_code}.pdf`);
      }

      if (emailType === 'bill' || emailType === 'both') {
        if (!billRef.current) throw new Error('Billing template element not rendered');
        billBlob = await generatePdf(billRef.current, `bill-report-${item.patient.patient_code}.pdf`);
      }

      // 4. Send email
      toast.info('Dispatching emails via secure server...');
      const resultsList = await emailService.sendReportAndBillEmails({
        recipientEmail,
        patientCode: item.patient.patient_code,
        fullName: `${item.patient.first_name} ${item.patient.surname}`,
        emailType,
        treatmentPdfBlob: treatmentBlob,
        billPdfBlob: billBlob,
        invoiceNumber: `INV-${item.patient.patient_code.replace('-', '')}-${item.assignment?.id?.substr(0, 4).toUpperCase() || 'BILL'}`,
        totalCost: item.billing?.total_cost || 0
      });

      const failed = resultsList.filter((r) => !r.success);
      if (failed.length > 0) {
        toast.error(`Email dispatch failed for: ${failed.map((f) => f.type).join(', ')}`);
      } else {
        toast.success(`Reports sent successfully to ${recipientEmail}!`);
      }
    } catch (err) {
      console.error('Mail dispatch error:', err);
      toast.error(`Mail dispatch failed: ${err.message || 'Check database.'}`);
    } finally {
      setTreatmentData(null);
      setBillData(null);
      setSendingId(null);
    }
  };

  return (
    <div style={styles.container}>
      {/* Offscreen PDF Render Containers */}
      <div className="pdf-print-wrapper">
        <div ref={treatmentRef}>
          {treatmentData && (
            <TreatmentReportTemplate
              patient={treatmentData.patient}
              assignment={treatmentData.assignment}
              sessions={treatmentData.sessions}
            />
          )}
        </div>
      </div>

      <div className="pdf-print-wrapper">
        <div ref={billRef}>
          {billData && (
            <InvoiceTemplate
              patient={billData.patient}
              assignment={billData.assignment}
              sessions={billData.sessions}
              invoiceNumber={billData.invoiceNumber}
            />
          )}
        </div>
      </div>

      <Card
        title="✉ Patient Mail Dispatcher"
        subtitle="Search for a registered patient to email their clinical logs and invoice reports."
        className="glass-panel"
      >
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            placeholder="Enter patient first name or surname..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          <Button type="submit" variant="primary" loading={searching}>
            Search Patient
          </Button>
        </form>

        {results.length > 0 && (
          <div style={styles.resultsWrapper}>
            <h4 style={styles.resultsTitle}>Search Results ({results.length})</h4>
            <div style={styles.resultsGrid}>
              {results.map((item) => {
                const { patient: p, assignment: a, billing: b } = item;
                const pName = `${p.first_name} ${p.surname}`;
                const totalCost = b ? Number(b.total_cost) : 0;
                const amtPaid = b ? Number(b.amount_paid !== undefined && b.amount_paid !== null ? b.amount_paid : (b.is_paid ? totalCost : 0)) : 0;
                const isPaid = b ? (totalCost > 0 ? (amtPaid >= totalCost) : true) : false;
                const isPartial = b ? (!isPaid && amtPaid > 0) : false;
                
                let paymentStatusText = 'Pending / Unpaid';
                let paymentColor = 'var(--danger)';
                if (isPaid) {
                  paymentStatusText = 'Fully Paid';
                  paymentColor = 'var(--success)';
                } else if (isPartial) {
                  paymentStatusText = `Partially Paid (Paid: ₹${amtPaid.toFixed(0)})`;
                  paymentColor = 'var(--warning)';
                }

                const isEditing = editingEmailId === p.id;

                return (
                  <div key={p.id} style={styles.resultCard}>
                    <div style={styles.cardHeader}>
                      <div>
                        <h3 style={styles.patientName}>{pName}</h3>
                        <span style={styles.patientCode}>{p.patient_code}</span>
                      </div>
                      <span style={{ ...styles.paymentBadge, border: `1px solid ${paymentColor}`, color: paymentColor }}>
                        {paymentStatusText}
                      </span>
                    </div>

                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Phone Number:</span>
                      <span style={styles.infoValue}>{p.mobile || '-'}</span>
                    </div>

                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Diagnosed With:</span>
                      <span style={styles.infoValue}>{a?.diagnosis || 'No Diagnosis Logged'}</span>
                    </div>

                    {/* Email Info / Edit Row */}
                    <div style={styles.emailBlock}>
                      <span style={styles.infoLabel}>Patient Email:</span>
                      {!p.email ? (
                        <div style={styles.emailEditRow}>
                          <input
                            type="email"
                            value={emailsMap[p.id] || ''}
                            onChange={(e) => setEmailsMap({ ...emailsMap, [p.id]: e.target.value })}
                            placeholder="Enter patient email..."
                            style={styles.emailInput}
                          />
                          <Button size="sm" variant="accent" onClick={() => handleSaveEmail(p.id, emailsMap[p.id])}>
                            Save
                          </Button>
                        </div>
                      ) : isEditing ? (
                        <div style={styles.emailEditRow}>
                          <input
                            type="email"
                            value={emailsMap[p.id] !== undefined ? emailsMap[p.id] : (p.email || '')}
                            onChange={(e) => setEmailsMap({ ...emailsMap, [p.id]: e.target.value })}
                            placeholder="Enter new email..."
                            style={styles.emailInput}
                          />
                          <Button size="sm" variant="accent" onClick={() => handleSaveEmail(p.id, emailsMap[p.id] !== undefined ? emailsMap[p.id] : p.email)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => {
                            setEditingEmailId(null);
                            const updated = { ...emailsMap };
                            delete updated[p.id];
                            setEmailsMap(updated);
                          }}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div style={styles.emailDisplayRow}>
                          <span style={styles.emailText}>
                            {p.email}
                          </span>
                          <button
                            style={styles.editBtn}
                            onClick={() => {
                              setEditingEmailId(p.id);
                              setEmailsMap({ ...emailsMap, [p.id]: p.email });
                            }}
                          >
                            Edit Email
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Report Selection options */}
                    <div style={styles.optionsBlock}>
                      <span style={styles.infoLabel}>Select Documents to Send:</span>
                      <div style={styles.radioGroup}>
                        <label style={styles.radioLabel}>
                          <input
                            type="radio"
                            name={`emailType-${p.id}`}
                            value="treatment"
                            checked={emailType === 'treatment'}
                            onChange={() => setEmailType('treatment')}
                          />
                          <span>Treatment Report</span>
                        </label>
                        <label style={styles.radioLabel}>
                          <input
                            type="radio"
                            name={`emailType-${p.id}`}
                            value="bill"
                            checked={emailType === 'bill'}
                            onChange={() => setEmailType('bill')}
                          />
                          <span>Bill Report</span>
                        </label>
                        <label style={styles.radioLabel}>
                          <input
                            type="radio"
                            name={`emailType-${p.id}`}
                            value="both"
                            checked={emailType === 'both'}
                            onChange={() => setEmailType('both')}
                          />
                          <span>Both (Treatment & Bill)</span>
                        </label>
                      </div>
                    </div>

                    {/* Send Button */}
                    <div style={styles.actionBlock}>
                      <Button
                        variant="primary"
                        style={{ width: '100%' }}
                        onClick={() => handleSendMail(item)}
                        loading={sendingId === p.id}
                      >
                        🚀 Send Email Report
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  },
  searchForm: {
    display: 'flex',
    gap: 'var(--space-sm)',
    marginBottom: 'var(--space-md)'
  },
  searchInput: {
    flex: 1,
    padding: '0.6rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: 'var(--text-sm)',
    outline: 'none'
  },
  resultsWrapper: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: 'var(--space-md)'
  },
  resultsTitle: {
    margin: '0 0 var(--space-md) 0',
    fontSize: 'var(--text-sm)',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
    gap: 'var(--space-md)'
  },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: 'var(--space-xs)',
    marginBottom: 'var(--space-xs)'
  },
  patientName: {
    margin: 0,
    fontSize: 'var(--text-base)',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  patientCode: {
    fontSize: '11px',
    color: 'var(--primary)',
    fontWeight: '700'
  },
  paymentBadge: {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'var(--text-xs)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    paddingBottom: '4px'
  },
  infoLabel: {
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  infoValue: {
    color: 'var(--text-primary)',
    fontWeight: '500'
  },
  emailBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    paddingBottom: '6px'
  },
  emailDisplayRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  emailText: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-primary)',
    fontWeight: '500'
  },
  editBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: 0
  },
  emailEditRow: {
    display: 'flex',
    gap: '6px',
    marginTop: '2px'
  },
  emailInput: {
    flex: 1,
    padding: '4px 8px',
    fontSize: '12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)'
  },
  optionsBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingLeft: '4px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    color: 'var(--text-secondary)'
  },
  actionBlock: {
    marginTop: 'var(--space-xs)'
  }
};

export default MailTab;
