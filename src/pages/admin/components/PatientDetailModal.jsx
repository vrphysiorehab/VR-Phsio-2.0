import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { formatDate, formatDateTime } from '../../../utils/dateHelpers';
import { sessionsService } from '../../../services/sessionsService';
import { User, Activity, Calendar, CreditCard, FileText, Mail, MessageSquare, Phone } from 'lucide-react';

export const PatientDetailModal = ({ isOpen, onClose, patient, assignment, billing, onPrintReport, onOpenMail, onOpenWhatsApp }) => {
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    if (isOpen && assignment?.id) {
      setLoadingSessions(true);
      sessionsService.getSessionsByAssignmentId(assignment.id)
        .then(({ data, error }) => {
          if (!error && data) {
            setSessions(data);
          } else {
            setSessions([]);
          }
        })
        .finally(() => setLoadingSessions(false));
    }
  }, [isOpen, assignment?.id]);

  if (!patient) return null;

  const fullName = `${patient.first_name} ${patient.surname || ''}`;
  const totalSessions = billing?.total_sessions || sessions.length || 0;
  const totalCost = Number(billing?.total_cost || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`360° Patient EHR - ${fullName}`}>
      <div style={styles.container}>
        {/* Header Profile Summary */}
        <div style={styles.profileHeader}>
          <div style={styles.avatarBlock}>
            <User size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={styles.profileMeta}>
            <div style={styles.titleRow}>
              <h3 style={styles.name}>{fullName}</h3>
              <Badge variant={assignment?.is_active ? 'success' : 'secondary'}>
                {assignment?.is_active ? 'Active Treatment' : 'Closed Case'}
              </Badge>
            </div>
            <div style={styles.codeRow}>
              <span style={styles.codeBadge}>Code: {patient.patient_code}</span>
              <span style={styles.subText}>Reg Date: {formatDate(patient.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Clinical Info Cards Grid */}
        <div style={styles.infoGrid}>
          <div style={styles.infoBox}>
            <span style={styles.boxLabel}><Phone size={12} /> Contact Information</span>
            <p style={styles.boxVal}>Mobile: {patient.mobile}</p>
            <p style={styles.boxVal}>Email: {patient.email || 'Not Registered'}</p>
          </div>

          <div style={styles.infoBox}>
            <span style={styles.boxLabel}><Activity size={12} /> Active Case Assignment</span>
            <p style={styles.boxVal}>Diagnosis: {assignment?.diagnosis || 'General Physical Rehab'}</p>
            <p style={styles.boxVal}>Primary Physio: {assignment?.physiotherapists?.name || 'Unassigned'}</p>
            <p style={styles.boxVal}>Rate / Session: ₹{Number(assignment?.cost_per_session || 0).toFixed(2)}</p>
          </div>

          <div style={styles.infoBox}>
            <span style={styles.boxLabel}><CreditCard size={12} /> Financial Ledger Snapshot</span>
            <p style={styles.boxVal}>Total Sessions Logged: {totalSessions}</p>
            <p style={styles.boxVal}>Total Accrued Cost: ₹{totalCost.toFixed(2)}</p>
            <p style={{ ...styles.boxVal, color: billing?.is_paid ? 'var(--success)' : 'var(--warning)' }}>
              Status: {billing?.is_paid ? 'Fully Settled' : 'Payment Pending'}
            </p>
          </div>
        </div>

        {/* VR Sessions History Log */}
        <div style={styles.sessionsSection}>
          <div style={styles.sectionHeader}>
            <Calendar size={16} style={{ color: 'var(--primary)' }} />
            <h4 style={styles.sectionTitle}>Recorded Therapy Sessions Timeline ({sessions.length})</h4>
          </div>

          {loadingSessions ? (
            <div style={styles.loadingText}>Fetching treatment log history...</div>
          ) : sessions.length === 0 ? (
            <div style={styles.emptyText}>No therapy sessions logged under this treatment plan yet.</div>
          ) : (
            <div style={styles.sessionsList}>
              {sessions.map((s, idx) => (
                <div key={s.id || idx} style={styles.sessionCard}>
                  <div style={styles.sessionHeaderRow}>
                    <span style={styles.sessionTreatment}>{s.treatment || 'VR Physiotherapy Session'}</span>
                    <span style={styles.sessionCost}>₹{Number(s.cost || 0).toFixed(2)}</span>
                  </div>
                  <div style={styles.sessionFooterRow}>
                    <span style={styles.sessionPhysio}>Specialist: {s.physiotherapists?.name || 'Assigned Physio'}</span>
                    <span style={styles.sessionDate}>{formatDateTime(s.session_date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div style={styles.actionsBar}>
          {patient.registration_pdf_url && (
            <Button size="sm" variant="secondary" onClick={() => window.open(patient.registration_pdf_url, '_blank')}>
              <FileText size={14} style={{ marginRight: 4 }} /> Intake PDF
            </Button>
          )}

          {assignment && (
            <Button size="sm" variant="outline" onClick={() => onPrintReport(patient, assignment)}>
              <FileText size={14} style={{ marginRight: 4 }} /> Case Report PDF
            </Button>
          )}

          {onOpenMail && (
            <Button size="sm" variant="ghost" onClick={() => onOpenMail(patient)}>
              <Mail size={14} style={{ marginRight: 4 }} /> Send Email
            </Button>
          )}

          {onOpenWhatsApp && (
            <Button size="sm" variant="accent" onClick={() => onOpenWhatsApp(patient, assignment, billing)}>
              <MessageSquare size={14} style={{ marginRight: 4 }} /> Send WhatsApp
            </Button>
          )}
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
    maxHeight: '75vh',
    overflowY: 'auto'
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
    paddingBottom: 'var(--space-sm)',
    borderBottom: '1px solid var(--border-color)'
  },
  avatarBlock: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'rgba(202, 159, 66, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--primary)'
  },
  profileMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
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
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  codeRow: {
    display: 'flex',
    gap: 'var(--space-sm)',
    alignItems: 'center'
  },
  codeBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--primary)'
  },
  subText: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 'var(--space-sm)'
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  boxLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '2px'
  },
  boxVal: {
    margin: 0,
    fontSize: 'var(--text-xs)',
    color: 'var(--text-primary)'
  },
  sessionsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)'
  },
  sectionTitle: {
    margin: 0,
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase'
  },
  loadingText: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)',
    padding: 'var(--space-sm)',
    textAlign: 'center'
  },
  emptyText: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    padding: 'var(--space-sm)'
  },
  sessionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '200px',
    overflowY: 'auto'
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  sessionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sessionTreatment: {
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  sessionCost: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--success)'
  },
  sessionFooterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sessionPhysio: {
    fontSize: '10px',
    color: 'var(--text-secondary)'
  },
  sessionDate: {
    fontSize: '10px',
    color: 'var(--text-muted)'
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--space-xs)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: 'var(--space-sm)',
    flexWrap: 'wrap'
  }
};

export default PatientDetailModal;
