import { supabase } from '../lib/supabaseClient';

export const sessionsService = {
  async getSessions(limit = 50) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*, patients(*), physiotherapists(*)')
      .order('session_date', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  async getSessionsByPatientId(patientId) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*, physiotherapists(*)')
      .eq('patient_id', patientId)
      .order('session_date', { ascending: true });
    return { data, error };
  },

  async getSessionsByAssignmentId(assignmentId) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*, physiotherapists(*)')
      .eq('assignment_id', assignmentId)
      .order('session_date', { ascending: true });
    return { data, error };
  },

  async createSession(sessionData) {
    const { data, error } = await supabase
      .from('sessions')
      .insert([{
        ...sessionData,
        session_date: sessionData.session_date || new Date().toISOString()
      }])
      .select('*, physiotherapists(*)')
      .single();
    return { data, error };
  },

  async updateSession(sessionId, updates) {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select('*, physiotherapists(*)')
      .single();
    return { data, error };
  },

  async deleteSession(sessionId) {
    const { data, error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);
    return { data, error };
  }
};
