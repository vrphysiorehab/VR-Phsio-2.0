import React from 'react';
import ClinicHeader from './ClinicHeader';
import { formatDate } from '../../utils/dateHelpers';

export const RegistrationFormTemplate = ({ patient }) => {
  if (!patient) return null;

  const {
    patient_code,
    title,
    first_name,
    middle_name,
    surname,
    dob,
    age,
    gender,
    mobile,
    email,
    address,
    occupation,
    going_to_gym,
    want_newsfeed,
    referral_source,
    referral_details,
    intake_data = {},
    present_complaints,
    history_of_illness,
    medical_history = {},
    personal_family_history,
    investigations = {},
    emergency_contact = {},
    registration_date
  } = patient;

  const fullName = [title, first_name, middle_name, surname].filter(Boolean).join(' ');

  const gymVal = going_to_gym || intake_data.going_to_gym || '';
  const refSourceVal = referral_source || intake_data.referral_source || '';
  const refDetailsVal = referral_details || intake_data.referral_details || '';
  const refFullStr = refSourceVal ? `${refSourceVal}${refDetailsVal ? ` (${refDetailsVal})` : ''}` : (refDetailsVal || '');

  const dobStr = dob || '';
  const ageStr = age ? `${age} yrs` : '';
  const dobAgeVal = dobStr && ageStr ? `${dobStr} (${ageStr})` : (dobStr || ageStr || '');

  const emName = emergency_contact.name || '';
  const emRel = emergency_contact.relation || '';
  const emPhone = emergency_contact.phone || '';
  const emStr = emName ? `${emName}${emRel ? ` (${emRel})` : ''}${emPhone ? ` - ${emPhone}` : ''}` : (emPhone || '');

  const regDateVal = registration_date || intake_data.registration_date || '';
  const formattedRegistrationDate = regDateVal ? formatDate(regDateVal) : '';

  return (
    <div style={styles.container}>
      {/* PAGE 1: Case Intake */}
      <div style={styles.page}>
        <ClinicHeader />
        
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>PATIENT REGISTRATION & CLINICAL INTAKE</span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#4b5563' }}>Reg Date: <strong>{formattedRegistrationDate}</strong></span>
            <span style={styles.patientCodeBadge}>{patient_code}</span>
          </div>
        </div>

        <div style={styles.grid2}>
          <div>
            <h4 style={styles.blockTitle}>Personal Details</h4>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td style={styles.tdLabel}>Full Name:</td>
                  <td style={styles.tdVal}>{fullName || '\u00A0'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>DOB / Age:</td>
                  <td style={styles.tdVal}>{dobAgeVal || '\u00A0'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Gender:</td>
                  <td style={styles.tdVal}>{gender || '\u00A0'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Occupation:</td>
                  <td style={styles.tdVal}>{occupation || '\u00A0'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Going to Gym:</td>
                  <td style={styles.tdVal}>{gymVal || '\u00A0'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h4 style={styles.blockTitle}>Contact & Referral</h4>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td style={styles.tdLabel}>Mobile:</td>
                  <td style={styles.tdVal}>{mobile || '\u00A0'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Email:</td>
                  <td style={styles.tdVal}>{email || '\u00A0'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Address:</td>
                  <td style={styles.tdVal}>{address || '\u00A0'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Emergency:</td>
                  <td style={styles.tdVal}>{emStr || '\u00A0'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Referral:</td>
                  <td style={styles.tdVal}>{refFullStr || '\u00A0'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.fullWidthSection}>
          <h4 style={styles.blockTitle}>Clinical Assessment Summary</h4>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.tdLabelWide}>Presenting Complaints:</td>
                <td style={styles.tdVal}>{present_complaints || '\u00A0'}</td>
              </tr>
              <tr>
                <td style={styles.tdLabelWide}>History of Illness:</td>
                <td style={styles.tdVal}>{history_of_illness || '\u00A0'}</td>
              </tr>
              <tr>
                <td style={styles.tdLabelWide}>Family / Personal History:</td>
                <td style={styles.tdVal}>{personal_family_history || '\u00A0'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={styles.grid2}>
          <div>
            <h4 style={styles.blockTitle}>Medical History Checklist</h4>
            <div style={styles.checklist}>
              {Object.entries(medical_history).map(([key, val]) => (
                <div key={key} style={styles.checkItem}>
                  <span style={val ? styles.checkedBox : styles.uncheckedBox}>
                    {val ? '✓' : '✗'}
                  </span>
                  <span style={styles.checkLabel}>
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 style={styles.blockTitle}>Diagnostic Investigations</h4>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td style={styles.tdLabel}>X-Ray:</td>
                  <td style={styles.tdVal}>{investigations.xray || '\u00A0'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>MRI:</td>
                  <td style={styles.tdVal}>{investigations.mri || '\u00A0'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Blood Tests:</td>
                  <td style={styles.tdVal}>{investigations.blood_test || '\u00A0'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.footerText}>Page 1 of 2 • VR Physio Clinic Systems</div>
      </div>

      {/* PAGE 2: Clinic Policy & Consent */}
      <div style={{ ...styles.page, pageBreakBefore: 'always' }}>
        <ClinicHeader />
        
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>CLINIC POLICY & INFORMED CONSENT</span>
        </div>

        {/* Our Vision */}
        <div style={styles.policySection}>
          <h4 style={styles.policyHeading}>OUR VISION</h4>
          <p style={styles.visionText}>
            "To provide exceptional physiotherapy and healthcare services, where patient care and customer service is of the highest
            quality and integral to our practice. We strive to maintain our reputation as the leaders in \"hands-on\" physiotherapy
            and exercise rehabilitation, and enjoy working with patients in a friendly and relaxed environment, based on empathy and
            individual care."
          </p>
        </div>

        {/* Promises and Expectations Grid */}
        <div style={styles.grid2Col}>
          <div style={styles.gridCol}>
            <h4 style={styles.policyHeading}>WE PROMISE TO:</h4>
            <p style={styles.policyBullet}>✓ Always be on time as we understand your time is as precious as ours.</p>
            <p style={styles.policyBullet}>✓ Commit to excellence in physiotherapy. Our physiotherapists are consistently improving their clinical skills with regular attendance at professional development seminars.</p>
            <p style={styles.policyBullet}>✓ Be open in our communication. We promise to provide outstanding healthcare, give clear guidance and refer to a specialist if necessary.</p>
            <p style={styles.policyBullet}>✓ Respect your privacy. All patient information is kept securely and only released to third parties upon written permission from the patient.</p>
          </div>

          <div style={styles.gridCol}>
            <h4 style={styles.policyHeading}>WE EXPECT YOU TO:</h4>
            <p style={styles.policyBullet}>✓ Arrive on time. Delays may reduce treatment duration.</p>
            <p style={styles.policyBullet}>✓ Missed appointments without 24-hour notice may incur a full consultation fee.</p>
            <p style={styles.policyBullet}>✓ Repeated cancellations may result in discharge from care.</p>
            <p style={styles.policyBullet}>✓ Referrals are appreciated as a sign of satisfaction.</p>
            <p style={styles.policyBullet}>✓ Feedback helps us improve our services.</p>
          </div>
        </div>

        <p style={styles.policyClosingLine}>
          We want you to get the most from your care at VR Physio Rehab Pvt. Ltd.
        </p>

        {/* Informed Consent Block */}
        <div style={styles.policySection}>
          <h4 style={styles.policyHeading}>INFORMED CONSENT</h4>
          <p style={styles.policyText}>
            I consent to assessment and treatment by VR Physio Rehab Pvt. Ltd. in accordance with professional guidelines. This may
            include manual therapy, mobilisation, massage, acupuncture and electrotherapy.
            I understand the risks will be explained prior to treatment and I may decline any procedure at any time.
            All physiotherapists operate under individual professional insurance, and liability remains between patient and treating
            therapist.
          </p>
        </div>

        {/* Signature & Consent */}
        <div style={styles.signatureSection}>
          <p style={styles.signatureAck}>
            I have read and understand the above Clinic Policy. By signing, I agree to the above terms.
          </p>
          
          <div style={styles.signRow}>
            <span><strong>Name:</strong> {fullName}</span>
            <span><strong>Signed:</strong> <span style={styles.signLine}></span></span>
            <span><strong>Date:</strong> {formattedRegistrationDate || '____ / ____ / ________'}</span>
          </div>
          
          <p style={styles.submitNote}>
            Please submit this completed form to your physiotherapist (T&C apply).
          </p>
        </div>

        <div style={styles.footerText}>Page 2 of 2 • VR Physio Clinic Systems</div>
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
    height: '290mm',
    padding: '20mm',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    overflow: 'hidden'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: '8px 12px',
    marginBottom: '15px',
    borderRadius: '4px',
    borderLeft: '4px solid #ca9f42'
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#090d16',
    letterSpacing: '0.5px'
  },
  patientCodeBadge: {
    backgroundColor: '#ca9f42',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '10px',
    fontWeight: '700'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '15px'
  },
  fullWidthSection: {
    marginBottom: '15px'
  },
  blockTitle: {
    margin: '0 0 8px 0',
    fontSize: '11px',
    color: '#ca9f42',
    textTransform: 'uppercase',
    fontWeight: '700',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '4px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tdLabel: {
    width: '30%',
    padding: '4px 0',
    fontWeight: '600',
    color: '#4b5563',
    verticalAlign: 'top'
  },
  tdLabelWide: {
    width: '20%',
    padding: '4px 0',
    fontWeight: '600',
    color: '#4b5563',
    verticalAlign: 'top'
  },
  tdVal: {
    width: '70%',
    padding: '3px 4px',
    color: '#1f2937',
    verticalAlign: 'bottom',
    borderBottom: '1px solid #d1d5db'
  },
  checklist: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px'
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  checkedBox: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '14px',
    height: '14px',
    backgroundColor: '#ca9f42',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: 'bold',
    borderRadius: '2px'
  },
  uncheckedBox: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '14px',
    height: '14px',
    border: '1px solid #9ca3af',
    color: '#9ca3af',
    fontSize: '9px',
    borderRadius: '2px'
  },
  checkLabel: {
    fontSize: '9px',
    fontWeight: '500',
    color: '#374151'
  },
  policySection: {
    marginBottom: '10px'
  },
  policyHeading: {
    fontSize: '10.5px',
    fontWeight: '700',
    color: '#ca9f42',
    margin: '0 0 4px 0',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '3px'
  },
  visionText: {
    fontSize: '9.5px',
    color: '#374151',
    margin: 0,
    fontStyle: 'italic',
    lineHeight: '1.45',
    textAlign: 'justify'
  },
  grid2Col: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '10px'
  },
  gridCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  policyBullet: {
    fontSize: '9.5px',
    color: '#374151',
    margin: 0,
    lineHeight: '1.4'
  },
  policyClosingLine: {
    fontSize: '9.5px',
    color: '#1f2937',
    fontWeight: '700',
    textAlign: 'center',
    margin: '4px 0 10px 0'
  },
  policyText: {
    fontSize: '9.5px',
    color: '#374151',
    margin: 0,
    lineHeight: '1.45',
    textAlign: 'justify'
  },
  signatureSection: {
    marginTop: '10px',
    paddingTop: '8px',
    borderTop: '1px dashed #d1d5db'
  },
  signatureAck: {
    fontSize: '9.5px',
    color: '#374151',
    fontStyle: 'italic',
    margin: '0 0 14px 0'
  },
  signRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    fontSize: '10px',
    color: '#1f2937',
    marginTop: '5px',
    paddingBottom: '5px'
  },
  signLine: {
    borderBottom: '1px solid #6b7280',
    width: '180px',
    display: 'inline-block',
    marginLeft: '6px'
  },
  submitNote: {
    textAlign: 'center',
    fontSize: '8.5px',
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: '10px',
    fontWeight: '500'
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

export default RegistrationFormTemplate;
