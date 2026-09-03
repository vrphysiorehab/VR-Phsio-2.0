import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import SearchBar from '../../../components/ui/SearchBar';
import { formatDate } from '../../../utils/dateHelpers';
import { Activity, Calendar, User, RefreshCw, AlertCircle } from 'lucide-react';

export const AssignmentsTab = ({ assignments = [], sessions = [], onEndTreatment, onReactivateTreatment, mutating }) => {
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [query, setQuery] = useState('');

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'active' && !a.is_active) return false;
    if (filter === 'completed' && a.is_active) return false;

    if (query.trim()) {
      const q = query.toLowerCase();
      const patientName = `${a.patients?.first_name || ''} ${a.patients?.surname || ''}`.toLowerCase();
      const code = (a.patients?.patient_code || '').toLowerCase();
      const diagnosis = (a.diagnosis || '').toLowerCase();
      const physioName = (a.physiotherapists?.name || '').toLowerCase();
      return (
        patientName.includes(q) ||
        code.includes(q) ||
        diagnosis.includes(q) ||
        physioName.includes(q)
      );
    }

    return true;
  });

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <div style={styles.filterBtns}>
          <button
            style={filter === 'all' ? styles.activeFilter : styles.filterBtn}
            onClick={() => setFilter('all')}
          >
            All Plans ({assignments.length})
          </button>
          <button
            style={filter === 'active' ? styles.activeFilter : styles.filterBtn}
            onClick={() => setFilter('active')}
          >
            Active Treatment
          </button>
          <button
            style={filter === 'completed' ? styles.activeFilter : styles.filterBtn}
            onClick={() => setFilter('completed')}
          >
            Closed / Ended
          </button>
        </div>

        <SearchBar value={query} onChange={setQuery} placeholder="Search patient, code, diagnosis..." />
      </div>

      <div style={styles.grid}>
        {filteredAssignments.length === 0 ? (
          <div style={styles.emptyState}>No therapy plans found matching search criteria.</div>
        ) : (
          filteredAssignments.map((a) => {
            const patientName = `${a.patients?.first_name || 'Patient'} ${a.patients?.surname || ''}`;
            const planSessions = sessions.filter((s) => s.assignment_id === a.id);
            const sessionCount = planSessions.length;

            return (
              <Card
                key={a.id}
                title={patientName}
                subtitle={`Plan Code: ${a.patients?.patient_code}`}
                className="glass-panel"
                extra={
                  <Badge variant={a.is_active ? 'success' : 'secondary'}>
                    {a.is_active ? 'Active' : 'Closed'}
                  </Badge>
                }
              >
                <div style={styles.cardContent}>
                  <div style={styles.meta}>
                    <p style={styles.text}><strong>Primary Physiotherapist:</strong> {a.physiotherapists?.name || 'Unassigned'}</p>
                    <p style={styles.text}><strong>Diagnosis:</strong> {a.diagnosis || 'General Physical Therapy'}</p>
                    <p style={styles.text}><strong>Session Rate:</strong> ₹{Number(a.cost_per_session).toFixed(2)}</p>
                    <p style={styles.text}>
                      <strong>Plan Started:</strong> {a.started_at ? formatDate(a.started_at) : 'N/A'}
                    </p>
                    {!a.is_active && (
                      <p style={styles.text}>
                        <strong>Plan Ended:</strong> {a.ended_at ? formatDate(a.ended_at) : 'N/A'}
                      </p>
                    )}

                    {/* Session Progress Indicator */}
                    <div style={styles.progressBlock}>
                      <div style={styles.progressHeader}>
                        <span style={styles.progressLabel}>Sessions Conducted:</span>
                        <span style={styles.progressVal}>{sessionCount} session(s)</span>
                      </div>
                      <div style={styles.progressTrack}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${Math.min(100, (sessionCount / 12) * 100)}%`,
                            backgroundColor: a.is_active ? 'var(--accent)' : 'var(--text-muted)'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={styles.actions}>
                    {a.is_active ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onEndTreatment(a.id)}
                        loading={mutating}
                      >
                        End Treatment Plan
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onReactivateTreatment(a.id)}
                        loading={mutating}
                      >
                        Re-Activate Case
                      </Button>
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
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--space-md)',
    flexWrap: 'wrap',
    marginBottom: 'var(--space-md)'
  },
  filterBtns: {
    display: 'flex',
    gap: 'var(--space-sm)'
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  activeFilter: {
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--primary-light)',
    border: '1px solid var(--primary)',
    color: 'var(--primary)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-glow)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
    justifyContent: 'space-between',
    height: '100%',
    gap: 'var(--space-md)'
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  text: {
    margin: 0,
    fontSize: 'var(--text-xs)',
    color: 'var(--text-secondary)'
  },
  progressBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 8px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px'
  },
  progressLabel: {
    color: 'var(--text-secondary)',
    fontWeight: '600'
  },
  progressVal: {
    color: 'var(--text-primary)',
    fontWeight: '700'
  },
  progressTrack: {
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 'var(--radius-full)'
  },
  actions: {
    display: 'flex',
    gap: 'var(--space-sm)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: 'var(--space-sm)',
    marginTop: 'var(--space-xs)'
  }
};

export default AssignmentsTab;
