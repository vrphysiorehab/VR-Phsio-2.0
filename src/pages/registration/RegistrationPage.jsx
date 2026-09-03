import React, { useState, useRef, useEffect } from 'react';
import { Search, FileText, AlertTriangle, UserCheck, CheckCircle2, XCircle } from 'lucide-react';
import PersonalInfoSection from './IntakeForm/PersonalInfoSection';
import ClinicalHistorySection from './IntakeForm/ClinicalHistorySection';
import EmergencyContactSection from './IntakeForm/EmergencyContactSection';
import PreferencesReferralSection from './IntakeForm/PreferencesReferralSection';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SearchBar from '../../components/ui/SearchBar';
import { useToast } from '../../hooks/useToast';
import { usePatientSearch } from '../../hooks/usePatientSearch';
import { validatePatientForm } from '../../utils/validators';
import { generateUniquePatientCode } from '../../utils/idGenerator';
import { patientsService } from '../../services/patientsService';
import { storageService } from '../../services/storageService';
import { generatePdf } from '../../components/pdf/PdfGenerator';
import RegistrationFormTemplate from '../../components/pdf/RegistrationFormTemplate';
import styles from './RegistrationPage.module.css';
import { emailService } from '../../services/emailService';

const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const INITIAL_FORM_STATE = {
  registration_date: getTodayDateString(),
  title: '',
  first_name: '',
  middle_name: '',
  surname: '',
  dob: '',
  age: '',
  gender: '',
  mobile: '',
  email: '',
  address: '',
  occupation: '',
  going_to_gym: 'No',
  want_newsfeed: 'Yes',
  referral_source: 'Self',
  referral_details: '',
  present_complaints: '',
  history_of_illness: '',
  medical_history: {
    hypertension: false,
    diabetes: false,
    asthma: false,
    heart_condition: false,
    prior_surgeries: false,
    active_medications: false
  },
  personal_family_history: '',
  investigations: {
    xray: '',
    mri: '',
    blood_test: ''
  },
  emergency_contact: {
    name: '',
    relation: '',
    phone: ''
  }
};

