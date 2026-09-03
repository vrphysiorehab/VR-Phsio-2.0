import React, { useState, useRef, useEffect } from 'react';
import { FileText, Award, Calendar, CheckSquare, RefreshCw, Clock, ExternalLink } from 'lucide-react';
import SearchBar from '../../components/ui/SearchBar';
import SessionLedger from './SessionLedger';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { usePatientSearch } from '../../hooks/usePatientSearch';
import { usePatientSessions } from '../../hooks/usePatientSessions';
import { useToast } from '../../hooks/useToast';
import { storageService } from '../../services/storageService';
import { generatePdf } from '../../components/pdf/PdfGenerator';
import TreatmentReportTemplate from '../../components/pdf/TreatmentReportTemplate';
import { formatDateTime } from '../../utils/dateHelpers';
import styles from './TreatmentPage.module.css';

export const TreatmentPage = () => {
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [reportStep, setReportStep] = useState('idle'); // idle | generating | done
  const [reportUrl, setReportUrl] = useState(null);
  const [pdfData, setPdfData] = useState(null); // data to pass to PDF component

  // Search state
  const { query, setQuery, patients, loading: searchLoading } = usePatientSearch();

  // Patient Case state
  const {
    patient,
    sessions,
    assignments,
    activeAssignment,
    selectedAssignmentId,
    setSelectedAssignmentId,
    loading: patientLoading,
    mutating,
    endTreatment,
    reactivateTreatment,
    refresh
  } = usePatientSessions(selectedPatientId);

  const toast = useToast();
  const pdfRef = useRef(null);
  const isProcessingRef = useRef(false);

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setReportStep('idle');
    setReportUrl(null);
  };

  const handleEndTreatmentClick = () => {
    setShowEndModal(true);
  };

  const handleConfirmEndTreatment = async () => {
    setShowEndModal(false);
    const { error } = await endTreatment();
    if (error) {
      toast.error(`Failed to close case: ${error.message || 'Check connection.'}`);
    } else {
      toast.success('Rehabilitation treatment ended and case closed successfully!');
    }
  };

  const handleReactivateTreatmentClick = () => {
    setShowReactivateModal(true);
  };

  const handleConfirmReactivateTreatment = async () => {
    setShowReactivateModal(false);
    if (!activeAssignment) return;
    const { error } = await reactivateTreatment(activeAssignment.id);
    if (error) {
      toast.error(`Failed to reactivate case: ${error.message || 'Check connection.'}`);
    } else {
      toast.success('Rehabilitation treatment plan reactivated successfully!');
    }
  };

  const handlePrintReportClick = async () => {
    if (!patient || !activeAssignment) return;
    
    setReportStep('generating');
    toast.info('Generating clinical treatment report PDF...');

    // Set pdf data to trigger render
    setPdfData({
      patient,
      assignment: activeAssignment,
      sessions
    });
  };

  // PDF report compiling and upload effect
  useEffect(() => {
    if (pdfData && reportStep === 'generating') {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      const compileReport = async () => {
        // Wait for React to render the component off-screen
        await new Promise((resolve) => setTimeout(resolve, 300));

        try {
          if (!pdfRef.current) {
            throw new Error('Report element ref not found');
          }

          const timestamp = Date.now();
          const filename = `treatment-report-${patient.patient_code}-${timestamp}.pdf`;
          
          // Generate PDF Blob
          const blob = await generatePdf(pdfRef.current, filename);
          
          toast.info('Uploading report PDF to clinical database...');
          
          // Upload PDF to Supabase Storage
          const path = `${patient.patient_code}/treatment-report-${timestamp}.pdf`;
          const uploadRes = await storageService.uploadPdf(path, blob);
          if (uploadRes.error) throw uploadRes.error;

          const publicUrl = uploadRes.data.publicUrl;
          setReportUrl(publicUrl);
          setReportStep('done');
          toast.success('Clinical report compiled successfully!');
          
          // Open PDF in new tab
          window.open(publicUrl, '_blank');
        } catch (err) {
          console.error('Error generating treatment report PDF:', err);
          toast.error(`Report generation failed: ${err.message || 'Check database settings'}`);
          setReportStep('idle');
        } finally {
          // Cleanup component from DOM
          setPdfData(null);
          isProcessingRef.current = false;
        }
      };

      compileReport();
    }
  }, [pdfData, reportStep, patient, toast]);

  const sortedSessionsForStats = [...(sessions || [])].sort((a, b) => {
    const timeA = new Date(a.session_date || 0).getTime();
    const timeB = new Date(b.session_date || 0).getTime();
    return timeA - timeB;
  });
  const totalCost = sessions ? sessions.reduce((acc, s) => acc + Number(s.cost || 0), 0) : 0;
  const avgCost = sessions && sessions.length > 0 ? totalCost / sessions.length : 0;
  const firstSessionDate = sortedSessionsForStats[0]
    ? formatDateTime(sortedSessionsForStats[0].session_date)
    : '—';
  const latestSessionDate = sortedSessionsForStats[sortedSessionsForStats.length - 1]
    ? formatDateTime(sortedSessionsForStats[sortedSessionsForStats.length - 1].session_date)
    : '—';

  return (
    <div className={styles.container}>
      {/* Off-screen PDF container */}
      <div className="pdf-print-wrapper">
        <div ref={pdfRef}>
          {pdfData && (
            <TreatmentReportTemplate
              patient={pdfData.patient}
              assignment={pdfData.assignment}
              sessions={pdfData.sessions}
            />
          )}
        </div>
      </div>

      {/* Case Closure Confirmation Modal */}
      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="Confirm Case Closure"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowEndModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmEndTreatment} loading={mutating}>
              End Treatment & Close Case
            </Button>
          </>
        }
      >
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Are you sure you want to end treatment for{' '}
          <strong>
            {patient?.first_name} {patient?.surname}
          </strong>
          ? This will mark the active therapist assignment as completed and disable further session logging under this plan.
        </p>
      </Modal>

      {/* Case Reactivation Confirmation Modal */}
      <Modal
        isOpen={showReactivateModal}
        onClose={() => setShowReactivateModal(false)}
        title="Reactivate Rehabilitation Plan"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowReactivateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmReactivateTreatment} loading={mutating}>
              Confirm & Re-open Case
            </Button>
          </>
        }
      >
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Are you sure you want to reactivate the treatment plan for{' '}
          <strong>
            {patient?.first_name} {patient?.surname}
          </strong>
          ? This will mark the case as Active and allow logging new physiotherapy sessions.
        </p>
      </Modal>

      <div className={styles.sidebarSection}>
        <Card title="Patient Lookup" subtitle="Search and select clinical records" className="glass-panel">
          <SearchBar value={query} onChange={setQuery} placeholder="Search name, code, mobile..." />
          
          <div className={styles.patientList}>
            {searchLoading ? (
              <div className={styles.searchState}>Searching patients...</div>
            ) : patients.length === 0 ? (
              <div className={styles.searchState}>
                {query ? 'No patients match search' : 'Type above to look up patient records'}
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
        {patientLoading ? (
          <div className={styles.centeredState}>Loading case records...</div>
        ) : !selectedPatientId ? (
          <div className={styles.selectPrompt}>
            <FileText size={48} style={{ opacity: 0.5, marginBottom: 'var(--space-md)' }} />
            <h3>No Patient Selected</h3>
            <p>Look up a patient using the left search sidebar to review their clinical session ledger and download treatment reports.</p>
          </div>
        ) : (
          <div className={styles.recordsWrapper}>
            {/* Header section */}
            <div className={`${styles.patientHeader} glass-panel`}>
              <div className={styles.headerDetails}>
                <div className={styles.nameRow}>
                  <h1>
                    {patient?.first_name} {patient?.surname}
                  </h1>
                  {activeAssignment ? (
                    <Badge variant={activeAssignment.is_active ? 'success' : 'secondary'}>
                      {activeAssignment.is_active ? 'Active Treatment' : 'Case Closed'}
                    </Badge>
                  ) : (
                    <Badge variant="danger">No Active Assignment</Badge>
                  )}
                </div>
                
                <div className={styles.metaRow}>
                  <span className={styles.metaBadge}>{patient?.patient_code}</span>
                  <span>DOB: {patient?.dob}</span>
                  <span>Mobile: {patient?.mobile}</span>
                </div>
              </div>
              
              {activeAssignment && (
                <div className={styles.headerActions}>
                  {reportUrl ? (
                    <Button
                      onClick={() => window.open(reportUrl, '_blank')}
                      variant="secondary"
                    >
                      <ExternalLink size={15} />
                      View Report PDF
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePrintReportClick}
                      variant="outline"
                      loading={reportStep === 'generating'}
                    >
                      Print Treatment Report
                    </Button>
                  )}
                  
                  {activeAssignment.is_active ? (
                    <Button onClick={handleEndTreatmentClick} variant="danger">
                      End Treatment / Close Case
                    </Button>
                  ) : (
                    <Button onClick={handleReactivateTreatmentClick} variant="primary">
                      <RefreshCw size={15} />
                      Reactivate / Re-open Case
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Treatment Course Selector */}
            {assignments.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', padding: '12px 16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    Select Treatment Course ({assignments.length}):
                  </label>
                  <select
                    value={selectedAssignmentId || ''}
                    onChange={(e) => setSelectedAssignmentId(e.target.value)}
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
                    {assignments.map((assign, idx) => (
                      <option key={assign.id} value={assign.id}>
                        Course #{assignments.length - idx}: {assign.diagnosis || 'Rehab Plan'} ({assign.is_active ? 'Active' : 'Closed'}) - {assign.physiotherapists?.name || assign.physiotherapist?.name || 'Therapist'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeAssignment ? (
              <div className={styles.caseGrid}>
                {/* Stats panel */}
                <div className={styles.statsPanel}>
                  <Card title="Case File Summary" className="glass-panel">
                    <div className={styles.statsGrid}>
                      <div className={styles.statCard}>
                        <Calendar size={18} className={styles.statIcon} />
                        <div className={styles.statDetails}>
                          <span className={styles.statLabel}>Therapeutic Diagnosis</span>
                          <span className={styles.statValue}>
                            {activeAssignment.diagnosis || 'General Physical Therapy'}
                          </span>
                        </div>
                      </div>
                      
                      <div className={styles.statCard}>
                        <Award size={18} className={styles.statIcon} />
                        <div className={styles.statDetails}>
                          <span className={styles.statLabel}>Assigned Specialist</span>
                          <span className={styles.statValue}>
                            {activeAssignment.physiotherapists?.name || 'Unassigned'}
                          </span>
                        </div>
                      </div>

                      <div className={styles.statCard}>
                        <CheckSquare size={18} className={styles.statIcon} />
                        <div className={styles.statDetails}>
                          <span className={styles.statLabel}>Sessions Logged</span>
                          <span className={styles.statValue}>{sessions.length} sessions</span>
                        </div>
                      </div>

                      <div className={styles.statCard}>
                        <div className={styles.statDetails}>
                          <span className={styles.statLabel}>Accrued Treatment Cost</span>
                          <span className={`${styles.statValue} ${styles.costText}`}>
                            ₹{totalCost.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.statCard}>
                        <Clock size={18} className={styles.statIcon} />
                        <div className={styles.statDetails}>
                          <span className={styles.statLabel}>Treatment Start Date</span>
                          <span className={styles.statValue}>{firstSessionDate}</span>
                        </div>
                      </div>

                      <div className={styles.statCard}>
                        <Clock size={18} className={styles.statIcon} />
                        <div className={styles.statDetails}>
                          <span className={styles.statLabel}>Latest Session Date</span>
                          <span className={styles.statValue}>{latestSessionDate}</span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                            Avg: ₹{avgCost.toFixed(2)} / session
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Session ledger */}
                <SessionLedger sessions={sessions} patient={patient} assignment={activeAssignment} />
              </div>
            ) : (
              <div className={styles.centeredState}>
                <Card title="No Case File" subtitle="No active or inactive assignments indexed for this patient." className="glass-panel">
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    To record sessions and open a case file, assign a physiotherapist in the{' '}
                    <strong>Session Logger</strong> tab.
                  </p>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentPage;
