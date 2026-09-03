import React, { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { whatsappService } from '../../../services/whatsappService';
import { generatePdf } from '../../../components/pdf/PdfGenerator';
import TreatmentReportTemplate from '../../../components/pdf/TreatmentReportTemplate';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../hooks/useToast';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { MessageSquare, Smartphone } from 'lucide-react';

export const WhatsAppTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [docType, setDocType] = useState('both'); // 'treatment' | 'bill' | 'both'
  const [customMsgMap, setCustomMsgMap] = useState({});
  const [dispatchingId, setDispatchingId] = useState(null);

  // Hidden PDF Template Data States
  const [treatmentData, setTreatmentData] = useState(null);

  const toast = useToast();
  const treatmentRef = useRef(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
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

      const patientIds = patientsData.map((p) => p.id);

      const { data: assignmentsData } = await supabase
        .from('patient_assignments')
        .select('*, physiotherapists(*)')
        .in('patient_id', patientIds);

      const { data: billingData } = await supabase
        .from('v_patient_billing')
        .select('*')
        .in('patient_id', patientIds);

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
      console.error('WhatsApp search error:', err);
      toast.error(`Search failed: ${err.message || 'Check database.'}`);
    } finally {
      setSearching(false);
    }
  };

  const handleDispatchWhatsApp = async (item) => {
    if (!item.patient.mobile) {
      toast.error('Patient has no registered phone number.');
      return;
    }

    setDispatchingId(item.patient.id);
    toast.info('Rendering documents & preparing WhatsApp message...');

    try {
      let pdfPublicUrl = null;

      // 1. Fetch sessions
      let sessions = [];
      if (item.assignment) {
        const { data } = await supabase
          .from('sessions')
          .select('*, patients(*), physiotherapists(*)')
          .eq('assignment_id', item.assignment.id);
        sessions = data || [];
      }

      // 2. Render & Upload PDF to Storage if needed
      if (docType === 'treatment' || docType === 'both') {
        setTreatmentData({ patient: item.patient, assignment: item.assignment, sessions });
        await new Promise((res) => setTimeout(res, 400));

        if (treatmentRef.current) {
          const blob = await generatePdf(treatmentRef.current, `treatment-report-${item.patient.patient_code}.pdf`);
          const path = `${item.patient.patient_code}/treatment-report-${Date.now()}.pdf`;
          const uploadRes = await storageService.uploadPdf(path, blob);
          if (uploadRes.data?.publicUrl) {
            pdfPublicUrl = uploadRes.data.publicUrl;
          }
        }
      }

      const invoiceNumber = `INV-${item.patient.patient_code.replace('-', '')}-${item.assignment?.id?.substr(0, 4).toUpperCase() || 'BILL'}`;

      // 3. Dispatch via WhatsApp service (Direct Web launch + API Hook)
      whatsappService.dispatchDirectWhatsApp({
        phone: item.patient.mobile,
        patientName: `${item.patient.first_name} ${item.patient.surname || ''}`,
        patientCode: item.patient.patient_code,
        docType,
        pdfPublicUrl,
        customMessage: customMsgMap[item.patient.id] || '',
        invoiceNumber,
        totalCost: item.billing?.total_cost || 0
      });

      toast.success(`WhatsApp message pre-filled & launched for ${item.patient.first_name}!`);
    } catch (err) {
      console.error('WhatsApp dispatch error:', err);
      toast.error(`WhatsApp launch error: ${err.message}`);
    } finally {
      setTreatmentData(null);
      setBillData(null);
      setDispatchingId(null);
    }
  };

  return (
    <div style={styles.container}>
      {/* Offscreen PDF render containers */}
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

      <Card
        title="💬 Patient WhatsApp Dispatcher"
        subtitle="Search patient records to send treatment reports, payment receipts, or custom clinical updates via WhatsApp."
        className="glass-panel"
      >
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            placeholder="Search patient name or surname for WhatsApp dispatch..."
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
            <h4 style={styles.resultsTitle}>Found Patients ({results.length})</h4>
            <div style={styles.resultsGrid}>
              {results.map((item) => {
                const { patient: p, assignment: a, billing: b } = item;
                const pName = `${p.first_name} ${p.surname || ''}`;
                const totalCost = b ? Number(b.total_cost) : 0;
                const isPaid = b ? b.is_paid : false;

                return (
                  <div key={p.id} style={styles.resultCard}>
                    <div style={styles.cardHeader}>
                      <div>
                        <h3 style={styles.patientName}>{pName}</h3>
                        <span style={styles.patientCode}>{p.patient_code}</span>
                      </div>
                      <div style={styles.phoneBadge}>
                        <Smartphone size={12} /> {p.mobile || 'No Mobile'}
                      </div>
                    </div>

                    <div style={styles.infoRow}>
                      <span style={styles.label}>Diagnosis:</span>
                      <span style={styles.val}>{a?.diagnosis || 'General Physical Therapy'}</span>
                    </div>

                    <div style={styles.infoRow}>
                      <span style={styles.label}>Ledger Total:</span>
                      <span style={styles.val}>₹{totalCost.toFixed(2)} ({isPaid ? 'Settled' : 'Pending'})</span>
                    </div>

                    {/* Custom Note/Message input */}
                    <div style={styles.customMsgBox}>
                      <span style={styles.label}>Custom Message / Instructions (Optional):</span>
                      <textarea
                        rows={2}
                        placeholder="e.g. Please bring your knee brace for tomorrow's 10 AM session..."
                        value={customMsgMap[p.id] || ''}
                        onChange={(e) => setCustomMsgMap({ ...customMsgMap, [p.id]: e.target.value })}
                        style={styles.textArea}
                      />
                    </div>

                    {/* Doc selection options */}
                    <div style={styles.optionsBlock}>
                      <span style={styles.label}>Select Document Link to Attach:</span>
                      <div style={styles.radioGroup}>
                        <label style={styles.radioLabel}>
                          <input
                            type="radio"
                            name={`waDocType-${p.id}`}
                            value="treatment"
                            checked={docType === 'treatment'}
                            onChange={() => setDocType('treatment')}
                          />
                          <span>Treatment Report PDF</span>
                        </label>
                        <label style={styles.radioLabel}>
                          <input
                            type="radio"
                            name={`waDocType-${p.id}`}
                            value="bill"
                            checked={docType === 'bill'}
                            onChange={() => setDocType('bill')}
                          />
                          <span>Billing Statement PDF</span>
                        </label>
                        <label style={styles.radioLabel}>
                          <input
                            type="radio"
                            name={`waDocType-${p.id}`}
                            value="both"
                            checked={docType === 'both'}
                            onChange={() => setDocType('both')}
                          />
                          <span>Both Reports</span>
                        </label>
                      </div>
                    </div>

                    <Button
                      variant="accent"
                      onClick={() => handleDispatchWhatsApp(item)}
                      loading={dispatchingId === p.id}
                      style={{ marginTop: 'var(--space-xs)' }}
                    >
                      <MessageSquare size={16} style={{ marginRight: 6 }} /> Send via WhatsApp
                    </Button>
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
    textTransform: 'uppercase'
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
    paddingBottom: 'var(--space-xs)'
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
  phoneBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--success)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'var(--text-xs)'
  },
  label: {
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  val: {
    color: 'var(--text-primary)'
  },
  customMsgBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  textArea: {
    width: '100%',
    padding: '6px 10px',
    fontSize: '12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    resize: 'vertical'
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
  }
};

export default WhatsAppTab;
