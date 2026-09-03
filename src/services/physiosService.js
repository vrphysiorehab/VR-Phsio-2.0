import { supabase } from '../lib/supabaseClient';

export const physiosService = {
  async getPhysios() {
    const { data, error } = await supabase
      .from('physiotherapists')
      .select('*')
      .order('name', { ascending: true });
    return { data, error };
  },

  async createPhysio(physioData) {
    const { data, error } = await supabase
      .from('physiotherapists')
      .insert([physioData])
      .select()
      .single();
    return { data, error };
  },

  async updatePhysio(id, physioData) {
    const { data, error } = await supabase
      .from('physiotherapists')
      .update(physioData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deletePhysio(id) {
    const { data, error } = await supabase
      .from('physiotherapists')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Check if a physiotherapist has any active assignments before deleting
  async getActiveAssignmentsCount(physioId) {
    const { count, error } = await supabase
      .from('patient_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('physio_id', physioId)
      .eq('is_active', true);
    return { data: count, error };
  }
};
