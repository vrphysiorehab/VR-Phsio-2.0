import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { User, Shield, Award, Briefcase, CreditCard, CheckCircle, ChevronRight, ChevronLeft, Upload, FileText, Camera, Check, Save } from 'lucide-react';
import compressImage from '../../../utils/imageCompressor';

export const PhysioProfileWizardModal = ({ isOpen, onClose, physio, profileData, onSave, mutating }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        full_name: physio?.name || '',
        designation: physio?.designation || 'Physiotherapist',
        phone: physio?.phone || '',
        gender: 'Male',
        remuneration_type: 'Fixed Salary + Consultation Share',
        working_days: 'Monday to Saturday',
        working_hours: '09:00 AM - 05:00 PM',
        ...profileData
      });
    }
  }, [isOpen, physio, profileData]);

  if (!isOpen) return null;

  const updateField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleFileUpload = async (field, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        try {
          const compressed = await compressImage(file, 600, 600, 0.85);
          updateField(field, compressed);
        } catch (e) {
          const reader = new FileReader();
          reader.onloadend = () => updateField(field, reader.result);
          reader.readAsDataURL(file);
        }
      } else {
        const reader = new FileReader();
        reader.onloadend = () => updateField(field, reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSaveDraft = (e) => {
    if (e) e.preventDefault();
    onSave(formData, false);
  };

  const handleFinalSubmit = (e) => {
    if (e) e.preventDefault();
    onSave(formData, true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`📋 Enrollment Wizard - ${physio?.name || 'Physiotherapist'}`}>
      <div style={styles.container}>
        {/* Step Indicator Header */}
        <div style={styles.stepHeader}>
          <div
            style={{ ...styles.stepBadge, backgroundColor: step === 1 ? 'var(--primary)' : 'rgba(255,255,255,0.05)', cursor: 'pointer' }}
            onClick={() => setStep(1)}
          >
            1. Personal
          </div>
          <div
            style={{ ...styles.stepBadge, backgroundColor: step === 2 ? 'var(--primary)' : 'rgba(255,255,255,0.05)', cursor: 'pointer' }}
            onClick={() => setStep(2)}
          >
            2. Govt IDs
          </div>
          <div
            style={{ ...styles.stepBadge, backgroundColor: step === 3 ? 'var(--primary)' : 'rgba(255,255,255,0.05)', cursor: 'pointer' }}
            onClick={() => setStep(3)}
          >
            3. Degrees
          </div>
          <div
            style={{ ...styles.stepBadge, backgroundColor: step === 4 ? 'var(--primary)' : 'rgba(255,255,255,0.05)', cursor: 'pointer' }}
            onClick={() => setStep(4)}
          >
            4. Experience
          </div>
          <div
            style={{ ...styles.stepBadge, backgroundColor: step === 5 ? 'var(--primary)' : 'rgba(255,255,255,0.05)', cursor: 'pointer' }}
            onClick={() => setStep(5)}
          >
            5. Banking & Contract
          </div>
        </div>

        <form onSubmit={handleFinalSubmit} style={styles.formBody}>
          {/* STEP 1: PERSONAL & EMERGENCY CONTACT */}
          {step === 1 && (
            <div style={styles.stepContent}>
              <h4 style={styles.stepTitle}>Step 1: Personal Profile & Emergency Contact (Fields 1-11)</h4>
              
              {/* Photo Upload & Preview Block */}
              <div style={styles.photoUploadBlock}>
                <div style={styles.avatarPreview}>
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt="Profile Preview" style={styles.avatarImg} />
                  ) : (
                    <User size={36} style={{ color: 'var(--primary)' }} />
                  )}
                </div>
                <div style={styles.uploadControls}>
                  <label style={styles.uploadLabel}>
                    <Camera size={14} style={{ marginRight: 4 }} /> Upload Profile Photograph
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload('photo_url', e)} style={{ display: 'none' }} />
                  </label>
                  <span style={styles.uploadSub}>Passport size photo (JPG/PNG). Aligned at top of profile.</span>
                </div>
              </div>

              <div style={styles.gridTwo}>
                <Input label="1. Full Name" value={formData.full_name || ''} onChange={(e) => updateField('full_name', e.target.value)} />
                <Input type="date" label="3. Date of Birth" value={formData.dob || ''} onChange={(e) => updateField('dob', e.target.value)} />
              </div>

              <div style={styles.gridTwo}>
                <Select
                  label="4. Gender"
                  value={formData.gender || 'Male'}
                  onChange={(e) => updateField('gender', e.target.value)}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' }
                  ]}
                />
                <Input label="5. Primary Mobile Number" value={formData.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
              </div>

              <Input type="email" label="6. Email Address" value={formData.email || ''} onChange={(e) => updateField('email', e.target.value)} />

              <div style={styles.gridTwo}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>7. Current Address</label>
                  <textarea rows={2} value={formData.current_address || ''} onChange={(e) => updateField('current_address', e.target.value)} style={styles.textArea} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>8. Permanent Address</label>
                  <textarea rows={2} value={formData.permanent_address || ''} onChange={(e) => updateField('permanent_address', e.target.value)} style={styles.textArea} />
                </div>
              </div>

              <h5 style={styles.subSectionTitle}>Emergency Contact Details</h5>
              <div style={styles.gridThree}>
                <Input label="9. Emergency Contact Name" value={formData.emergency_name || ''} onChange={(e) => updateField('emergency_name', e.target.value)} />
                <Input label="10. Emergency Contact Number" value={formData.emergency_phone || ''} onChange={(e) => updateField('emergency_phone', e.target.value)} />
                <Input label="11. Relationship" value={formData.emergency_relation || ''} onChange={(e) => updateField('emergency_relation', e.target.value)} />
              </div>
            </div>
          )}

          {/* STEP 2: GOVERNMENT IDS & PROOFS */}
          {step === 2 && (
            <div style={styles.stepContent}>
              <h4 style={styles.stepTitle}>Step 2: Government Identity & Legal Proofs (Fields 12-17)</h4>
              
              <div style={styles.gridTwo}>
                <Input label="12. PAN Card Number" value={formData.pan_number || ''} onChange={(e) => updateField('pan_number', e.target.value)} placeholder="e.g. ABCDE1234F" />
                <div style={styles.fileField}>
                  <label style={styles.label}>13. Upload PAN Card Copy</label>
                  <input type="file" onChange={(e) => handleFileUpload('pan_card_url', e)} style={styles.fileInput} />
                  {formData.pan_card_url && <span style={styles.fileSuccess}>✓ File Attached</span>}
                </div>
              </div>

              <div style={styles.gridTwo}>
                <Input label="14. Government ID Number (Aadhaar Card)" value={formData.govt_id_number || ''} onChange={(e) => updateField('govt_id_number', e.target.value)} placeholder="e.g. 1234 5678 9012" />
                <div style={styles.fileField}>
                  <label style={styles.label}>15. Upload Aadhaar Front & Back</label>
                  <input type="file" onChange={(e) => handleFileUpload('govt_id_url', e)} style={styles.fileInput} />
                  {formData.govt_id_url && <span style={styles.fileSuccess}>✓ File Attached</span>}
                </div>
              </div>

              <div style={styles.gridTwo}>
                <div style={styles.fileField}>
                  <label style={styles.label}>16. Upload Address Proof Copy</label>
                  <input type="file" onChange={(e) => handleFileUpload('address_proof_url', e)} style={styles.fileInput} />
                  {formData.address_proof_url && <span style={styles.fileSuccess}>✓ File Attached</span>}
                </div>
                <div style={styles.fileField}>
                  <label style={styles.label}>17. Upload Signature Image</label>
                  <input type="file" onChange={(e) => handleFileUpload('signature_url', e)} style={styles.fileInput} />
                  {formData.signature_url && <span style={styles.fileSuccess}>✓ File Attached</span>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ACADEMIC QUALIFICATIONS & COUNCIL */}
          {step === 3 && (
            <div style={styles.stepContent}>
              <h4 style={styles.stepTitle}>Step 3: Qualifications & State Council Registration (Fields 18-31)</h4>

              <div style={styles.gridTwo}>
                <Input label="18. BPT Degree Qualification" value={formData.bpt_degree || 'Bachelor of Physiotherapy (BPT)'} onChange={(e) => updateField('bpt_degree', e.target.value)} />
                <div style={styles.fileField}>
                  <label style={styles.label}>19. Upload BPT Degree Certificate</label>
                  <input type="file" onChange={(e) => handleFileUpload('bpt_cert_url', e)} style={styles.fileInput} />
                  {formData.bpt_cert_url && <span style={styles.fileSuccess}>✓ Certificate Attached</span>}
                </div>
              </div>

              <div style={styles.gridTwo}>
                <Input label="20. College / University Name" value={formData.college_name || ''} onChange={(e) => updateField('college_name', e.target.value)} />
                <Input type="number" label="21. Year of Passing" value={formData.passing_year || ''} onChange={(e) => updateField('passing_year', e.target.value)} />
              </div>

              <h5 style={styles.subSectionTitle}>State Council Registration</h5>
              <div style={styles.gridTwo}>
                <Input label="22. Professional Registration No." value={formData.reg_number || ''} onChange={(e) => updateField('reg_number', e.target.value)} />
                <Input label="23. State Council / Authority" value={formData.reg_council || ''} onChange={(e) => updateField('reg_council', e.target.value)} placeholder="e.g. Telangana State Council for PT" />
              </div>

              <div style={styles.gridThree}>
                <Input type="date" label="24. Registration Date" value={formData.reg_date || ''} onChange={(e) => updateField('reg_date', e.target.value)} />
                <Input type="date" label="25. Renewal / Validity Date" value={formData.reg_renewal_date || ''} onChange={(e) => updateField('reg_renewal_date', e.target.value)} />
                <div style={styles.fileField}>
                  <label style={styles.label}>26. Upload Council Certificate</label>
                  <input type="file" onChange={(e) => handleFileUpload('reg_cert_url', e)} style={styles.fileInput} />
                  {formData.reg_cert_url && <span style={styles.fileSuccess}>✓ File Attached</span>}
                </div>
              </div>

              <h5 style={styles.subSectionTitle}>Higher Qualifications & Specialization</h5>
              <div style={styles.gridTwo}>
                <Input label="27. MPT Qualification (If Applicable)" value={formData.mpt_degree || ''} onChange={(e) => updateField('mpt_degree', e.target.value)} placeholder="e.g. Master of Physiotherapy (MPT Ortho)" />
                <div style={styles.fileField}>
                  <label style={styles.label}>28. Upload MPT Certificate</label>
                  <input type="file" onChange={(e) => handleFileUpload('mpt_cert_url', e)} style={styles.fileInput} />
                  {formData.mpt_cert_url && <span style={styles.fileSuccess}>✓ File Attached</span>}
                </div>
              </div>

              <div style={styles.gridTwo}>
                <Input label="29. Clinical Specialization" value={formData.specialization || ''} onChange={(e) => updateField('specialization', e.target.value)} placeholder="e.g. Neuro Rehab, Orthopedic VR Physio" />
                <Input label="30. Additional Qualifications" value={formData.additional_qualifications || ''} onChange={(e) => updateField('additional_qualifications', e.target.value)} />
              </div>
            </div>
          )}

          {/* STEP 4: EXPERIENCE & CLINICAL SKILLS */}
          {step === 4 && (
            <div style={styles.stepContent}>
              <h4 style={styles.stepTitle}>Step 4: Professional Experience & Certifications (Fields 32-39)</h4>

              <div style={styles.gridTwo}>
                <Input type="number" step="0.5" label="32. Total Experience (Years)" value={formData.total_experience || ''} onChange={(e) => updateField('total_experience', e.target.value)} />
                <Input label="33. Previous Organization / Clinic" value={formData.prev_org || ''} onChange={(e) => updateField('prev_org', e.target.value)} />
              </div>

              <div style={styles.gridTwo}>
                <Input label="34. Previous Designation" value={formData.prev_designation || ''} onChange={(e) => updateField('prev_designation', e.target.value)} />
                <Input label="35. Employment Period / Tenure" value={formData.prev_employment_period || ''} onChange={(e) => updateField('prev_employment_period', e.target.value)} placeholder="e.g. 2021 - 2024" />
              </div>

              <div style={styles.fileField}>
                <label style={styles.label}>36. Upload Experience / Relieving Certificate</label>
                <input type="file" onChange={(e) => handleFileUpload('exp_cert_url', e)} style={styles.fileInput} />
                {formData.exp_cert_url && <span style={styles.fileSuccess}>✓ File Attached</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>37. Clinical Skills & Areas of Expertise</label>
                <textarea rows={2} value={formData.clinical_skills || ''} onChange={(e) => updateField('clinical_skills', e.target.value)} placeholder="e.g. Dry Needling, VR Gait Analysis, Post-op Knee Rehab" style={styles.textArea} />
              </div>

              <div style={styles.gridTwo}>
                <Select
                  label="38. Additional Training / Certifications Flag"
                  value={formData.has_extra_cert ? 'yes' : 'no'}
                  onChange={(e) => updateField('has_extra_cert', e.target.value === 'yes')}
                  options={[
                    { value: 'no', label: 'No Extra Certifications' },
                    { value: 'yes', label: 'Yes - I Have Extra Certifications' }
                  ]}
                />
                {formData.has_extra_cert && (
                  <div style={styles.fileField}>
                    <label style={styles.label}>39. Upload Training Certificates</label>
                    <input type="file" onChange={(e) => handleFileUpload('extra_cert_url', e)} style={styles.fileInput} />
                    {formData.extra_cert_url && <span style={styles.fileSuccess}>✓ File Attached</span>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: EMPLOYMENT & FINANCIALS */}
          {step === 5 && (
            <div style={styles.stepContent}>
              <h4 style={styles.stepTitle}>Step 5: Roster Contract, Banking & References (Fields 41-58)</h4>

              <div style={styles.gridThree}>
                <Input type="date" label="41. Joining Date" value={formData.joining_date || ''} onChange={(e) => updateField('joining_date', e.target.value)} />
                <Input label="42. Designation" value={formData.designation || 'Physiotherapist'} onChange={(e) => updateField('designation', e.target.value)} />
                <Select
                  label="43. Employment Type"
                  value={formData.employment_type || 'Full-Time'}
                  onChange={(e) => updateField('employment_type', e.target.value)}
                  options={[
                    { value: 'Full-Time', label: 'Full-Time Specialist' },
                    { value: 'Part-Time', label: 'Part-Time Specialist' },
                    { value: 'Consultant', label: 'Visiting Consultant' }
                  ]}
                />
              </div>

              <div style={styles.gridThree}>
                <Input label="44. Work Location / Branch" value={formData.work_location || 'Shaikpet Clinic'} onChange={(e) => updateField('work_location', e.target.value)} />
                <Input label="45. Working Days" value={formData.working_days || 'Monday to Saturday'} onChange={(e) => updateField('working_days', e.target.value)} />
                <Input label="46. Working Shift Hours" value={formData.working_hours || '09:00 AM - 05:00 PM'} onChange={(e) => updateField('working_hours', e.target.value)} />
              </div>

              {/* Remuneration & Banking Section */}
              <div style={styles.vaultBox}>
                <h5 style={styles.vaultTitle}><CreditCard size={14} /> 47-56. Remuneration & Bank Account Details</h5>
                
                <div style={styles.gridTwo}>
                  <Input label="47. Directors Remuneration Mode" value={formData.remuneration_type || ''} onChange={(e) => updateField('remuneration_type', e.target.value)} placeholder="Fixed Salary / Session Share" />
                  <Input type="number" label="48. Salary / Session Rate (₹)" value={formData.salary_amount || ''} onChange={(e) => updateField('salary_amount', e.target.value)} />
                </div>

                <div style={styles.gridTwo}>
                  <Input label="49. Bank Account Holder Name" value={formData.bank_holder_name || ''} onChange={(e) => updateField('bank_holder_name', e.target.value)} />
                  <Input label="50. Bank Name" value={formData.bank_name || ''} onChange={(e) => updateField('bank_name', e.target.value)} />
                </div>

                <div style={styles.gridThree}>
                  <Input label="51. Branch Name" value={formData.bank_branch || ''} onChange={(e) => updateField('bank_branch', e.target.value)} />
                  <Input label="52. Account Number" value={formData.bank_account_number || ''} onChange={(e) => updateField('bank_account_number', e.target.value)} />
                  <Input label="53. IFSC Code" value={formData.bank_ifsc || ''} onChange={(e) => updateField('bank_ifsc', e.target.value)} />
                </div>

                <div style={styles.gridTwo}>
                  <Select
                    label="54. Account Type"
                    value={formData.account_type || 'Savings'}
                    onChange={(e) => updateField('account_type', e.target.value)}
                    options={[
                      { value: 'Savings', label: 'Savings Account' },
                      { value: 'Current', label: 'Current Account' }
                    ]}
                  />
                  <Input label="56. UPI ID (Optional)" value={formData.upi_id || ''} onChange={(e) => updateField('upi_id', e.target.value)} placeholder="physio@upi" />
                </div>

                <div style={styles.fileField}>
                  <label style={styles.label}>55. Upload Cancelled Cheque / Bank Passbook Proof</label>
                  <input type="file" onChange={(e) => handleFileUpload('cancelled_cheque_url', e)} style={styles.fileInput} />
                  {formData.cancelled_cheque_url && <span style={styles.fileSuccess}>✓ Bank Proof Attached</span>}
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>57. Professional References</label>
                <textarea rows={2} value={formData.references || ''} onChange={(e) => updateField('references', e.target.value)} style={styles.textArea} />
              </div>
            </div>
          )}

          {/* Navigation & Partial Save Controls Bar */}
          <div style={styles.wizardFooter}>
            <div style={styles.footerLeft}>
              {step > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
                  <ChevronLeft size={16} /> Step {step - 1}
                </Button>
              )}
              <Button type="button" variant="secondary" size="sm" onClick={handleSaveDraft} loading={mutating}>
                <Save size={14} style={{ marginRight: 4 }} /> Save Progress / Draft
              </Button>
            </div>

            {step < 5 ? (
              <Button type="button" variant="primary" size="md" onClick={() => setStep(step + 1)}>
                Next Step ({step + 1}/5) <ChevronRight size={16} />
              </Button>
            ) : (
              <Button type="button" variant="accent" size="md" onClick={handleFinalSubmit} loading={mutating}>
                <Check size={16} style={{ marginRight: 6 }} /> Finish & Close Wizard
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  stepHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '4px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: 'var(--space-xs)'
  },
  stepBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    textAlign: 'center',
    flex: 1
  },
  formBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)'
  },
  stepTitle: {
    margin: '0 0 var(--space-xs) 0',
    fontSize: 'var(--text-sm)',
    fontWeight: '700',
    color: 'var(--primary)'
  },
  subSectionTitle: {
    margin: 'var(--space-xs) 0 4px 0',
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase'
  },
  photoUploadBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-sm)'
  },
  avatarPreview: {
    width: '64px',
    height: '64px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'rgba(202, 159, 66, 0.1)',
    border: '2px solid var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  uploadControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  uploadLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    backgroundColor: 'var(--primary)',
    color: '#000',
    fontWeight: '700',
    fontSize: '12px',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer'
  },
  uploadSub: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-sm)'
  },
  gridThree: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 'var(--space-sm)'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  textArea: {
    width: '100%',
    padding: '6px 10px',
    fontSize: '12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)'
  },
  fileField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  fileInput: {
    fontSize: '11px',
    color: 'var(--text-secondary)'
  },
  fileSuccess: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--success)'
  },
  vaultBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px dashed var(--warning)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    marginTop: 'var(--space-xs)'
  },
  vaultTitle: {
    margin: 0,
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    color: 'var(--warning)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  wizardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-color)',
    paddingTop: 'var(--space-sm)',
    marginTop: 'var(--space-sm)'
  },
  footerLeft: {
    display: 'flex',
    gap: 'var(--space-xs)',
    alignItems: 'center'
  }
};

export default PhysioProfileWizardModal;
