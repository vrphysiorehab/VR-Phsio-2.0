import { supabase } from '../lib/supabaseClient';

export const patientsService = {
  async getPatients() {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async searchPatients(query) {
    if (!query || query.trim() === '') {
      return this.getPatients();
    }
    const cleanQuery = `%${query.trim()}%`;
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(`first_name.ilike.${cleanQuery},surname.ilike.${cleanQuery},mobile.ilike.${cleanQuery},patient_code.ilike.${cleanQuery}`)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getPatientById(id) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async createPatient(patientData) {
    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select()
      .single();
    return { data, error };
  },

  async updatePatient(id, patientData) {
    const { data, error } = await supabase
      .from('patients')
      .update(patientData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async updatePatientPdfUrl(id, pdfUrl) {
    const { data, error } = await supabase
      .from('patients')
      .update({ registration_pdf_url: pdfUrl })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async updatePatientEmail(id, email) {
    const { data, error } = await supabase
      .from('patients')
      .update({ email })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};