export const RegistrationPage = () => {
  const [formValues, setFormValues] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pdfStep, setPdfStep] = useState('idle'); // idle | rendering | done
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState(null);
  const [patientForPdf, setPatientForPdf] = useState(null);
  const [createdPatientCode, setCreatedPatientCode] = useState('');

  // Stepper & Active Edit State
  const [activeStep, setActiveStep] = useState(1);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [editingPatientCode, setEditingPatientCode] = useState('');
  const [duplicatePatient, setDuplicatePatient] = useState(null);

  // Search Past Patient Modal State
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { query: searchQuery, setQuery: setSearchQuery, patients: searchResults, loading: searchLoading } = usePatientSearch();

  const toast = useToast();
  const pdfRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Auto-restore saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vr_physio_registration_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.first_name) {
          setFormValues((prev) => ({ ...prev, ...parsed }));
          toast.info('Restored unsubmitted registration draft.');
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved draft:', e);
    }
  }, []);

  // Instant Duplicate Patient Check on Mobile typing
  useEffect(() => {
    if (editingPatientId) return;
    const cleanMobile = formValues.mobile ? formValues.mobile.trim() : '';
    if (cleanMobile.length >= 7) {
      const timer = setTimeout(async () => {
        const { data } = await patientsService.searchPatients(cleanMobile);
        if (data && data.length > 0) {
          const match = data.find(p => p.mobile && (p.mobile === cleanMobile || p.mobile.endsWith(cleanMobile)));
          if (match) setDuplicatePatient(match);
          else setDuplicatePatient(null);
        } else {
          setDuplicatePatient(null);
        }
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setDuplicatePatient(null);
    }
  }, [formValues.mobile, editingPatientId]);

  const handleFieldChange = (field, value) => {
    const updated = {
      ...formValues,
      [field]: value
    };
    setFormValues(updated);

    // Save draft if not editing existing patient
    if (!editingPatientId) {
      try {
        localStorage.setItem('vr_physio_registration_draft', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not persist registration draft');
      }
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleLoadExistingPatient = (patientRecord) => {
    if (!patientRecord) return;
    const intake = patientRecord.intake_data || {};

    setFormValues({
      registration_date: patientRecord.registration_date || intake.registration_date || getTodayDateString(),
      title: patientRecord.title || intake.title || '',
      first_name: patientRecord.first_name || '',
      middle_name: patientRecord.middle_name || '',
      surname: patientRecord.surname || '',
      dob: patientRecord.dob || '',
      age: patientRecord.age !== undefined && patientRecord.age !== null ? String(patientRecord.age) : '',
      gender: patientRecord.gender || '',
      mobile: patientRecord.mobile || '',
      email: patientRecord.email || '',
      address: patientRecord.address || '',
      occupation: patientRecord.occupation || '',
      going_to_gym: intake.going_to_gym || patientRecord.going_to_gym || 'No',
      want_newsfeed: intake.want_newsfeed || patientRecord.want_newsfeed || 'Yes',
      referral_source: intake.referral_source || patientRecord.referral_source || 'Self',
      referral_details: intake.referral_details || patientRecord.referral_details || '',
      present_complaints: patientRecord.present_complaints || intake.present_complaints || '',
      history_of_illness: patientRecord.history_of_illness || intake.history_of_illness || '',
      medical_history: patientRecord.medical_history || intake.medical_history || {
        hypertension: false,
        diabetes: false,
        asthma: false,
        heart_condition: false,
        prior_surgeries: false,
        active_medications: false
      },
      personal_family_history: patientRecord.personal_family_history || intake.personal_family_history || '',
      investigations: patientRecord.investigations || intake.investigations || {
        xray: '',
        mri: '',
        blood_test: ''
      },
      emergency_contact: patientRecord.emergency_contact || intake.emergency_contact || {
        name: '',
        relation: '',
        phone: ''
      }
    });

    setEditingPatientId(patientRecord.id);
    setEditingPatientCode(patientRecord.patient_code);
    setDuplicatePatient(null);
    setShowSearchModal(false);
    toast.success(`Loaded registration form for ${patientRecord.first_name} (${patientRecord.patient_code}). You can now edit and update.`);
  };

  const handleCancelEditMode = () => {
    setEditingPatientId(null);
    setEditingPatientCode('');
    handleReset();
    toast.info('Switched back to new patient registration mode.');
  };

  const handlePrintBlankForm = () => {
    toast.info('Rendering blank paper intake form for offline printing...');
    const blankPatient = {
      patient_code: 'BLANK-INTAKE-FORM',
      title: '____',
      first_name: '______________________',
      surname: '______________________',
      mobile: '______________________',
      present_complaints: '__________________________________________________________________________________',
      registration_date: getTodayDateString()
    };
    setPatientForPdf(blankPatient);
    setPdfStep('rendering');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validatePatientForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please correct the validation errors in the form.');
      return;
    }

    setLoading(true);
    setPdfStep('rendering');
    toast.info('Rendering and compiling intake PDF document...');

    try {
      let patientCode = editingPatientCode;
      if (!editingPatientId) {
        patientCode = await generateUniquePatientCode();
      }
      setCreatedPatientCode(patientCode);

      const patientData = {
        ...formValues,
        patient_code: patientCode,
        intake_data: { ...formValues }
      };

      setPatientForPdf(patientData);
    } catch (err) {
      console.error('Registration setup error:', err);
      toast.error('Failed to prepare registration. Please retry.');
      setLoading(false);
      setPdfStep('idle');
    }
  };

  // PDF generation and upload effect
  useEffect(() => {
    if (patientForPdf && pdfStep === 'rendering') {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      const renderAndUpload = async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        try {
          if (!pdfRef.current) {
            throw new Error('PDF off-screen container ref is missing.');
          }

          const code = patientForPdf.patient_code;
          const isBlankPrint = code === 'BLANK-INTAKE-FORM';

          // Generate PDF Blob
          const blob = await generatePdf(pdfRef.current, `registration-${code}.pdf`);

          if (isBlankPrint) {
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            toast.success('Blank intake PDF opened for printing.');
            setPdfStep('idle');
            setPatientForPdf(null);
            setLoading(false);
            isProcessingRef.current = false;
            return;
          }
          
          toast.info('Uploading registration PDF to storage...');

          // Upload PDF to Supabase Storage
          const path = `${code}/registration.pdf`;
          const uploadRes = await storageService.uploadPdf(path, blob);
          if (uploadRes.error) throw uploadRes.error;

          const publicUrl = uploadRes.data.publicUrl;
          setUploadedPdfUrl(publicUrl);

          toast.info(editingPatientId ? 'Updating patient record in database...' : 'Saving patient details to database...');

          const {
            going_to_gym,
            want_newsfeed,
            referral_source,
            referral_details,
            ...validColumns
          } = patientForPdf;

          const ageNum = validColumns.age !== undefined && validColumns.age !== null && validColumns.age !== '' ? Number(validColumns.age) : null;
          const dobStr = validColumns.dob !== undefined && validColumns.dob !== null && validColumns.dob !== '' ? validColumns.dob : null;

          const patientPayload = {
            ...validColumns,
            age: ageNum,
            dob: dobStr,
            intake_data: {
              ...(patientForPdf.intake_data || {}),
              going_to_gym: going_to_gym || 'No',
              want_newsfeed: want_newsfeed || 'Yes',
              referral_source: referral_source || 'Self',
              referral_details: referral_details || '',
              registration_date: patientForPdf.registration_date || getTodayDateString()
            },
            registration_pdf_url: publicUrl
          };

          let saveRes;
          if (editingPatientId) {
            saveRes = await patientsService.updatePatient(editingPatientId, patientPayload);
            if (saveRes.error && (saveRes.error.code === 'PGRST204' || saveRes.error.message?.includes('registration_date'))) {
              const { registration_date, ...stripped } = patientPayload;
              saveRes = await patientsService.updatePatient(editingPatientId, stripped);
            }
          } else {
            saveRes = await patientsService.createPatient(patientPayload);
            if (saveRes.error && (saveRes.error.code === 'PGRST204' || saveRes.error.message?.includes('registration_date'))) {
              const { registration_date, ...stripped } = patientPayload;
              saveRes = await patientsService.createPatient(stripped);
            }
          }

          if (saveRes.error) throw saveRes.error;

          // Clear local draft
          localStorage.removeItem('vr_physio_registration_draft');

          toast.success(
            editingPatientId
              ? `Patient record updated successfully! Code: ${code}`
              : `Patient registered successfully! Assigned Code: ${code}`
          );
          
          // Send non-blocking welcome email with Intake PDF attachment
          if (patientForPdf.email) {
            const fullName = [patientForPdf.title, patientForPdf.first_name, patientForPdf.middle_name, patientForPdf.surname].filter(Boolean).join(' ');
            toast.info('Sending registration confirmation email...');
            emailService.sendIntakeEmail(patientForPdf.email, code, fullName, blob)
              .then(res => {
                if (res.success) {
                  toast.success('Confirmation email sent to patient.');
                } else {
                  console.warn("Intake email failed to send:", res.error);
                }
              })
              .catch(err => console.error("Error sending welcome email:", err));
          }

          setPdfStep('done');
        } catch (err) {
          console.error('PDF generation or DB update failed:', err);
          toast.error(`Operation failed: ${err.message || 'Check connection'}. You can retry.`);
          setPdfStep('idle');
        } finally {
          setPatientForPdf(null);
          setLoading(false);
          isProcessingRef.current = false;
        }
      };

      renderAndUpload();
    }
  }, [patientForPdf, pdfStep, createdPatientCode, editingPatientId, toast]);

  const handleReset = () => {
    setFormValues({
      ...INITIAL_FORM_STATE,
      registration_date: getTodayDateString()
    });
    setErrors({});
    setPdfStep('idle');
    setUploadedPdfUrl(null);
    setCreatedPatientCode('');
    setEditingPatientId(null);
    setEditingPatientCode('');
    setDuplicatePatient(null);
    try {
      localStorage.removeItem('vr_physio_registration_draft');
    } catch (e) {
      console.warn('Could not clear draft');
    }
  };

  const handlePrint = () => {
    if (uploadedPdfUrl) {
      window.open(uploadedPdfUrl, '_blank');
    }
  };

  return (
    <div className={styles.container}>
      {/* Off-screen PDF content wrapper */}
      <div className="pdf-print-wrapper">
        <div ref={pdfRef}>
          {patientForPdf && <RegistrationFormTemplate patient={patientForPdf} />}
        </div>
      </div>

      {/* Search Past Patient Modal */}
      <Modal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        title="Search & Edit Existing Patient Record"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Look up a past registered patient to load their full intake form, modify details, and save updates.
          </p>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search patient by name, code, mobile..."
          />

          <div className={styles.patientList}>
            {searchLoading ? (
              <div className={styles.searchState}>Searching patient directory...</div>
            ) : searchResults.length === 0 ? (
              <div className={styles.searchState}>
                {searchQuery ? 'No matching patient records found.' : 'Type above to query existing patients'}
              </div>
            ) : (
              searchResults.map((p) => (
                <div
                  key={p.id}
                  className={styles.patientItem}
                  onClick={() => handleLoadExistingPatient(p)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                      {p.first_name} {p.surname}
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Code: {p.patient_code} | Mobile: {p.mobile || 'N/A'}
                    </span>
                  </div>
                  <Button size="sm" variant="outline">
                    Load & Edit
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      <Card
        title={
          pdfStep === 'done'
            ? 'Intake Form Processed'
            : editingPatientId
            ? `Editing Patient Form: ${editingPatientCode}`
            : 'New Patient Registration Form'
        }
        subtitle={
          pdfStep === 'done'
            ? `Patient Code: ${createdPatientCode}`
            : editingPatientId
            ? 'Update demographics, complaints, and medical history.'
            : 'Fill in mandatory demographics (*), complaints, and medical history.'
        }
        extra={
          pdfStep !== 'done' && (
            <div className={styles.headerActions}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearchModal(true)}
              >
                <Search size={14} /> Search & Edit Past Patient
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrintBlankForm}
              >
                <FileText size={14} /> Print Blank Form
              </Button>
            </div>
          )
        }
        className="glass-panel"
      >
        {pdfStep === 'done' ? (
          <div className={styles.successState}>
            <div className={styles.successIconWrapper}>✓</div>
            <h3>{editingPatientId ? 'Patient Record Updated!' : 'Registration Complete!'}</h3>
            <p>
              The intake documents have been compiled into an official A4 PDF form, uploaded to clinic storage, and saved under patient code:{' '}
              <strong>{createdPatientCode}</strong>.
            </p>
            <div className={styles.actionRow}>
              <Button onClick={handlePrint} variant="accent" size="lg">
                Print / Open PDF
              </Button>
              <Button onClick={handleReset} variant="secondary" size="lg">
                Register Another Patient
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Active Edit Mode Banner */}
            {editingPatientId && (
              <div className={styles.editingBanner}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={18} />
                  <span>
                    Editing Past Patient Record: <strong>{editingPatientCode}</strong>
                  </span>
                </div>
                <Button size="sm" variant="ghost" type="button" onClick={handleCancelEditMode}>
                  <XCircle size={14} style={{ marginRight: '4px' }} /> Cancel Edit Mode
                </Button>
              </div>
            )}

            {/* Instant Duplicate Mobile Warning Banner */}
            {duplicatePatient && !editingPatientId && (
              <div className={styles.duplicateWarning}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} />
                  <span>
                    Matching patient found: <strong>{duplicatePatient.first_name} {duplicatePatient.surname} ({duplicatePatient.patient_code})</strong> - Mobile: {duplicatePatient.mobile}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  type="button"
                  onClick={() => handleLoadExistingPatient(duplicatePatient)}
                >
                  Load Existing Record to Edit
                </Button>
              </div>
            )}

            {/* Stepper Navigation Bar */}
            <div className={styles.stepper}>
              <div
                className={`${styles.stepItem} ${activeStep === 1 ? styles.stepActive : ''}`}
                onClick={() => setActiveStep(1)}
              >
                <span>1. Personal Demographics</span>
              </div>
              <div
                className={`${styles.stepItem} ${activeStep === 2 ? styles.stepActive : ''}`}
                onClick={() => setActiveStep(2)}
              >
                <span>2. Clinical History</span>
              </div>
              <div
                className={`${styles.stepItem} ${activeStep === 3 ? styles.stepActive : ''}`}
                onClick={() => setActiveStep(3)}
              >
                <span>3. Emergency Contact</span>
              </div>
              <div
                className={`${styles.stepItem} ${activeStep === 4 ? styles.stepActive : ''}`}
                onClick={() => setActiveStep(4)}
              >
                <span>4. Preferences & Referral</span>
              </div>
            </div>

            <PersonalInfoSection
              values={formValues}
              onChange={handleFieldChange}
              errors={errors}
            />
            
            <ClinicalHistorySection
              values={formValues}
              onChange={handleFieldChange}
              errors={errors}
            />

            <EmergencyContactSection
              values={formValues}
              onChange={handleFieldChange}
            />

            <PreferencesReferralSection
              values={formValues}
              onChange={handleFieldChange}
            />

            <div className={styles.formActions}>
              <Button type="button" onClick={handleReset} variant="ghost" disabled={loading}>
                Reset Form
              </Button>
              <Button type="submit" variant="primary" loading={loading}>
                {editingPatientId ? 'Update Patient Record & PDF' : 'Submit & Compile PDF'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default RegistrationPage;
