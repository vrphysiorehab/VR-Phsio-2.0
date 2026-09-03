import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { formatDate } from '../../../utils/dateHelpers';
import { User, Shield, Award, Briefcase, CreditCard, Lock, CheckCircle, FileText, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

export const PhysioProfileDrawer = ({ isOpen, onClose, physio, profileData, isRevenueUnlocked, onOpenUnlockModal, onVerifyProfile, isAdminView }) => {
  const [activeSection, setActiveSection] = useState('personal');
  const [previewDoc, setPreviewDoc] = useState(null); // { title, url }

  if (!isOpen || !physio) return null;

  const p = profileData || {};
  const photoUrl = p.photo_url || physio.photo_url;
  const fullName = p.full_name || physio.name;
  const isVerified = p.admin_verification_status === 'verified';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`🩺 360° Profile & Compliance Vault - ${fullName}`}>
      <div style={styles.container}>
        {/* Aligned Top Profile Header */}
        <div style={styles.profileHeader}>
          <div style={styles.avatarBlock}>
            {photoUrl ? (
              <img src={photoUrl} alt={fullName} style={styles.avatarImg} />
            ) : (
              <User size={40} style={{ color: 'var(--primary)' }} />
            )}
          </div>

          <div style={styles.headerInfo}>
            <div style={styles.titleRow}>
              <h3 style={styles.name}>{fullName}</h3>
              <div style={styles.badgeRow}>
                <Badge variant={isVerified ? 'success' : 'warning'}>
                  {isVerified ? '✅ Head Verified' : '🟡 Audit Pending'}
                </Badge>
              </div>
            </div>

            <p style={styles.designation}>{p.designation || physio.designation || 'Physiotherapist'}</p>
            
            <div style={styles.quickContact}>
              <span><Phone size={12} /> {p.phone || physio.phone || 'No Phone'}</span>
              {p.email && <span><Mail size={12} /> {p.email}</span>}
              <span><MapPin size={12} /> {p.work_location || 'Main Clinic'}</span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div style={styles.navTabs}>
          <button style={activeSection === 'personal' ? styles.activeTab : styles.tab} onClick={() => setActiveSection('personal')}>
            Personal
          </button>
          <button style={activeSection === 'qualifications' ? styles.activeTab : styles.tab} onClick={() => setActiveSection('qualifications')}>
            Qualifications
          </button>
          <button style={activeSection === 'experience' ? styles.activeTab : styles.tab} onClick={() => setActiveSection('experience')}>
            Experience
          </button>
          <button style={activeSection === 'contract' ? styles.activeTab : styles.tab} onClick={() => setActiveSection('contract')}>
            Employment
          </button>
          <button style={activeSection === 'vault' ? styles.activeTab : styles.tab} onClick={() => setActiveSection('vault')}>
            🔒 Vault & Bank
          </button>
          <button style={activeSection === 'documents' ? styles.activeTab : styles.tab} onClick={() => setActiveSection('documents')}>
            📂 Documents ({Object.keys(p).filter(k => k.endsWith('_url') && p[k]).length})
          </button>
        </div>

        {/* SECTION 1: PERSONAL & EMERGENCY */}
        {activeSection === 'personal' && (
          <div style={styles.sectionBody}>
            <h4 style={styles.sectionHeading}>Personal Details & Emergency Contact</h4>
            <div style={styles.infoGrid}>
              <div style={styles.infoBox}>
                <span style={styles.label}>Date of Birth:</span>
                <span style={styles.val}>{p.dob ? formatDate(p.dob) : 'N/A'}</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Gender:</span>
                <span style={styles.val}>{p.gender || 'N/A'}</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Current Address:</span>
                <span style={styles.val}>{p.current_address || 'N/A'}</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Permanent Address:</span>
                <span style={styles.val}>{p.permanent_address || 'N/A'}</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Emergency Person:</span>
                <span style={styles.val}>{p.emergency_name || 'N/A'} ({p.emergency_relation || 'Relation'})</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Emergency Phone:</span>
                <span style={styles.val}>{p.emergency_phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: QUALIFICATIONS */}
        {activeSection === 'qualifications' && (
          <div style={styles.sectionBody}>
            <h4 style={styles.sectionHeading}>Academic Qualifications & State Council License</h4>
            <div style={styles.infoGrid}>
              <div style={styles.infoBox}>
                <span style={styles.label}>BPT Degree:</span>
                <span style={styles.val}>{p.bpt_degree || 'Bachelor of Physiotherapy'}</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>University / College:</span>
                <span style={styles.val}>{p.college_name || 'N/A'} (Passed: {p.passing_year || 'N/A'})</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>State Council Reg No:</span>
                <span style={{ ...styles.val, color: 'var(--primary)', fontWeight: '700' }}>{p.reg_number || 'N/A'}</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Council Authority:</span>
                <span style={styles.val}>{p.reg_council || 'N/A'}</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Registration Validity:</span>
                <span style={styles.val}>Valid Till: {p.reg_renewal_date ? formatDate(p.reg_renewal_date) : 'N/A'}</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Specialization:</span>
                <span style={styles.val}>{p.specialization || 'General Physical Rehab'}</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: EXPERIENCE */}
        {activeSection === 'experience' && (
          <div style={styles.sectionBody}>
            <h4 style={styles.sectionHeading}>Professional Experience & Clinical Expertise</h4>
            <div style={styles.infoGrid}>
              <div style={styles.infoBox}>
                <span style={styles.label}>Total Experience:</span>
                <span style={{ ...styles.val, fontSize: '14px', fontWeight: '800' }}>{p.total_experience || 0} Year(s)</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Previous Organization:</span>
                <span style={styles.val}>{p.prev_org || 'N/A'} ({p.prev_designation || 'Specialist'})</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Tenure Period:</span>
                <span style={styles.val}>{p.prev_employment_period || 'N/A'}</span>
              </div>
              <div style={styles.infoBox} style={{ gridColumn: '1 / -1' }}>
                <span style={styles.label}>Clinical Skills & Expertise:</span>
                <span style={{ ...styles.val, color: 'var(--accent)', fontWeight: '600' }}>{p.clinical_skills || 'General Physical Therapy'}</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: CONTRACT */}
        {activeSection === 'contract' && (
          <div style={styles.sectionBody}>
            <h4 style={styles.sectionHeading}>Employment & Shift Details</h4>
            <div style={styles.infoGrid}>
              <div style={styles.infoBox}>
                <span style={styles.label}>Joining Date:</span>
                <span style={styles.val}>{p.joining_date ? formatDate(p.joining_date) : 'N/A'}</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Employment Type:</span>
                <span style={styles.val}>{p.employment_type || 'Full-Time'}</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Working Days:</span>
                <span style={styles.val}>{p.working_days || 'Monday to Saturday'}</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Shift Timings:</span>
                <span style={styles.val}>{p.working_hours || '09:00 AM - 05:00 PM'}</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: VAULT & BANKING (RESTRICTED PIN) */}
        {activeSection === 'vault' && (
          <div style={styles.sectionBody}>
            <h4 style={styles.sectionHeading}>🔒 Government Proofs & Bank Vault</h4>
            {!isRevenueUnlocked ? (
              <div style={styles.maskedVaultBox} onClick={onOpenUnlockModal}>
                <Lock size={20} style={{ color: 'var(--warning)' }} />
                <span>Government IDs & Bank Account Details Restricted. Click to enter Head PIN (`1234`).</span>
              </div>
            ) : (
              <div style={styles.infoGrid}>
                <div style={styles.infoBox}>
                  <span style={styles.label}>PAN Card Number:</span>
                  <span style={{ ...styles.val, fontWeight: '700' }}>{p.pan_number || 'N/A'}</span>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.label}>Aadhaar Card Number:</span>
                  <span style={{ ...styles.val, fontWeight: '700' }}>{p.govt_id_number || 'N/A'}</span>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.label}>Remuneration Agreement:</span>
                  <span style={styles.val}>{p.remuneration_type || 'Fixed Salary'} (₹{p.salary_amount || '0'})</span>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.label}>Account Holder:</span>
                  <span style={styles.val}>{p.bank_holder_name || 'N/A'}</span>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.label}>Bank & Branch:</span>
                  <span style={styles.val}>{p.bank_name || 'N/A'} ({p.bank_branch || 'Branch'})</span>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.label}>Account Number & IFSC:</span>
                  <span style={{ ...styles.val, color: 'var(--success)', fontWeight: '700' }}>{p.bank_account_number || 'N/A'} ({p.bank_ifsc || 'IFSC'})</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 6: DOCUMENTS REPOSITORY */}
        {activeSection === 'documents' && (
          <div style={styles.sectionBody}>
            <h4 style={styles.sectionHeading}>📂 Uploaded Document Attachments Repository</h4>
            
            {!isRevenueUnlocked ? (
              <div style={styles.maskedVaultBox} onClick={onOpenUnlockModal}>
                <Lock size={18} style={{ color: 'var(--warning)' }} />
                <span>Document Files Repository Restricted - Click to Enter Head Security PIN</span>
              </div>
            ) : (
              <div style={styles.docGrid}>
                {p.photo_url && (
                  <div style={styles.docCard}>
                    <span>📷 Photograph</span>
                    <Button size="sm" variant="outline" onClick={() => setPreviewDoc({ title: 'Photograph', url: p.photo_url })}><ExternalLink size={12} /> Preview File</Button>
                  </div>
                )}
                {p.pan_card_url && (
                  <div style={styles.docCard}>
                    <span>🪪 PAN Card Copy</span>
                    <Button size="sm" variant="outline" onClick={() => setPreviewDoc({ title: 'PAN Card Copy', url: p.pan_card_url })}><ExternalLink size={12} /> Preview File</Button>
                  </div>
                )}
                {p.govt_id_url && (
                  <div style={styles.docCard}>
                    <span>🪪 Aadhaar / Govt ID</span>
                    <Button size="sm" variant="outline" onClick={() => setPreviewDoc({ title: 'Aadhaar / Govt ID', url: p.govt_id_url })}><ExternalLink size={12} /> Preview File</Button>
                  </div>
                )}
                {p.bpt_cert_url && (
                  <div style={styles.docCard}>
                    <span>📜 BPT Degree Certificate</span>
                    <Button size="sm" variant="outline" onClick={() => setPreviewDoc({ title: 'BPT Degree Certificate', url: p.bpt_cert_url })}><ExternalLink size={12} /> Preview File</Button>
                  </div>
                )}
                {p.reg_cert_url && (
                  <div style={styles.docCard}>
                    <span>📜 State Council Reg Cert</span>
                    <Button size="sm" variant="outline" onClick={() => setPreviewDoc({ title: 'State Council Registration Cert', url: p.reg_cert_url })}><ExternalLink size={12} /> Preview File</Button>
                  </div>
                )}
                {p.cancelled_cheque_url && (
                  <div style={styles.docCard}>
                    <span>🏦 Cancelled Cheque / Bank Proof</span>
                    <Button size="sm" variant="outline" onClick={() => setPreviewDoc({ title: 'Cancelled Cheque / Bank Proof', url: p.cancelled_cheque_url })}><ExternalLink size={12} /> Preview File</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Inline Document Preview Modal */}
        {previewDoc && (
          <Modal
            isOpen={!!previewDoc}
            onClose={() => setPreviewDoc(null)}
            title={`📄 Document Viewer - ${previewDoc.title}`}
            zIndex={10001}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '10px' }}>
              {previewDoc.url.startsWith('data:image') || previewDoc.url.startsWith('http') || previewDoc.url.endsWith('.png') || previewDoc.url.endsWith('.jpg') || previewDoc.url.endsWith('.jpeg') ? (
                <img src={previewDoc.url} alt={previewDoc.title} style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              ) : (
                <iframe src={previewDoc.url} title={previewDoc.title} style={{ width: '100%', height: '60vh', border: 'none', borderRadius: '8px' }} />
              )}
              <Button size="sm" variant="primary" onClick={() => {
                const a = document.createElement('a');
                a.href = previewDoc.url;
                a.download = `${previewDoc.title.toLowerCase().replace(/\s+/g, '-')}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}>
                Download Document File
              </Button>
            </div>
          </Modal>
        )}

        {/* Footer Actions */}
        <div style={styles.drawerFooter}>
          {onVerifyProfile && (
            <Button
              variant={isVerified ? 'secondary' : 'accent'}
              size="sm"
              onClick={() => onVerifyProfile(physio.id, isVerified ? 'pending' : 'verified')}
            >
              {isVerified ? 'Mark as Audit Pending' : '✅ Verify Profile & Mark Compliant'}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
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
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-md)'
  },
  avatarBlock: {
    width: '72px',
    height: '72px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'rgba(202, 159, 66, 0.1)',
    border: '2px solid var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  name: {
    margin: 0,
    fontSize: 'var(--text-lg)',
    fontWeight: '800',
    color: 'var(--text-primary)'
  },
  badgeRow: {
    display: 'flex',
    gap: '4px'
  },
  designation: {
    margin: 0,
    fontSize: 'var(--text-xs)',
    color: 'var(--text-secondary)',
    fontWeight: '600'
  },
  quickContact: {
    display: 'flex',
    gap: 'var(--space-md)',
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '4px',
    flexWrap: 'wrap'
  },
  navTabs: {
    display: 'flex',
    gap: '4px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '4px',
    overflowX: 'auto'
  },
  tab: {
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer'
  },
  activeTab: {
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--primary)',
    backgroundColor: 'var(--primary-light)',
    border: '1px solid var(--primary)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer'
  },
  sectionBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)'
  },
  sectionHeading: {
    margin: '0 0 var(--space-xs) 0',
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    color: 'var(--primary)',
    textTransform: 'uppercase'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--space-sm)'
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  label: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    fontWeight: '600'
  },
  val: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-primary)'
  },
  maskedVaultBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: 'var(--space-md)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    border: '1px dashed var(--warning)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--warning)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    cursor: 'pointer'
  },
  docGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 'var(--space-sm)'
  },
  docCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-xs)',
    color: 'var(--text-primary)'
  },
  drawerFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid var(--border-color)',
    paddingTop: 'var(--space-sm)'
  }
};

export default PhysioProfileDrawer;
