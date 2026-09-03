import React from 'react';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { formatDateTime } from '../../../utils/dateHelpers';
import { CheckCircle, Clock } from 'lucide-react';

export const ClinicalNotesModal = ({ isOpen, onClose, physioName, notes = [], onMarkRead }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`📜 Clinical Notes History - ${physioName}`}>
      <div style={styles.container}>
        {notes.length === 0 ? (
          <div style={styles.emptyState}>No clinical instructions or notes recorded for {physioName}.</div>
        ) : (
          <div style={styles.notesList}>
            {notes.map((n) => {
              const isUrgent = n.priority === 'urgent';
              const isHigh = n.priority === 'high';

              return (
                <div
                  key={n.id}
                  style={{
                    ...styles.noteCard,
                    borderLeft: isUrgent
                      ? '4px solid var(--danger)'
                      : isHigh
                      ? '4px solid var(--warning)'
                      : '4px solid var(--primary)',
                    opacity: n.is_read ? 0.75 : 1
                  }}
                >
                  <div style={styles.cardHeader}>
                    <div style={styles.headerTitleGroup}>
                      <Badge variant={isUrgent ? 'danger' : isHigh ? 'warning' : 'primary'}>
                        {n.priority ? n.priority.toUpperCase() : 'NORMAL'}
                      </Badge>
                      <span style={styles.author}>From: {n.author || 'Admin Desk'}</span>
                    </div>

                    <div style={styles.headerRight}>
                      <span style={styles.date}><Clock size={11} /> {formatDateTime(n.created_at)}</span>
                      {!n.is_read && onMarkRead && (
                        <button style={styles.readBtn} onClick={() => onMarkRead(n.id)}>
                          <CheckCircle size={12} /> Mark Read
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={styles.noteText}>{n.note_text}</p>
                </div>
              );
            })}
          </div>
        )}

        <div style={styles.actions}>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
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
    maxHeight: '70vh',
    overflowY: 'auto'
  },
  emptyState: {
    padding: 'var(--space-xl)',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: 'var(--text-xs)',
    fontStyle: 'italic'
  },
  notesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)'
  },
  noteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px'
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  author: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  date: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
  },
  readBtn: {
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
  noteText: {
    margin: 0,
    fontSize: 'var(--text-xs)',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid var(--border-color)',
    paddingTop: 'var(--space-sm)'
  }
};

export default ClinicalNotesModal;
