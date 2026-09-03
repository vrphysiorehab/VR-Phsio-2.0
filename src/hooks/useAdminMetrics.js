import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { sessionsService } from '../services/sessionsService';

export const useAdminMetrics = () => {
  const [data, setData] = useState({
    // Summary Cards
    totalPatients: 0,
    activeTreatments: 0,
    activeTherapists: 0,
    todaysSessionsCount: 0,
    
    // Revenue Cards
    revenueAccrued: 0,
    revenuePaid: 0,
    revenuePending: 0,

    // Alert Panels
    noSessionsAssignments: [],
    pendingPaymentsAssignments: [],

    // Roster / Activity
    recentSessions: [],
    physioPerformance: [],
    allAssignments: [],
    allPatients: [],
    allBilling: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get Patients
      const patientsPromise = supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Get Physiotherapists
      const physiosPromise = supabase
        .from('physiotherapists')
        .select('*');

      // 3. Get Assignments
      const assignmentsPromise = supabase
        .from('patient_assignments')
        .select('*, patients(*), physiotherapists(*)')
        .order('started_at', { ascending: false });

      // 4. Get Sessions (Today's count + Recent 5)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todaysSessionsPromise = supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .gte('session_date', todayStart.toISOString());

      const recentSessionsPromise = sessionsService.getSessions(5);

      // 5. Get Patient Billing View
      const billingViewPromise = supabase
        .from('v_patient_billing')
        .select('*');

      // 6. Get Physio Performance View
      const physioPerformancePromise = supabase
        .from('v_physio_performance')
        .select('*');

      // 7. Get All Sessions for exact therapist performance metrics
      const allSessionsPromise = supabase
        .from('sessions')
        .select('*, patients(*), physiotherapists(*)');

      const [
        patientsRes,
        physiosRes,
        assignmentsRes,
        todaysCountRes,
        recentSessionsRes,
        billingViewRes,
        physioPerformanceRes,
        allSessionsRes
      ] = await Promise.all([
        patientsPromise,
        physiosPromise,
        assignmentsPromise,
        todaysSessionsPromise,
        recentSessionsPromise,
        billingViewPromise,
        physioPerformancePromise,
        allSessionsPromise
      ]);

      if (patientsRes.error) throw patientsRes.error;
      if (physiosRes.error) throw physiosRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;
      if (recentSessionsRes.error) throw recentSessionsRes.error;
      if (billingViewRes.error) throw billingViewRes.error;
      if (physioPerformanceRes.error) throw physioPerformanceRes.error;

      const patients = patientsRes.data || [];
      const physios = physiosRes.data || [];
      const assignments = assignmentsRes.data || [];
      const recentSessions = recentSessionsRes.data || [];
      const billingView = billingViewRes.data || [];
      const physioPerf = physioPerformanceRes.data || [];
      const allSessions = allSessionsRes.data || [];

      // Calculate revenue stats
      let revenueAccrued = 0;
      let revenuePaid = 0;
      let revenuePending = 0;

      billingView.forEach((b) => {
        const cost = Number(b.total_cost) || 0;
        revenueAccrued += cost;
        if (b.is_paid) {
          revenuePaid += cost;
        } else {
          revenuePending += cost;
        }
      });

      // Filter alert panels
      // Alert Panel A: Assignments with zero linked sessions
      const noSessionsAssignments = billingView
        .filter((b) => Number(b.total_sessions) === 0)
        .map((b) => {
          const assign = assignments.find((a) => a.id === b.assignment_id);
          return {
            ...b,
            patient: assign?.patients || {},
            physiotherapist: assign?.physiotherapists || {}
          };
        });

      // Alert Panel B: Pending payments (is_paid = false and has sessions)
      const pendingPaymentsAssignments = billingView
        .filter((b) => !b.is_paid && Number(b.total_sessions) > 0)
        .map((b) => {
          const assign = assignments.find((a) => a.id === b.assignment_id);
          return {
            ...b,
            patient: assign?.patients || {},
            physiotherapist: assign?.physiotherapists || {}
          };
        });

      // Map billing records for billing tab
      const allBilling = billingView.map((b) => {
        const assign = assignments.find((a) => a.id === b.assignment_id);
        return {
          ...b,
          patient: assign?.patients || {},
          physiotherapist: assign?.physiotherapists || {}
        };
      });

      setData({
        totalPatients: patients.length,
        activeTreatments: assignments.filter((a) => a.is_active).length,
        activeTherapists: physios.length,
        todaysSessionsCount: todaysCountRes.count || 0,
        revenueAccrued,
        revenuePaid,
        revenuePending,
        noSessionsAssignments,
        pendingPaymentsAssignments,
        recentSessions,
        physioPerformance: physioPerf,
        allAssignments: assignments,
        allPatients: patients,
        allBilling,
        allSessions
      });
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    ...data,
    loading,
    error,
    refresh: fetchMetrics
  };
};
