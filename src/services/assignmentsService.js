import { supabase } from '../lib/supabaseClient';

export const assignmentsService = {
  async getAssignments() {
    const { data, error } = await supabase
      .from('patient_assignments')
      .select('*, patients(*), physiotherapists(*), sessions(cost)')
      .order('started_at', { ascending: false });

    if (error || !data) return { data, error };

    const formatted = data.map((assign) => {
      const total_sessions = assign.sessions ? assign.sessions.length : 0;
      const total_cost = assign.sessions && assign.sessions.length > 0
        ? assign.sessions.reduce((acc, s) => acc + Number(s.cost || 0), 0)
        : (total_sessions * Number(assign.cost_per_session || 0));
      const amount_paid = assign.amount_paid !== undefined && assign.amount_paid !== null
        ? Number(assign.amount_paid)
        : (assign.is_paid ? total_cost : 0);

      return {
        ...assign,
        assignment_id: assign.id,
        physio_id: assign.physio_id,
        cost_per_session: assign.cost_per_session,
        is_paid: total_cost > 0 ? (amount_paid >= total_cost) : true,
        amount_paid,
        total_sessions,
        total_cost,
        physiotherapist: assign.physiotherapists,
        patient: assign.patients
      };
    });

    return { data: formatted, error: null };
  },

  async getAssignmentsByPatientId(patientId) {
    const { data, error } = await supabase
      .from('patient_assignments')
      .select('*, physiotherapists(*)')
      .eq('patient_id', patientId)
      .order('started_at', { ascending: false });
    return { data, error };
  },

  async getActiveAssignment(patientId) {
    let { data, error } = await supabase
      .from('patient_assignments')
      .select('*, physiotherapists(*)')
      .eq('patient_id', patientId)
      .eq('is_active', true)
      .maybeSingle();

    if (!data) {
      const res = await supabase
        .from('patient_assignments')
        .select('*, physiotherapists(*)')
        .eq('patient_id', patientId)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      data = res.data;
      error = res.error;
    }

    if (data) {
      data.amount_paid = data.amount_paid !== undefined && data.amount_paid !== null ? Number(data.amount_paid) : 0;
    }
    return { data, error };
  },

  async createAssignment(assignmentData) {
    const { data, error } = await supabase
      .from('patient_assignments')
      .insert([{
        ...assignmentData,
        is_active: true,
        is_paid: false,
        amount_paid: 0,
        started_at: new Date().toISOString(),
        ended_at: null
      }])
      .select()
      .single();
    return { data, error };
  },

  async endTreatment(id) {
    const { data, error } = await supabase
      .from('patient_assignments')
      .update({ is_active: false, ended_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async reactivateTreatment(id) {
    const { data, error } = await supabase
      .from('patient_assignments')
      .update({ is_active: true, ended_at: null })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async markAsPaid(id, totalAmount = 0, currentPaid = 0, currentHistory = []) {
    const remaining = Math.max(0, Number(totalAmount) - Number(currentPaid));
    const newPaid = Number(totalAmount) > 0 ? Number(totalAmount) : Number(currentPaid);
    
    let updatedHistory = Array.isArray(currentHistory) ? [...currentHistory] : [];
    if (remaining > 0) {
      updatedHistory.push({
        id: `PAY-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        amount: remaining,
        mode: 'Full Settlement',
        notes: 'Full balance settlement'
      });
    }

    let res = await supabase
      .from('patient_assignments')
      .update({
        amount_paid: newPaid,
        payment_history: updatedHistory,
        is_paid: true
      })
      .eq('id', id)
      .select()
      .single();

    if (res.error && (res.error.code === 'PGRST204' || res.error.message?.includes('payment_history'))) {
      res = await supabase
        .from('patient_assignments')
        .update({
          amount_paid: newPaid,
          is_paid: true
        })
        .eq('id', id)
        .select()
        .single();

      if (res.error && (res.error.code === 'PGRST204' || res.error.message?.includes('amount_paid'))) {
        res = await supabase
          .from('patient_assignments')
          .update({ is_paid: true })
          .eq('id', id)
          .select()
          .single();
      }
    }

    return res;
  },

  async recordPayment(id, paymentAmount, mode = 'Cash', notes = '', currentPaid = 0, totalCost = 0, currentHistory = []) {
    const amountNum = Number(paymentAmount);
    const newPaid = Number(currentPaid) + amountNum;
    const isPaid = totalCost > 0 && newPaid >= totalCost;
    
    const newRecord = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      amount: amountNum,
      mode: mode || 'Cash',
      notes: notes || 'Advance / Partial Payment'
    };

    const updatedHistory = Array.isArray(currentHistory) ? [...currentHistory, newRecord] : [newRecord];

    let res = await supabase
      .from('patient_assignments')
      .update({
        amount_paid: newPaid,
        payment_history: updatedHistory,
        is_paid: isPaid
      })
      .eq('id', id)
      .select()
      .single();

    if (res.error && (res.error.code === 'PGRST204' || res.error.message?.includes('payment_history'))) {
      res = await supabase
        .from('patient_assignments')
        .update({
          amount_paid: newPaid,
          is_paid: isPaid
        })
        .eq('id', id)
        .select()
        .single();

      if (res.error && (res.error.code === 'PGRST204' || res.error.message?.includes('amount_paid'))) {
        res = await supabase
          .from('patient_assignments')
          .update({ is_paid: isPaid })
          .eq('id', id)
          .select()
          .single();
      }
    }

    return res;
  },

  async getPatientBillingSummary(patientId) {
    const { data, error } = await supabase
      .from('patient_assignments')
      .select('*, patients(*), physiotherapists(*), sessions(cost)')
      .eq('patient_id', patientId)
      .order('started_at', { ascending: false });

    if (error || !data) return { data, error };

    const formatted = data.map((assign) => {
      const total_sessions = assign.sessions ? assign.sessions.length : 0;
      const total_cost = assign.sessions && assign.sessions.length > 0
        ? assign.sessions.reduce((acc, s) => acc + Number(s.cost || 0), 0)
        : (total_sessions * Number(assign.cost_per_session || 0));
      const amount_paid = assign.amount_paid !== undefined && assign.amount_paid !== null
        ? Number(assign.amount_paid)
        : (assign.is_paid ? total_cost : 0);

      const rawHistory = assign.payment_history || [];
      const payment_history = Array.isArray(rawHistory) ? rawHistory : (typeof rawHistory === 'string' ? JSON.parse(rawHistory) : []);

      return {
        ...assign,
        assignment_id: assign.id,
        physio_id: assign.physio_id,
        cost_per_session: assign.cost_per_session,
        is_paid: total_cost > 0 ? (amount_paid >= total_cost) : true,
        amount_paid,
        payment_history,
        total_sessions,
        total_cost,
        physiotherapist: assign.physiotherapists,
        patient: assign.patients
      };
    });

    return { data: formatted, error: null };
  }
};
