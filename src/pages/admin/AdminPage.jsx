import React, { useState, useRef, useEffect } from 'react';
import Tabs from '../../components/ui/Tabs';
import { useAdminMetrics } from '../../hooks/useAdminMetrics';
import { useToast } from '../../hooks/useToast';
import { assignmentsService } from '../../services/assignmentsService';
import { sessionsService } from '../../services/sessionsService';
import { storageService } from '../../services/storageService';
import { generatePdf } from '../../components/pdf/PdfGenerator';
import TreatmentReportTemplate from '../../components/pdf/TreatmentReportTemplate';
import RevenueAuthModal from './components/RevenueAuthModal';

import DashboardTab from './tabs/DashboardTab';
import PatientsTab from './tabs/PatientsTab';
import BillingTab from './tabs/BillingTab';
import AssignmentsTab from './tabs/AssignmentsTab';
import PhysioTab from './tabs/PhysioTab';
import MailTab from './tabs/MailTab';
import WhatsAppTab from './tabs/WhatsAppTab';
import NotesTab from './tabs/NotesTab';

import styles from './AdminPage.module.css';

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mutating, setMutating] = useState(false);
  const [reportStep, setReportStep] = useState('idle');
  const [pdfData, setPdfData] = useState(null);

  // Restricted Head Security Vault State
  const [isRevenueUnlocked, setIsRevenueUnlocked] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [masterPin, setMasterPin] = useState(() => {
    return localStorage.getItem('vr_physio_master_pin') || '1234';
  });

  const metrics = useAdminMetrics();
  const toast = useToast();
  const pdfRef = useRef(null);
  const isProcessingRef = useRef(false);

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'patients', label: '👥 Patients EHR' },
    { id: 'billing', label: '💳 Financial Ledger' },
    { id: 'assignments', label: '📋 Therapy Plans' },
    { id: 'mail', label: '✉ Email Services' },
    { id: 'whatsapp', label: '💬 WhatsApp Dispatch' },
    { id: 'notes', label: '📝 Clinical Notes' }
  ];

  const handleUpdatePin = (newPin) => {
    setMasterPin(newPin);
    localStorage.setItem('vr_physio_master_pin', newPin);
    toast.success('Master Security PIN updated successfully!');
  };

  const handleMarkAsPaid = async (assignmentId) => {
    setMutating(true);
    try {
      const { error } = await assignmentsService.markAsPaid(assignmentId);
      if (error) throw error;
      
      toast.success('Invoice marked as Paid successfully.');
      metrics.refresh();
    } catch (err) {
      console.error('Mark paid error:', err);
      toast.error(`Failed to mark payment: ${err.message || 'Check database.'}`);
    } finally {
      setMutating(false);
    }
  };

  const handleEndTreatment = async (assignmentId) => {
    setMutating(true);
    try {
      const { error } = await assignmentsService.endTreatment(assignmentId);
      if (error) throw error;
      
      toast.success('Therapeutic treatment ended and case file closed.');
      metrics.refresh();
    } catch (err) {
      console.error('End treatment error:', err);
      toast.error(`Failed to close case: ${err.message || 'Check connection.'}`);
    } finally {
      setMutating(false);
    }
  };

  const handleReactivateTreatment = async (assignmentId) => {
    setMutating(true);
    try {
      const { error } = await assignmentsService.reactivateTreatment(assignmentId);
      if (error) throw error;
      
      toast.success('Therapeutic treatment plan reactivated.');
      metrics.refresh();
    } catch (err) {
      console.error('Reactivate treatment error:', err);
      toast.error(`Failed to reactivate case: ${err.message || 'Check connection.'}`);
    } finally {
      setMutating(false);
    }
  };

  const handlePrintReport = async (patient, assignment) => {
    setReportStep('generating');
    toast.info('Fetching treatment logs and generating Case Report PDF...');

    try {
      const { data: sessions, error } = await sessionsService.getSessionsByAssignmentId(assignment.id);
      if (error) throw error;

      setPdfData({
        patient,
        assignment,
        sessions: sessions || []
      });
    } catch (err) {
      console.error('Error fetching sessions for report:', err);
      toast.error('Failed to load session details to compile report.');
      setReportStep('idle');
    }
  };

  useEffect(() => {
    if (pdfData && reportStep === 'generating') {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      const compileReport = async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        try {
          if (!pdfRef.current) throw new Error('Report DOM Element Ref is missing.');

          const timestamp = Date.now();
          const filename = `treatment-report-${pdfData.patient.patient_code}-${timestamp}.pdf`;
          
          const blob = await generatePdf(pdfRef.current, filename);
          
          toast.info('Uploading case file PDF to archives...');
          
          const path = `${pdfData.patient.patient_code}/treatment-report-${timestamp}.pdf`;
          const uploadRes = await storageService.uploadPdf(path, blob);
          if (uploadRes.error) throw uploadRes.error;

          const publicUrl = uploadRes.data.publicUrl;
          setReportStep('done');
          toast.success('Treatment Case Report compiled and uploaded!');
          
          window.open(publicUrl, '_blank');
        } catch (err) {
          console.error('Case report print error:', err);
          toast.error(`Report print failed: ${err.message || 'Check database storage bucket.'}`);
          setReportStep('idle');
        } finally {
          setPdfData(null);
          isProcessingRef.current = false;
        }
      };

      compileReport();
    }
  }, [pdfData, reportStep, toast]);

  const handleOpenMailForPatient = () => {
    setActiveTab('mail');
  };

  const handleOpenWhatsAppForPatient = () => {
    setActiveTab('whatsapp');
  };

  const renderTabContent = () => {
    if (metrics.loading && activeTab === 'dashboard') {
      return <div className={styles.loadingState}>Loading metrics data & roster logs...</div>;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardTab
            metrics={metrics}
            isRevenueUnlocked={isRevenueUnlocked}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
            onLockVault={() => setIsRevenueUnlocked(false)}
          />
        );
      case 'patients':
        return (
          <PatientsTab
            patients={metrics.allPatients}
            assignments={metrics.allAssignments}
            billing={metrics.allBilling}
            onPrintReport={handlePrintReport}
            reportStep={reportStep}
            onOpenMail={handleOpenMailForPatient}
            onOpenWhatsApp={handleOpenWhatsAppForPatient}
          />
        );
      case 'billing':
        return (
          <BillingTab
            billing={metrics.allBilling}
            onMarkAsPaid={handleMarkAsPaid}
            mutating={mutating}
            isRevenueUnlocked={isRevenueUnlocked}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
          />
        );
      case 'assignments':
        return (
          <AssignmentsTab
            assignments={metrics.allAssignments}
            sessions={metrics.allSessions}
            onEndTreatment={handleEndTreatment}
            onReactivateTreatment={handleReactivateTreatment}
            mutating={mutating}
          />
        );
      case 'mail':
        return <MailTab />;
      case 'whatsapp':
        return <WhatsAppTab />;
      case 'notes':
        return (
          <NotesTab
            physios={metrics.physioPerformance}
            onNoteCreated={() => metrics.refresh()}
          />
        );
      default:
        return (
          <DashboardTab
            metrics={metrics}
            isRevenueUnlocked={isRevenueUnlocked}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
            onLockVault={() => setIsRevenueUnlocked(false)}
          />
        );
    }
  };

  return (
    <div className={styles.container}>
      {/* Revenue Auth Modal */}
      <RevenueAuthModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onUnlock={() => setIsRevenueUnlocked(true)}
        currentPin={masterPin}
        onUpdatePin={handleUpdatePin}
      />

      {/* Off-screen PDF printing container */}
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

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      {metrics.error && (
        <div className={styles.errorBanner}>
          ⚠️ <strong>Roster Sync Issue:</strong> {metrics.error}. Please check database connection.
        </div>
      )}
      
      <div className={styles.content}>{renderTabContent()}</div>
    </div>
  );
};

export default AdminPage;
