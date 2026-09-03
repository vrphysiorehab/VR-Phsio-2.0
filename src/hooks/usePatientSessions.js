import { useState, useEffect, useCallback } from 'react';
import { patientsService } from '../services/patientsService';
import { sessionsService } from '../services/sessionsService';
import { assignmentsService } from '../services/assignmentsService';

export const usePatientSessions = (patientId) => {
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState(null);

  const fetchPatientData = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [patientRes, allAssignmentsRes, activeAssignRes, sessionsRes] = await Promise.all([
        patientsService.getPatientById(id),
        assignmentsService.getAssignmentsByPatientId(id),
        assignmentsService.getActiveAssignment(id),
        sessionsService.getSessionsByPatientId(id)
      ]);

      if (patientRes.error) throw patientRes.error;
      setPatient(patientRes.data);

      const assignList = allAssignmentsRes.data || [];
      setAssignments(assignList);

      // If active assignment exists, default to it; else default to most recent
      const defaultAssign = activeAssignRes.data || (assignList.length > 0 ? assignList[0] : null);
      if (defaultAssign) {
        setSelectedAssignmentId((prev) => {
          if (prev && assignList.some((a) => a.id === prev)) return prev;
          return defaultAssign.id;
        });
      }
      
      if (sessionsRes.error) throw sessionsRes.error;
      const rawSessions = sessionsRes.data || [];
      const sortedSessions = [...rawSessions].sort((a, b) => {
        const timeA = new Date(a.session_date || 0).getTime();
        const timeB = new Date(b.session_date || 0).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      });
      setSessions(sortedSessions);
    } catch (err) {
      console.error('Error fetching patient session data:', err);
      setError(err.message || 'Failed to fetch patient data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatientData(patientId);
  }, [patientId, fetchPatientData]);

  // Derived active assignment based on selectedAssignmentId or default active
  const activeAssignment = assignments.find((a) => a.id === selectedAssignmentId) ||
    assignments.find((a) => a.is_active) ||
    (assignments.length > 0 ? assignments[0] : null);

  // Filter sessions for the currently active/selected assignment
  const assignmentSessions = activeAssignment
    ? sessions.filter((s) => s.assignment_id === activeAssignment.id)
    : sessions;

  const addSession = async (treatment, sessionDate = null, physioId = null, cost = null) => {
    if (!patientId || !activeAssignment) {
      throw new Error('No active assignment or patient selected');
    }
    
    setMutating(true);
    try {
      const sessionData = {
        patient_id: patientId,
        physio_id: physioId || activeAssignment.physio_id,
        assignment_id: activeAssignment.id,
        treatment,
        cost: cost !== null && cost !== undefined ? Number(cost) : activeAssignment.cost_per_session,
        session_date: sessionDate || new Date().toISOString()
      };

      const { data, error: sessionErr } = await sessionsService.createSession(sessionData);
      if (sessionErr) throw sessionErr;

      if (data) {
        setSessions((prev) => {
          const exists = prev.some((s) => s.id === data.id);
          const updated = exists ? prev.map((s) => (s.id === data.id ? data : s)) : [...prev, data];
          return updated.sort((a, b) => {
            const timeA = new Date(a.session_date || 0).getTime();
            const timeB = new Date(b.session_date || 0).getTime();
            if (timeA !== timeB) return timeA - timeB;
            return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          });
        });
      }

      await fetchPatientData(patientId);
      return { data, error: null };
    } catch (err) {
      console.error('Error adding session:', err);
      return { data: null, error: err };
    } finally {
      setMutating(false);
    }
  };

  const createAssignment = async (physioId, costPerSession, diagnosis) => {
    if (!patientId) throw new Error('No patient selected');
    
    setMutating(true);
    try {
      const assignmentData = {
        patient_id: patientId,
        physio_id: physioId,
        cost_per_session: Number(costPerSession),
        diagnosis
      };

      const { data, error: assignErr } = await assignmentsService.createAssignment(assignmentData);
      if (assignErr) throw assignErr;

      if (data) {
        setSelectedAssignmentId(data.id);
      }
      await fetchPatientData(patientId);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating assignment:', err);
      return { data: null, error: err };
    } finally {
      setMutating(false);
    }
  };

  const endTreatment = async () => {
    if (!activeAssignment) throw new Error('No active assignment to end');
    
    setMutating(true);
    try {
      const { data, error: assignErr } = await assignmentsService.endTreatment(activeAssignment.id);
      if (assignErr) throw assignErr;

      await fetchPatientData(patientId);
      return { data, error: null };
    } catch (err) {
      console.error('Error ending treatment:', err);
      return { data: null, error: err };
    } finally {
      setMutating(false);
    }
  };

  const reactivateTreatment = async (assignmentId) => {
    setMutating(true);
    try {
      const { data, error: assignErr } = await assignmentsService.reactivateTreatment(assignmentId);
      if (assignErr) throw assignErr;

      setSelectedAssignmentId(assignmentId);
      await fetchPatientData(patientId);
      return { data, error: null };
    } catch (err) {
      console.error('Error reactivating treatment:', err);
      return { data: null, error: err };
    } finally {
      setMutating(false);
    }
  };

  const updateSession = async (sessionId, updates) => {
    setMutating(true);
    try {
      const { data, error: updateErr } = await sessionsService.updateSession(sessionId, updates);
      if (updateErr) throw updateErr;

      if (data) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? data : s))
        );
      }
      await fetchPatientData(patientId);
      return { data, error: null };
    } catch (err) {
      console.error('Error updating session:', err);
      return { data: null, error: err };
    } finally {
      setMutating(false);
    }
  };

  const deleteSession = async (sessionId) => {
    setMutating(true);
    try {
      const { data, error: deleteErr } = await sessionsService.deleteSession(sessionId);
      if (deleteErr) throw deleteErr;

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      await fetchPatientData(patientId);
      return { data, error: null };
    } catch (err) {
      console.error('Error deleting session:', err);
      return { data: null, error: err };
    } finally {
      setMutating(false);
    }
  };

  const refresh = () => fetchPatientData(patientId);

  return {
    patient,
    sessions: assignmentSessions, // Filtered for selected treatment plan
    allSessions: sessions, // Unfiltered all sessions
    assignments,
    activeAssignment,
    selectedAssignmentId,
    setSelectedAssignmentId,
    loading,
    mutating,
    error,
    addSession,
    updateSession,
    deleteSession,
    createAssignment,
    endTreatment,
    reactivateTreatment,
    refresh
  };
};
