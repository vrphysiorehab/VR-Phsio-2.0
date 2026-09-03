import { useState, useEffect, useCallback } from 'react';
import { patientsService } from '../services/patientsService';
import { assignmentsService } from '../services/assignmentsService';

export const usePatientSearch = (initialQuery = '') => {
  const [query, setQuery] = useState(initialQuery);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeAssignments, setActiveAssignments] = useState({}); // patientId -> activeAssignment

  const performSearch = useCallback(async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const { data: patientList, error: patientError } = await patientsService.searchPatients(searchQuery);
      
      if (patientError) throw patientError;
      
      setPatients(patientList || []);

      // If we have patients, fetch active assignments for them to show status in search list
      if (patientList && patientList.length > 0) {
        const assignmentsMap = {};
        await Promise.all(
          patientList.map(async (p) => {
            const { data: assign, error: assignError } = await assignmentsService.getActiveAssignment(p.id);
            if (!assignError && assign) {
              assignmentsMap[p.id] = assign;
            }
          })
        );
        setActiveAssignments(assignmentsMap);
      } else {
        setActiveAssignments({});
      }
    } catch (err) {
      console.error('Search patients error:', err);
      setError(err.message || 'Failed to search patients');
    } finally {
      setLoading(false);
    }
  }, []);

  // Run search when query changes with a simple debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, performSearch]);

  const refresh = useCallback(() => {
    performSearch(query);
  }, [query, performSearch]);

  return {
    query,
    setQuery,
    patients,
    activeAssignments,
    loading,
    error,
    refresh
  };
};
