import React from 'react';
import { Calendar, Pencil } from 'lucide-react';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { formatDateTime } from '../../utils/dateHelpers';

export const SessionHistoryList = ({
  sessions = [],
  onEditOldSessions
}) => {
  if (sessions.length === 0) {
    return (
      <EmptyState
        title="No Sessions Logged"
        description="No physiotherapy sessions have been logged for this assignment yet. Log the first treatment above."
        icon={Calendar}
      />
    );
  }

  return (
    <div style={styles.container}>

      <div style={styles.titleRow}>
        <h3 style={styles.title}>
          Session Logs ({sessions.length})
        </h3>

        <Button
          type="button"
          variant="secondary"
          onClick={() => onEditOldSessions(sessions)}
        >
          <Pencil size={15} />
          Edit Old Sessions
        </Button>
      </div>

      <div style={styles.list}>
        {sessions.map((session) => (
          <Card
            key={session.id}
            title={formatDateTime(session.session_date)}
            extra={
              <div style={styles.cardExtra}>
                <span style={styles.costBadge}>
                  ₹{Number(session.cost).toFixed(2)}
                </span>
                <button
                  type="button"
                  style={styles.cardEditBtn}
                  title="Edit session"
                  onClick={() => onEditOldSessions([session])}
                >
                  <Pencil size={13} />
                </button>
              </div>
            }
            className="glass-panel"
            style={styles.card}
          >
            <p style={styles.treatmentText}>
              {session.treatment}
            </p>

            <div style={styles.footer}>
              <span style={styles.therapistText}>
                Therapist:{' '}
                {session.physiotherapists?.name ||
                  'Assigned Therapist'}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    maxHeight: '600px',
    overflowY: 'auto',
    paddingRight: '4px'
  },

  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--space-md)'
  },

  title: {
    fontSize: 'var(--text-sm)',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  },

  card: {
    position: 'relative'
  },

  cardExtra: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  cardEditBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  costBadge: {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600'
  },

  treatmentText: {
    margin: 0,
    fontSize: 'var(--text-sm)',
    color: 'var(--text-primary)',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap'
  },

  footer: {
    borderTop: '1px solid var(--border-color)',
    marginTop: 'var(--space-sm)',
    paddingTop: 'var(--space-sm)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  therapistText: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-secondary)',
    fontWeight: '500'
  }
};

export default SessionHistoryList;