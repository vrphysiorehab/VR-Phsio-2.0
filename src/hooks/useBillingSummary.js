import { useState, useEffect, useCallback } from 'react';
import { patientsService } from '../services/patientsService';
import { assignmentsService } from '../services/assignmentsService';
import { physiosService } from '../services/physiosService';

export const useBillingSummary = (patientId) => {
  const [patient, setPatient] = useState(null);
  const [billingRecords, setBillingRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState(null);

  const fetchBillingData = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [patientRes, billingRes, physioRes] = await Promise.all([
        patientsService.getPatientById(id),
        assignmentsService.getPatientBillingSummary(id),
        physiosService.getPhysios()
      ]);

      if (patientRes.error) throw patientRes.error;
      setPatient(patientRes.data);

      if (billingRes.error) throw billingRes.error;
      
      // Map physio details to billing records
      const physios = physioRes.data || [];
      const mappedBilling = (billingRes.data || []).map(record => {
        const physio = physios.find(p => p.id === record.physio_id);
        return {
          ...record,
          physiotherapist: physio || { name: 'Unknown Therapist' }
        };
      });

      setBillingRecords(mappedBilling);
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError(err.message || 'Failed to fetch billing data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBillingData(patientId);
  }, [patientId, fetchBillingData]);

  const markAsPaid = async (assignmentId, totalAmount = 0, currentPaid = 0, currentHistory = []) => {
    setMutating(true);
    try {
      const { data, error: err } = await assignmentsService.markAsPaid(assignmentId, totalAmount, currentPaid, currentHistory);
      if (err) throw err;
      
      // Refresh local data
      await fetchBillingData(patientId);
      return { data, error: null };
    } catch (err) {
      console.error('Error marking as paid:', err);
      return { data: null, error: err };
    } finally {
      setMutating(false);
    }
  };

  const recordPayment = async (assignmentId, amount, mode = 'Cash', notes = '', currentPaid = 0, totalCost = 0, currentHistory = []) => {
    setMutating(true);
    try {
      const { data, error: err } = await assignmentsService.recordPayment(assignmentId, amount, mode, notes, currentPaid, totalCost, currentHistory);
      if (err) throw err;
      
      await fetchBillingData(patientId);
      return { data, error: null };
    } catch (err) {
      console.error('Error recording payment:', err);
      return { data: null, error: err };
    } finally {
      setMutating(false);
    }
  };

  const refresh = () => fetchBillingData(patientId);

  return {
    patient,
    billingRecords,
    loading,
    mutating,
    error,
    markAsPaid,
    recordPayment,
    refresh
  };
};
