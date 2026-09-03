import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

export const SessionForm = ({
  onSubmit,
  onUpdateSession,
  onDeleteSession,
  existingSessionsToEdit,
  onClearExistingEdit,
  existingSessions = [],
  costPerSession,
  defaultPhysioId,
  physios = [],
  mutating
}) => {
  const [jsonInput, setJsonInput] = useState(`{
  "diagnosis": "Post ACL Surgery Rehabilitation",
  "startDate": "2026-09-01",
  "endDate": "2026-09-30",
  "sessions": [
    {
      "date": "2026-09-01",
      "treatment": "Initial assessment, pain management, ROM exercises..."
    },
    {
      "date": "2026-09-02",
      "treatment": "Passive ROM, quadriceps activation..."
    }
  ]
}`);
  const [previewSessions, setPreviewSessions] = useState([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [editingExisting, setEditingExisting] = useState(false);

  const defaultCost =
    costPerSession !== undefined && costPerSession !== null
      ? String(costPerSession)
      : '50.00';

  const [defaultSessionCost, setDefaultSessionCost] = useState(defaultCost);
  const [selectedPhysioId, setSelectedPhysioId] = useState(
    defaultPhysioId || ''
  );

  useEffect(() => {
    if (defaultPhysioId) {
      setSelectedPhysioId(defaultPhysioId);
    } else if (physios.length > 0 && !selectedPhysioId) {
      setSelectedPhysioId(physios[0].id);
    }
  }, [defaultPhysioId, physios, selectedPhysioId]);

  useEffect(() => {
    if (costPerSession !== undefined && costPerSession !== null) {
      setDefaultSessionCost(String(costPerSession));
    }
  }, [costPerSession]);

  useEffect(() => {
    if (
      existingSessionsToEdit &&
      existingSessionsToEdit.length > 0
    ) {
      handleEditOldSessions(existingSessionsToEdit);

      if (onClearExistingEdit) {
        onClearExistingEdit();
      }
    }
  }, [existingSessionsToEdit]);

  const physioOptions = physios.map((p) => ({
    value: p.id,
    label: `${p.name}${p.designation ? ` (${p.designation})` : ''}`
  }));

  const getYYYYMMDD = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.slice(0, 10);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return dateStr.slice(0, 10);
    }
  };

  const formatDateReadable = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  /*
   * Convert:
   * 2026-09-01
   * into a value suitable for datetime-local.
   */
  const toDateTimeLocal = (dateString) => {
    if (!dateString) return '';

    // If JSON gives us just YYYY-MM-DD,
    // use 09:00 as the default session time.
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return `${dateString}T09:00`;
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '';
    }

    const local = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );

    return local.toISOString().slice(0, 16);
  };

  const handlePreview = (e) => {
    e.preventDefault();
    setError('');

    if (!jsonInput.trim()) {
      setError('Please paste the session JSON first.');
      return;
    }

    if (!selectedPhysioId) {
      setError('Please select a session physiotherapist.');
      return;
    }

    const costNum = Number(defaultSessionCost);

    if (isNaN(costNum) || costNum < 0) {
      setError('Session fee must be a valid non-negative number.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON object.');
      }

      if (!Array.isArray(parsed.sessions)) {
        throw new Error('JSON must contain a "sessions" array.');
      }

      if (parsed.sessions.length === 0) {
        throw new Error('No sessions found in the JSON.');
      }

      const dateCounts = {};

      const sessions = parsed.sessions.map((session, index) => {
        if (!session.date) {
          throw new Error(`Session ${index + 1} is missing a date.`);
        }

        if (!session.treatment || !String(session.treatment).trim()) {
          throw new Error(
            `Session ${index + 1} is missing a treatment description.`
          );
        }

        const dateLocal = toDateTimeLocal(session.date);
        const ymd = getYYYYMMDD(dateLocal);
        dateCounts[ymd] = (dateCounts[ymd] || 0) + 1;

        const existingMatch = existingSessions.find((es) => {
          if (!es.session_date) return false;
          return getYYYYMMDD(es.session_date) === ymd;
        });

        return {
          id: `${Date.now()}-${index}`,
          date: dateLocal,
          treatment: String(session.treatment).trim(),
          physioId: session.physioId || selectedPhysioId,
          cost:
            session.cost !== undefined && session.cost !== null
              ? String(session.cost)
              : String(costNum),
          existingMatch: existingMatch || null
        };
      });

      // Mark duplicate dates within the JSON itself
      sessions.forEach((s) => {
        const ymd = getYYYYMMDD(s.date);
        s.isDuplicateInJson = dateCounts[ymd] > 1;
      });

      setDiagnosis(parsed.diagnosis || '');
      setStartDate(parsed.startDate || '');
      setEndDate(parsed.endDate || '');
      setPreviewSessions(sessions);
      setEditingExisting(false);
      setShowPreview(true);
    } catch (err) {
      setError(
        err.message || 'Invalid JSON. Please check the pasted session data.'
      );
    }
  };

  const updateSession = (id, field, value) => {
    setPreviewSessions((current) =>
      current.map((session) =>
        session.id === id
          ? {
              ...session,
              [field]: value
            }
          : session
      )
    );
  };

  const deleteSession = async (id) => {
    if (editingExisting) {
      try {
        await onDeleteSession(id);
      } catch (err) {
        setError(
          err?.message || 'Failed to delete session.'
        );
        return;
      }
    }

    setPreviewSessions((current) =>
      current.filter((session) => session.id !== id)
    );
  };

  const handleEditOldSessions = (sessionsInput) => {
    setError('');

    const sessionList = Array.isArray(sessionsInput) ? sessionsInput : [sessionsInput];

    const convertedSessions = sessionList.map((session) => ({
      id: session.id,
      date: toDateTimeLocal(session.session_date),
      treatment: String(session.treatment || '').trim(),
      physioId:
        session.physio_id ||
        session.physiotherapist_id ||
        session.physiotherapists?.id ||
        selectedPhysioId,
      cost:
        session.cost !== undefined && session.cost !== null
          ? String(session.cost)
          : String(defaultSessionCost)
    }));

    setPreviewSessions(convertedSessions);
    setEditingExisting(true);
    setShowPreview(true);
  };

  const handleUpdateExistingSessions = async () => {
    setError('');

    if (previewSessions.length === 0) {
      setError('There are no sessions to save.');
      return;
    }

    for (const session of previewSessions) {
      if (!session.treatment.trim()) {
        setError('Every session must have a treatment description.');
        return;
      }

      if (!session.physioId) {
        setError('Every session must have a physiotherapist.');
        return;
      }

      const costNum = Number(session.cost);

      if (isNaN(costNum) || costNum < 0) {
        setError('Every session must have a valid non-negative fee.');
        return;
      }

      if (!session.date) {
        setError('Every session must have a valid date.');
        return;
      }
    }

    try {
      for (const session of previewSessions) {
        const parsedDate = new Date(session.date);

        if (isNaN(parsedDate.getTime())) {
          setError(`Invalid date for session: ${session.date}`);
          return;
        }

        await onUpdateSession(session.id, {
          treatment: session.treatment.trim(),
          session_date: parsedDate.toISOString(),
          physio_id: session.physioId,
          cost: Number(session.cost)
        });
      }

      setPreviewSessions([]);
      setShowPreview(false);
      setEditingExisting(false);

    } catch (err) {
      setError(
        err?.message ||
          'Something went wrong while updating the sessions.'
      );
    }
  };

  const handleLogAllSessions = async (preferUpdateExisting = false) => {
    setError('');

    if (previewSessions.length === 0) {
      setError('There are no sessions to log.');
      return;
    }

    for (const session of previewSessions) {
      if (!session.treatment.trim()) {
        setError('Every session must have a treatment description.');
        return;
      }

      if (!session.physioId) {
        setError('Every session must have a physiotherapist.');
        return;
      }

      const costNum = Number(session.cost);

      if (isNaN(costNum) || costNum < 0) {
        setError('Every session must have a valid non-negative fee.');
        return;
      }

      if (!session.date) {
        setError('Every session must have a valid date.');
        return;
      }
    }

    try {
      for (const session of previewSessions) {
        const parsedDate = new Date(session.date);

        if (isNaN(parsedDate.getTime())) {
          setError(`Invalid date for session: ${session.date}`);
          return;
        }

        if (preferUpdateExisting && session.existingMatch && onUpdateSession) {
          await onUpdateSession(session.existingMatch.id, {
            treatment: session.treatment.trim(),
            session_date: parsedDate.toISOString(),
            physio_id: session.physioId,
            cost: Number(session.cost)
          });
        } else {
          await onSubmit(
            session.treatment.trim(),
            parsedDate.toISOString(),
            session.physioId,
            Number(session.cost)
          );
        }
      }

      setPreviewSessions([]);
      setJsonInput('');
      setDiagnosis('');
      setStartDate('');
      setEndDate('');
      setShowPreview(false);
    } catch (err) {
      setError(
        err?.message ||
          'Something went wrong while logging the sessions.'
      );
    }
  };

  const hasConflicts = !editingExisting && previewSessions.some((s) => s.existingMatch);

  return (
    <>
      <form onSubmit={handlePreview} style={styles.form}>
        <h3 style={styles.title}>
          Log Treatment Sessions
        </h3>

        <div style={styles.infoBox}>
          <strong>How to use:</strong>
          <div style={styles.infoText}>
            Paste the JSON generated for the treatment plan below.
            You can review and edit every session before logging.
          </div>
        </div>

        <div style={styles.textareaWrapper}>
          <label style={styles.label}>
            Treatment Sessions JSON *
          </label>

          <textarea
            style={{
              ...styles.textarea,
              ...(error ? styles.textareaError : {})
            }}
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              if (error) setError('');
            }}
            placeholder=""
            rows={12}
            disabled={mutating}
          />

          {error && (
            <span style={styles.errorText}>
              {error}
            </span>
          )}
        </div>

        <div style={styles.row}>
          <Select
            label="Default Physiotherapist *"
            value={selectedPhysioId}
            onChange={(e) => setSelectedPhysioId(e.target.value)}
            options={physioOptions}
            placeholder="Choose attending therapist..."
            required
            disabled={mutating}
          />

          <Input
            label="Default Session Fee (₹) *"
            type="number"
            step="0.01"
            min="0"
            value={defaultSessionCost}
            onChange={(e) =>
              setDefaultSessionCost(e.target.value)
            }
            required
            disabled={mutating}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={mutating}
          style={styles.submitBtn}
        >
          Preview Sessions
        </Button>
      </form>

      {showPreview && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  {editingExisting ? 'Edit Treatment Sessions' : 'Review Treatment Sessions'}
                </h2>

                {diagnosis && (
                  <div style={styles.diagnosis}>
                    {diagnosis}
                  </div>
                )}

                {(startDate || endDate) && (
                  <div style={styles.dateRange}>
                    {startDate || '—'} → {endDate || '—'}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                style={styles.closeButton}
                disabled={mutating}
              >
                ×
              </button>
            </div>

            <div style={styles.summary}>
              <strong>{previewSessions.length}</strong>{' '}
              session{previewSessions.length !== 1 ? 's' : ''} ready
              {editingExisting ? ' to update' : ' to log'}
            </div>

            {hasConflicts && (
              <div style={styles.warningBox}>
                <AlertTriangle size={20} style={styles.warningIcon} />
                <div>
                  <div style={styles.warningTitle}>
                    Session Already Recorded for Date
                  </div>
                  <div style={styles.warningText}>
                    A physiotherapy session is already logged for this patient on one or more of the selected dates.
                    You can click <strong>"Update Existing & Log New"</strong> to overwrite/update the existing session,
                    or click <strong>"Log as Duplicate Sessions"</strong> if multiple separate sessions occurred on the same day.
                  </div>
                </div>
              </div>
            )}

            <div style={styles.sessionList}>
              {previewSessions.map((session, index) => (
                <div
                  key={session.id}
                  style={{
                    ...styles.sessionCard,
                    ...(session.existingMatch && !editingExisting ? styles.sessionCardWarning : {})
                  }}
                >
                  <div style={styles.sessionHeader}>
                    <span style={styles.sessionNumber}>
                      Session {index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        deleteSession(session.id)
                      }
                      style={styles.deleteButton}
                      disabled={mutating}
                    >
                      Delete
                    </button>
                  </div>

                  {session.existingMatch && !editingExisting && (
                    <div style={styles.cardConflictBanner}>
                      <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                      <span>
                        Session already logged on <strong>{formatDateReadable(session.date)}</strong>: <em>"{session.existingMatch.treatment.length > 55 ? session.existingMatch.treatment.slice(0, 55) + '...' : session.existingMatch.treatment}"</em>
                      </span>
                    </div>
                  )}

                  {session.isDuplicateInJson && (
                    <div style={styles.cardConflictBanner}>
                      <AlertTriangle size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
                      <span>Multiple sessions for <strong>{formatDateReadable(session.date)}</strong> are included in this JSON.</span>
                    </div>
                  )}

                  <div style={styles.sessionGrid}>
                    <Input
                      label="Date & Time"
                      type="datetime-local"
                      value={session.date}
                      onChange={(e) =>
                        updateSession(
                          session.id,
                          'date',
                          e.target.value
                        )
                      }
                      disabled={mutating}
                    />

                    <Select
                      label="Physiotherapist"
                      value={session.physioId}
                      onChange={(e) =>
                        updateSession(
                          session.id,
                          'physioId',
                          e.target.value
                        )
                      }
                      options={physioOptions}
                      placeholder="Choose therapist..."
                      disabled={mutating}
                    />
                  </div>

                  <div style={styles.sessionGrid}>
                    <div style={styles.textareaWrapper}>
                      <label style={styles.label}>
                        Treatment
                      </label>

                      <textarea
                        value={session.treatment}
                        onChange={(e) =>
                          updateSession(
                            session.id,
                            'treatment',
                            e.target.value
                          )
                        }
                        rows={3}
                        disabled={mutating}
                        style={styles.textarea}
                      />
                    </div>

                    <Input
                      label="Session Fee (₹)"
                      type="number"
                      step="0.01"
                      min="0"
                      value={session.cost}
                      onChange={(e) =>
                        updateSession(
                          session.id,
                          'cost',
                          e.target.value
                        )
                      }
                      disabled={mutating}
                    />
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div style={styles.modalError}>
                {error}
              </div>
            )}

            <div style={styles.modalFooter}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowPreview(false)}
                disabled={mutating}
              >
                Cancel
              </Button>

              {editingExisting ? (
                <Button
                  type="button"
                  variant="primary"
                  loading={mutating}
                  onClick={handleUpdateExistingSessions}
                >
                  Save Changes
                </Button>
              ) : hasConflicts ? (
                <div style={styles.footerBtnGroup}>
                  <Button
                    type="button"
                    variant="secondary"
                    loading={mutating}
                    onClick={() => handleLogAllSessions(false)}
                  >
                    Log as Duplicate Sessions
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    loading={mutating}
                    onClick={() => handleLogAllSessions(true)}
                  >
                    Update Existing & Log New
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  loading={mutating}
                  onClick={() => handleLogAllSessions(false)}
                >
                  Log All {previewSessions.length} Sessions
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    padding: 'var(--space-md)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)'
  },

  title: {
    fontSize: 'var(--text-sm)',
    fontWeight: '700',
    color: 'var(--primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0
  },

  infoBox: {
    padding: '0.75rem',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-sm)',
    color: 'var(--text-primary)'
  },

  infoText: {
    marginTop: '0.25rem',
    color: 'var(--text-secondary)',
    fontSize: 'var(--text-xs)'
  },

  textareaWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)'
  },

  label: {
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },

  textarea: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: 'var(--text-sm)',
    transition:
      'border-color var(--transition-fast), box-shadow var(--transition-fast)',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },

  textareaError: {
    borderColor: 'var(--danger)'
  },

  errorText: {
    color: 'var(--danger)',
    fontSize: 'var(--text-xs)'
  },

  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-md)'
  },

  submitBtn: {
    alignSelf: 'flex-end',
    marginTop: 'var(--space-xs)'
  },

  /*
   * MODAL
   */

  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },

  modal: {
    width: 'min(1100px, 100%)',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
    overflow: 'hidden'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.25rem',
    borderBottom: '1px solid var(--border-color)'
  },

  modalTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },

  diagnosis: {
    marginTop: '0.35rem',
    color: 'var(--primary)',
    fontWeight: '600',
    fontSize: 'var(--text-sm)'
  },

  dateRange: {
    marginTop: '0.2rem',
    color: 'var(--text-secondary)',
    fontSize: 'var(--text-xs)'
  },

  closeButton: {
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '1.8rem',
    lineHeight: 1,
    cursor: 'pointer',
    padding: '0 0.25rem'
  },

  summary: {
    padding: '0.75rem 1.25rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid var(--border-color)',
    fontSize: 'var(--text-sm)',
    color: 'var(--text-secondary)'
  },

  sessionList: {
    overflowY: 'auto',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },

  sessionCard: {
    padding: '1rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)'
  },

  sessionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem'
  },

  sessionNumber: {
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    color: 'var(--primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },

  deleteButton: {
    border: 'none',
    background: 'transparent',
    color: 'var(--danger)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem'
  },

  sessionGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 'var(--space-md)',
    marginBottom: 'var(--space-md)'
  },

  modalError: {
    margin: '0 1.25rem 1rem',
    padding: '0.75rem',
    color: 'var(--danger)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-sm)'
  },

  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--space-md)',
    padding: '1rem 1.25rem',
    borderTop: '1px solid var(--border-color)'
  },

  warningBox: {
    margin: '0.75rem 1.25rem 0',
    padding: '0.85rem 1rem',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem'
  },

  warningIcon: {
    color: '#f59e0b',
    flexShrink: 0,
    marginTop: '0.1rem'
  },

  warningTitle: {
    fontWeight: '700',
    fontSize: 'var(--text-sm)',
    color: '#f59e0b',
    marginBottom: '0.25rem'
  },

  warningText: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-primary)',
    lineHeight: '1.4'
  },

  sessionCardWarning: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.02)'
  },

  cardConflictBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    marginBottom: '0.75rem',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-xs)',
    color: 'var(--text-primary)'
  },

  footerBtnGroup: {
    display: 'flex',
    gap: 'var(--space-sm)'
  }
};

export default SessionForm;
