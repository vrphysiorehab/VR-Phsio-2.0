import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import ClinicalNotesModal from '../components/ClinicalNotesModal';
import { notesService } from '../../../services/notesService';
import { formatDate, formatDateTime } from '../../../utils/dateHelpers';
import { Bell, Lock, CheckCircle, Clock, FileText, UserCheck, Activity } from 'lucide-react';

export const PhysioTab = ({ performance = [], assignments = [], sessions = [], isRevenueUnlocked, onOpenUnlockModal }) => {
  const [notesMap, setNotesMap] = useState({}); // { [physioId]: notesArray }
  const [selectedPhysioForNotes, setSelectedPhysioForNotes] = useState(null);

  const loadNotesData = async () => {
    const map = {};
    for (const p of performance) {
      const physioId = p.physio_id || p.id;
      const { data } = await notesService.getNotesForPhysio(physioId);
      map[physioId] = data || [];
    }
    setNotesMap(map);
  };

  useEffect(() => {
    loadNotesData();
  }, [performance]);

  const handleMarkRead = async (physioId, noteId) => {
    await notesService.markAsRead(noteId);
    loadNotesData();
  };

  return (
    <div style={styles.container}>
      {/* Previous Notes History Modal */}
      {selectedPhysioForNotes && (
        <ClinicalNotesModal
          isOpen={!!selectedPhysioForNotes}
          onClose={() => setSelectedPhysioForNotes(null)}
          physioName={selectedPhysioForNotes.name}
          notes={notesMap[selectedPhysioForNotes.physio_id] || []}
          onMarkRead={(noteId) => handleMarkRead(selectedPhysioForNotes.physio_id, noteId)}
        />
      )}

      <div style={styles.grid}>
        {performance.length === 0 ? (
          <div style={styles.emptyState}>No therapists performance data found in clinic archives.</div>
        ) : (
          performance.map((p) => {
            const physioId = p.physio_id || p.id;
            const physioNotes = notesMap[physioId] || [];
            const unreadNotes = physioNotes.filter((n) => !n.is_read);
            const latestNote = physioNotes.length > 0 ? physioNotes[0] : null;

            // Primary physician assignments
            const primaryAssignments = assignments.filter((a) => a.physio_id === physioId);
            const primaryPatientsCount = primaryAssignments.length || Number(p.total_patients || 0);

            // Active patients
            const activePrimaryPatients = primaryAssignments
              .filter((a) => a.is_active && a.patients)
              .map((a) => a.patients);

            // Sessions conducted
            const sessionsTook = sessions.filter((s) => s.physio_id === physioId);
            const sessionsTookCount = sessionsTook.length || Number(p.total_sessions || 0);
            
            const revenueAccrued = sessionsTook.length > 0
              ? sessionsTook.reduce((acc, s) => acc + Number(s.cost || 0), 0)
              : Number(p.total_revenue || 0);

            // Workload status
            let workloadBadge = 'Optimal Load';
            let workloadVariant = 'success';
            if (activePrimaryPatients.length >= 5) {
              workloadBadge = 'Heavy Roster Load';
              workloadVariant = 'warning';
            } else if (activePrimaryPatients.length === 0) {
              workloadBadge = 'Available for Cases';
              workloadVariant = 'secondary';
            }

            return (
              <Card
                key={physioId}
                title={p.name}
                subtitle={p.designation || 'Physical Therapy Specialist'}
                className="glass-panel"
                extra={<Badge variant={workloadVariant}>{workloadBadge}</Badge>}
              >
                <div style={styles.cardContent}>
                  {/* Clinical Notes Notification Card Section */}
                  <div style={styles.notesNotificationBlock}>
                    <div style={styles.notesHeader}>
                      <span style={styles.notesTitle}>
                        <Bell size={13} style={{ color: unreadNotes.length > 0 ? 'var(--warning)' : 'var(--text-secondary)' }} />
                        Clinical Notes & Notifications ({unreadNotes.length} New)
                      </span>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedPhysioForNotes({ physio_id: physioId, name: p.name })}
                      >
                        📜 History ({physioNotes.length})
                      </Button>
                    </div>

                    {latestNote ? (
                      <div
                        style={{
                          ...styles.latestNoteCard,
                          borderLeft: latestNote.priority === 'urgent'
                            ? '3px solid var(--danger)'
                            : latestNote.priority === 'high'
                            ? '3px solid var(--warning)'
                            : '3px solid var(--primary)',
                          opacity: latestNote.is_read ? 0.75 : 1
                        }}
                      >
                        <div style={styles.noteTop}>
                          <span style={styles.notePriority}>
                            {latestNote.priority ? latestNote.priority.toUpperCase() : 'NOTE'}
                          </span>
                          <span style={styles.noteDate}>
                            {formatDateTime(latestNote.created_at)}
                          </span>
                        </div>
                        <p style={styles.noteBody}>{latestNote.note_text}</p>
                        {!latestNote.is_read && (
                          <div style={styles.noteActionRow}>
                            <button
                              style={styles.markReadBtn}
                              onClick={() => handleMarkRead(physioId, latestNote.id)}
                            >
                              <CheckCircle size={11} /> Mark as Read
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={styles.noNotesText}>No active clinical instructions for this therapist.</p>
                    )}
                  </div>

                  {/* Metrics Row */}
                  <div style={styles.metricsRow}>
                    <div style={styles.metric}>
                      <span style={styles.metricVal}>{primaryPatientsCount}</span>
                      <span style={styles.metricLabel}>Primary Cases</span>
                    </div>
                    <div style={styles.metric}>
                      <span style={styles.metricVal}>{sessionsTookCount}</span>
                      <span style={styles.metricLabel}>Sessions Took</span>
                    </div>
                    <div style={styles.metric}>
                      {isRevenueUnlocked ? (
                        <span style={{ ...styles.metricVal, color: 'var(--primary)' }}>
                          ₹{revenueAccrued.toFixed(2)}
                        </span>
                      ) : (
                        <span style={styles.maskedMetric} onClick={onOpenUnlockModal}>
                          <Lock size={10} /> Masked
                        </span>
                      )}
                      <span style={styles.metricLabel}>Revenue Share</span>
                    </div>
                  </div>

                  {/* Active Primary Roster */}
                  <div style={styles.rosterSection}>
                    <span style={styles.rosterTitle}>Active Patient Roster ({activePrimaryPatients.length})</span>
                    {activePrimaryPatients.length === 0 ? (
                      <p style={styles.rosterEmpty}>No active primary patients assigned.</p>
                    ) : (
                      <div style={styles.rosterList}>
                        {activePrimaryPatients.map((pat) => (
                          <div key={pat.id} style={styles.rosterItem}>
                            <span style={styles.patName}>
                              {pat.first_name} {pat.surname || ''}
                            </span>
                            <span style={styles.patCode}>{pat.patient_code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Sessions Conducted Log */}
                  <div style={styles.rosterSection}>
                    <span style={styles.rosterTitle}>Sessions Conducted Log ({sessionsTook.length})</span>
                    {sessionsTook.length === 0 ? (
                      <p style={styles.rosterEmpty}>No therapy sessions conducted yet.</p>
                    ) : (
                      <div style={styles.rosterList}>
                        {sessionsTook.slice(0, 5).map((sess, idx) => {
                          const patName = sess.patients
                            ? `${sess.patients.first_name} ${sess.patients.surname || ''}`
                            : 'Patient';
                          return (
                            <div key={sess.id || idx} style={styles.sessionItem}>
                              <div style={styles.sessionMeta}>
                                <span style={styles.patName}>{patName}</span>
                                {isRevenueUnlocked && (
                                  <span style={styles.sessionCost}>₹{Number(sess.cost || 0).toFixed(2)}</span>
                                )}
                              </div>
                              <div style={styles.sessionMeta}>
                                <span style={styles.sessionTreatment}>{sess.treatment || 'Therapy Session'}</span>
                                <span style={styles.sessionDate}>
                                  {sess.session_date ? formatDate(sess.session_date) : ''}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 'var(--space-lg)'
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: 'var(--space-2xl) 0',
    color: 'var(--text-muted)',
    fontSize: 'var(--text-sm)'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  },
  notesNotificationBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-xs) var(--space-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  notesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  notesTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  noNotesText: {
    margin: 0,
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    padding: '4px 0'
  },
  latestNoteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  noteTop: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px'
  },
  notePriority: {
    fontWeight: '700',
    color: 'var(--primary)'
  },
  noteDate: {
    color: 'var(--text-muted)'
  },
  noteBody: {
    margin: 0,
    fontSize: '11px',
    color: 'var(--text-primary)',
    lineHeight: '1.4'
  },
  noteActionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '2px'
  },
  markReadBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontSize: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    padding: 0
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1.2fr',
    gap: 'var(--space-sm)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: 'var(--space-md)',
    textAlign: 'center'
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  metricVal: {
    fontSize: 'var(--text-lg)',
    fontWeight: '800',
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif"
  },
  maskedMetric: {
    fontSize: '11px',
    color: 'var(--warning)',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px'
  },
  metricLabel: {
    fontSize: '9px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    fontWeight: '500'
  },
  rosterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)'
  },
  rosterTitle: {
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  rosterEmpty: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)',
    margin: 0,
    fontStyle: 'italic'
  },
  rosterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
    maxHeight: '140px',
    overflowY: 'auto'
  },
  rosterItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)'
  },
  sessionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '6px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)'
  },
  sessionMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  patName: {
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  patCode: {
    fontSize: '10px',
    color: 'var(--primary)',
    fontWeight: '700'
  },
  sessionCost: {
    fontSize: '10px',
    color: 'var(--success)',
    fontWeight: '700'
  },
  sessionTreatment: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px'
  },
  sessionDate: {
    fontSize: '9px',
    color: 'var(--text-muted)'
  }
};

export default PhysioTab;
