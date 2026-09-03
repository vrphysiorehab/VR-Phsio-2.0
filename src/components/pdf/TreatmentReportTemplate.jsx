import React from 'react';
import ClinicHeader from './ClinicHeader';
import { formatDate } from '../../utils/dateHelpers';

export const TreatmentReportTemplate = ({ patient, assignment, sessions = [] }) => {
  if (!patient || !assignment) return null;

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
    address
  } = patient;

  const fullName = [title, first_name, middle_name, surname].filter(Boolean).join(' ');
  const physioName = assignment.physiotherapists?.name || 'Dr. Venkat R Manda PT';
  const physioDesignation = assignment.physiotherapists?.designation || 'Director, VR Physio Rehab Pvt. Ltd.';

  const sortedSessions = [...sessions].sort((a, b) => {
    const timeA = new Date(a.session_date || 0).getTime();
    const timeB = new Date(b.session_date || 0).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
  });

  const costPerSession = sortedSessions.length > 0 
    ? Number(sortedSessions[0].cost || 0) 
    : Number(assignment.cost_per_session || 0);

  const totalCost = sortedSessions.reduce((acc, s) => acc + Number(s.cost || 0), 0);

  // Group sessions into chunks of 15 per page
  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const sessionChunks = chunkArray(sortedSessions, 15);
  const sessionPages = sessionChunks.length > 0 ? sessionChunks : [[]];

  // Build list of all pages (Page 1 = Summary, Pages 2+ = Sessions)
  const allPages = [
    { type: 'summary' },
    ...sessionPages.map((chunk, idx) => ({ type: 'sessions', chunk, idx }))
  ];

  const renderSignatureSection = () => (
    <div style={styles.signatureRow}>
      <div style={styles.signatureCol}>
        <div style={styles.signatureLine}></div>
        <span style={styles.signatureLabel}>Physiotherapist Signature</span>
      </div>
      <div style={styles.signatureCol}>
        <div style={styles.signatureLine}></div>
        <span style={styles.signatureLabel}>VR Physio Rehab Pvt. Ltd. Stamp</span>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {allPages.map((page, index) => {
        const isLastPage = index === allPages.length - 1;
        const pageStyle = {
          ...styles.page,
          pageBreakAfter: isLastPage ? 'avoid' : 'always',
          breakAfter: isLastPage ? 'avoid' : 'page'
        };

        if (page.type === 'summary') {
          return (
            <div key="summary-page" style={pageStyle}>
              <div>
                <ClinicHeader />
                
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionTitle}>PATIENT TREATMENT REPORT</span>
                  <span style={styles.patientCodeBadge}>{patient_code || 'N/A'}</span>
                </div>

                <table style={styles.detailTable}>
                  <tbody>
                    <tr>
                      <td style={styles.tdLabel}>Patient ID</td>
                      <td style={styles.tdVal}>{patient_code || '-'}</td>
                      <td style={styles.tdLabel}>Date</td>
                      <td style={styles.tdVal}>{formatDate(new Date())}</td>
                    </tr>
                    <tr>
                      <td style={styles.tdLabel}>Name</td>
                      <td style={styles.tdVal}>{fullName}</td>
                      <td style={styles.tdLabel}>Gender</td>
                      <td style={styles.tdVal}>{gender || '-'}</td>
                    </tr>
                    <tr>
                      <td style={styles.tdLabel}>DOB</td>
                      <td style={styles.tdVal}>{dob || '-'}</td>
                      <td style={styles.tdLabel}>Age</td>
                      <td style={styles.tdVal}>{age || '-'}</td>
                    </tr>
                    <tr>
                      <td style={styles.tdLabel}>Address</td>
                      <td colSpan="3" style={styles.tdVal}>{address || '-'}</td>
                    </tr>
                    <tr>
                      <td style={styles.tdLabel}>Mobile</td>
                      <td style={styles.tdVal}>{mobile || '-'}</td>
                      <td style={styles.tdLabel}>Email</td>
                      <td style={styles.tdVal}>{email || '-'}</td>
                    </tr>
                    <tr>
                      <td style={styles.tdLabel}>Insurance</td>
                      <td style={styles.tdVal}>{patient.intake_data?.insurance || 'No'}</td>
                      <td style={styles.tdLabel}>Diagnosed With</td>
                      <td style={styles.tdVal}>{assignment.diagnosis || '-'}</td>
                    </tr>
                    <tr>
                      <td style={styles.tdLabel}>Referral Type</td>
                      <td style={styles.tdVal}>{patient.intake_data?.referral_source || 'Self'}</td>
                      <td style={styles.tdLabel}>Doctor</td>
                      <td style={styles.tdVal}>{patient.intake_data?.referral_details || '-'}</td>
                    </tr>
                    <tr>
                      <td style={styles.tdLabel}>Medical History</td>
                      <td colSpan="3" style={styles.tdVal}>
                        {patient.present_complaints || patient.intake_data?.present_complaints || '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={styles.summarySectionHeader}>
                  <span style={styles.summarySectionTitle}>TREATMENT SUMMARY</span>
                </div>

                <table style={styles.summaryTable}>
                  <thead>
                    <tr>
                      <th style={styles.thSummary}>Total Sessions</th>
                      <th style={styles.thSummary}>Cost / Session</th>
                      <th style={styles.thSummary}>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={styles.tdSummary}>{sortedSessions.length}</td>
                      <td style={styles.tdSummary}>₹{costPerSession.toFixed(0)}</td>
                      <td style={styles.tdSummary}>₹{totalCost.toFixed(0)}</td>
                    </tr>
                  </tbody>
                </table>

                <table style={styles.treatedTable}>
                  <tbody>
                    <tr>
                      <td style={styles.tdTreatedLabel}>Treated By</td>
                      <td style={styles.tdTreatedVal}>{physioName}</td>
                    </tr>
                    <tr>
                      <td style={styles.tdTreatedLabel}>Designation</td>
                      <td style={styles.tdTreatedVal}>{physioDesignation || '-'}</td>
                    </tr>
                    <tr>
                      <td style={styles.tdTreatedLabel}>Contact</td>
                      <td style={styles.tdTreatedVal}>{assignment.physiotherapists?.mobile || '-'}</td>
                    </tr>
                  </tbody>
                </table>

                <div style={styles.noticeBox}>
                  <p style={styles.noticeText}>
                    This report is generated based on physiotherapy sessions conducted. It is for clinical reference only and cannot be used as a bill, GST document, or for insurance claims.
                  </p>
                </div>
              </div>

              {renderSignatureSection()}
            </div>
          );
        } else {
          // session details page
          return (
            <div key={`sessions-page-${page.idx}`} style={pageStyle}>
              <div>
                <ClinicHeader />
                
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionTitle}>SESSION DETAILS</span>
                  <span style={styles.patientCodeBadge}>{patient_code || 'N/A'}</span>
                </div>

                <table style={styles.sessionTable}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.thSessionCol, textAlign: 'center', width: '6%' }}>#</th>
                      <th style={{ ...styles.thSessionCol, textAlign: 'center', width: '15%' }}>Date</th>
                      <th style={{ ...styles.thSessionCol, textAlign: 'left', width: '45%' }}>Treatment</th>
                      <th style={{ ...styles.thSessionCol, textAlign: 'center', width: '14%' }}>Cost</th>
                      <th style={{ ...styles.thSessionCol, textAlign: 'left', width: '20%' }}>Physio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.chunk.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={styles.noSessionsTd}>
                          No treatment sessions logged.
                        </td>
                      </tr>
                    ) : (
                      page.chunk.map((sess, idx) => {
                        const rowNumber = page.idx * 15 + idx + 1;
                        const sessionCost = sess.cost !== null && sess.cost !== undefined ? `₹${Number(sess.cost).toFixed(0)}` : '₹';
                        return (
                          <tr key={sess.id || idx}>
                            <td style={styles.tdSessionCenter}>{rowNumber}</td>
                            <td style={styles.tdSessionCenter}>
                              {sess.session_date ? formatDate(sess.session_date) : '-'}
                            </td>
                            <td style={styles.tdSessionLeft}>{sess.treatment || '-'}</td>
                            <td style={styles.tdSessionCenter}>{sessionCost}</td>
                            <td style={styles.tdSessionLeft}>{sess.physiotherapists?.name || physioName}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {renderSignatureSection()}
            </div>
          );
        }
      })}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#ffffff',
    color: '#1f2937',
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    lineHeight: '1.4',
    margin: 0,
    padding: 0
  },
  page: {
    width: '210mm',
    height: '296.5mm', // slightly smaller than 297mm to prevent blank page overflow
    padding: '15mm 20mm',
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
    margin: '15px 0 20px 0',
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
  detailTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px'
  },
  tdLabel: {
    width: '18%',
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    fontWeight: '600',
    fontSize: '10px',
    color: '#4b5563',
    backgroundColor: '#f9fafb'
  },
  tdVal: {
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    fontSize: '10px',
    color: '#1f2937',
    backgroundColor: '#ffffff'
  },
  summarySectionHeader: {
    backgroundColor: '#f9fafb',
    padding: '6px 12px',
    borderLeft: '4px solid #ca9f42',
    borderRadius: '4px',
    margin: '25px 0 10px 0',
    textAlign: 'left'
  },
  summarySectionTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#090d16',
    letterSpacing: '0.5px'
  },
  summaryTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '15px'
  },
  thSummary: {
    width: '33.33%',
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    fontWeight: '600',
    fontSize: '10px',
    textAlign: 'center',
    color: '#4b5563',
    backgroundColor: '#f9fafb'
  },
  tdSummary: {
    padding: '8px 8px',
    border: '1px solid #e5e7eb',
    fontSize: '10px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    fontWeight: '700',
    color: '#1f2937'
  },
  treatedTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px'
  },
  tdTreatedLabel: {
    width: '25%',
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    fontWeight: '600',
    fontSize: '10px',
    color: '#4b5563',
    backgroundColor: '#f9fafb'
  },
  tdTreatedVal: {
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    fontSize: '10px',
    color: '#1f2937',
    backgroundColor: '#ffffff'
  },
  noticeBox: {
    backgroundColor: '#fefbeb',
    border: '1px dashed #fef3c7',
    borderRadius: '6px',
    padding: '10px 12px',
    marginTop: '20px'
  },
  noticeText: {
    fontSize: '9px',
    color: '#b45309',
    margin: 0,
    lineHeight: '1.4',
    textAlign: 'center'
  },
  sessionTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px'
  },
  thSessionCol: {
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    fontWeight: '600',
    fontSize: '10px',
    textAlign: 'left',
    color: '#4b5563',
    backgroundColor: '#f9fafb'
  },
  tdSessionCenter: {
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    fontSize: '10px',
    textAlign: 'center',
    color: '#1f2937',
    backgroundColor: '#ffffff'
  },
  tdSessionLeft: {
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    fontSize: '10px',
    textAlign: 'left',
    color: '#1f2937',
    backgroundColor: '#ffffff'
  },
  noSessionsTd: {
    padding: '20px',
    textAlign: 'center',
    color: '#9ca3af',
    border: '1px solid #e5e7eb',
    fontStyle: 'italic',
    backgroundColor: '#ffffff'
  },
  signatureRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '40px',
    paddingTop: '20px',
    width: '100%'
  },
  signatureCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '45%'
  },
  signatureLine: {
    width: '100%',
    borderTop: '1px solid #d1d5db',
    marginBottom: '8px'
  },
  signatureLabel: {
    fontSize: '10px',
    fontWeight: '500',
    color: '#4b5563'
  }
};

export default TreatmentReportTemplate;
