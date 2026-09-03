import React, { useState, useEffect } from 'react';
import SearchBar from '../../components/ui/SearchBar';
import SessionForm from './SessionForm';
import SessionHistoryList from './SessionHistoryList';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { usePatientSearch } from '../../hooks/usePatientSearch';
import { usePatientSessions } from '../../hooks/usePatientSessions';
import { useToast } from '../../hooks/useToast';
import { physiosService } from '../../services/physiosService';
import styles from './AttendancePage.module.css';

export const AttendancePage = () => {
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [existingSessionsToEdit, setExistingSessionsToEdit] = useState(null);
  
  // Search state
  const { query, setQuery, patients, loading: searchLoading, error: searchError } = usePatientSearch();
  
  // Selected Patient state
  const {
    patient,
    sessions,
    assignments,
    activeAssignment,
    selectedAssignmentId,
    setSelectedAssignmentId,
    loading: patientLoading,
    mutating,
    error: patientError,
    addSession,
    updateSession,
    deleteSession,
    createAssignment
  } = usePatientSessions(selectedPatientId);

  // Assignment form state (for inline assignment if none active or adding new)
  const [physios, setPhysios] = useState([]);
  const [selectedPhysioId, setSelectedPhysioId] = useState('');
  const [costPerSession, setCostPerSession] = useState('50.00');
  const [diagnosis, setDiagnosis] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [showNewPlanForm, setShowNewPlanForm] = useState(false);

  const toast = useToast();

  // Load physiotherapists list for assignments dropdown
  useEffect(() => {
    const loadPhysios = async () => {
      try {
        const { data, error } = await physiosService.getPhysios();
        if (error) throw error;
        setPhysios(data || []);
      } catch (err) {
        console.error('Error loading therapists roster:', err);
      }
    };
    loadPhysios();
  }, []);

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setShowNewPlanForm(false);
    setSelectedPhysioId('');
    setDiagnosis('');
  };

  const handleAddSessionSubmit = async (treatment, date, physioId, cost) => {
    const { data, error } = await addSession(treatment, date, physioId, cost);
    if (error) {
      toast.error(`Failed to log session: ${error.message || 'Check database connection.'}`);
    } else {
      toast.success('Physiotherapy session logged successfully!');
    }
  };

  const handleUpdateSession = async (sessionId, updates) => {
    const { data, error } = await updateSession(sessionId, updates);
    if (error) {
      toast.error(`Failed to update session: ${error.message || 'Error updating database.'}`);
      throw error;
    } else {
      toast.success('Session updated successfully!');
      return data;
    }
  };

  const handleDeleteSession = async (sessionId) => {
    const { error } = await deleteSession(sessionId);
    if (error) {
      toast.error(`Failed to delete session: ${error.message || 'Error deleting from database.'}`);
      throw error;
    } else {
      toast.success('Session deleted successfully!');
    }
  };

  const handleCreateAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPhysioId) {
      toast.warning('Please select a primary physiotherapist.');
      return;
    }

    if (Number(costPerSession) <= 0) {
      toast.warning('Default cost per session must be greater than zero.');
      return;
    }

    setAssigning(true);
    const { data, error } = await createAssignment(selectedPhysioId, costPerSession, diagnosis);
    setAssigning(false);

    if (error) {
      toast.error(`Failed to create assignment: ${error.message || 'Check database connectivity.'}`);
    } else {
      toast.success(`New treatment plan "${diagnosis || 'Rehab Plan'}" created successfully for ${patient?.first_name}!`);
      setShowNewPlanForm(false);
      setDiagnosis('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebarSection}>
        <Card title="Patient Lookup" subtitle="Search and select active patient" className="glass-panel">
          <SearchBar value={query} onChange={setQuery} placeholder="Search name, code, mobile..." />
          
          <div className={styles.patientList}>
            {searchLoading ? (
              <div className={styles.searchState}>Searching patients...</div>
            ) : patients.length === 0 ? (
              <div className={styles.searchState}>
                {query ? 'No patients match your search' : 'Type above to look up patients'}
              </div>
            ) : (
              patients.map((p) => (
                <div
                  key={p.id}
                  className={`${styles.patientItem} ${
                    selectedPatientId === p.id ? styles.selectedItem : ''
                  }`}
                  onClick={() => handleSelectPatient(p.id)}
                >
                  <div className={styles.patientDetails}>
                    <span className={styles.patientName}>
                      {p.first_name} {p.surname}
                    </span>
                    <span className={styles.patientCode}>{p.patient_code}</span>
                  </div>
                  <span className={styles.patientPhone}>{p.mobile}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className={styles.contentSection}>
        {patientLoading ? (
          <div className={styles.centeredState}>Loading patient records...</div>
        ) : !selectedPatientId ? (
          <div className={styles.selectPrompt}>
            <h3>No Patient Selected</h3>
            <p>Look up a patient using the left search sidebar and select them to log sessions or configure assignments.</p>
          </div>
        ) : (
          <div className={styles.recordsWrapper}>
            {/* Header section */}
            <div className={`${styles.patientHeader} glass-panel`}>
              <div className={styles.headerDetails}>
                <h1>
                  {patient?.first_name} {patient?.surname}
                </h1>
                <div className={styles.metaRow}>
                  <span className={styles.metaBadge}>{patient?.patient_code}</span>
                  <span>DOB: {patient?.dob}</span>
                  <span>Mobile: {patient?.mobile}</span>
                </div>
              </div>
            </div>

            {/* Treatment Plan Selector Header */}
            {assignments.length > 0 && !showNewPlanForm && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap', padding: '12px 16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    Treatment Plan ({assignments.length}):
                  </label>
                  <select
                    value={selectedAssignmentId || ''}
                    onChange={(e) => {
                      if (e.target.value === 'NEW') {
                        setShowNewPlanForm(true);
                      } else {
                        setSelectedAssignmentId(e.target.value);
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: '600',
                      flex: 1
                    }}
                  >
                    {assignments.map((assign, idx) => (
                      <option key={assign.id} value={assign.id}>
                        Plan #{assignments.length - idx}: {assign.diagnosis || 'Rehab Plan'} ({assign.is_active ? 'Active' : 'Closed'}) - ₹{Number(assign.cost_per_session).toFixed(2)}/session
                      </option>
                    ))}
                    <option value="NEW">+ Start New Treatment Plan for {patient?.first_name}</option>
                  </select>
                </div>

                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => setShowNewPlanForm(true)}
                >
                  + Start New Treatment Plan
                </Button>
              </div>
            )}

            {/* Active Therapy details or New Plan Creation */}
            {activeAssignment && !showNewPlanForm ? (
              <div className={styles.activeCaseRow}>
                <div className={styles.assignmentDetails}>
                  <Card title="Roster & Therapy Status" className="glass-panel">
                    <p style={defaultTextStyles.textLine}>
                      <strong>Primary Physiotherapist:</strong> {activeAssignment.physiotherapists?.name || activeAssignment.physiotherapist?.name || 'Therapist'}
                    </p>
                    <p style={defaultTextStyles.textLine}>
                      <strong>Diagnosis / Condition:</strong> {activeAssignment.diagnosis || 'Rehab Plan'}
                    </p>
                    <p style={defaultTextStyles.textLine}>
                      <strong>Base Cost Rate:</strong> ₹{Number(activeAssignment.cost_per_session).toFixed(2)} / session
                    </p>
                  </Card>
                </div>
                
                <div className={styles.formAndHistoryGrid}>
                  <SessionForm
                    onSubmit={handleAddSessionSubmit}
                    onUpdateSession={handleUpdateSession}
                    onDeleteSession={handleDeleteSession}
                    existingSessionsToEdit={existingSessionsToEdit}
                    onClearExistingEdit={() => setExistingSessionsToEdit(null)}
                    existingSessions={sessions}
                    costPerSession={activeAssignment.cost_per_session}
                    defaultPhysioId={activeAssignment.physio_id}
                    physios={physios}
                    mutating={mutating}
                  />
                  <SessionHistoryList
                    sessions={sessions}
                    onEditOldSessions={setExistingSessionsToEdit}
                  />
                </div>
              </div>
            ) : (
              /* Inline Therapist Assignment form when creating a new treatment plan */
              <div className={styles.assignWrapper}>
                <Card
                  title={assignments.length > 0 ? "Start New Treatment Plan" : "No Active Rehabilitation Plan"}
                  subtitle={
                    assignments.length > 0
                      ? `Create an additional rehabilitation plan for ${patient?.first_name} under registration code ${patient?.patient_code}.`
                      : "Assign a primary physiotherapist and set default cost per session to start logging attendance."
                  }
                  className="glass-panel"
                >
                  <form onSubmit={handleCreateAssignmentSubmit} className={styles.assignForm}>
                    <Select
                      label="Select Primary Physiotherapist"
                      value={selectedPhysioId}
                      onChange={(e) => setSelectedPhysioId(e.target.value)}
                      options={physios.map((p) => ({ value: p.id, label: `${p.name} (${p.designation})` }))}
                      placeholder="Choose primary therapist from roster..."
                      required
                    />

                    <Input
                      label="Default Cost per Session (₹)"
                      type="number"
                      step="0.01"
                      min="1"
                      value={costPerSession}
                      onChange={(e) => setCostPerSession(e.target.value)}
                      required
                    />

                    <div style={{ gridColumn: '1 / -1' }}>
                      <Input
                        label="Diagnosis / Medical Condition"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="e.g. Frozen Shoulder, Post-op ACL Reconstruction, Cervical Spondylosis"
                        required
                      />
                    </div>

                    <div className={styles.assignActions}>
                      {assignments.length > 0 && (
                        <Button type="button" variant="ghost" onClick={() => setShowNewPlanForm(false)}>
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" variant="primary" loading={assigning}>
                        Create & Activate Treatment Plan
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const defaultTextStyles = {
  textLine: {
    margin: '0 0 var(--space-xs) 0',
    fontSize: 'var(--text-sm)'
  }
};

export default AttendancePage;
