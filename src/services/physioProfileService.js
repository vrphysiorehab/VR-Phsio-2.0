import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'vr_physio_full_profiles_v1';

export const physioProfileService = {
  getLocalProfiles() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Error reading physio profiles from localStorage:', e);
      return {};
    }
  },

  saveLocalProfiles(profilesMap) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profilesMap));
    } catch (e) {
      console.error('Error saving physio profiles to localStorage:', e);
    }
  },

  async getProfile(physioId) {
    const localMap = this.getLocalProfiles();
    if (localMap[physioId]) {
      return { data: localMap[physioId], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('physiotherapist_profiles')
        .select('*')
        .eq('physio_id', physioId)
        .single();
      
      if (!error && data) {
        localMap[physioId] = data;
        this.saveLocalProfiles(localMap);
        return { data, error: null };
      }
    } catch (e) {
      // fallback
    }

    return { data: localMap[physioId] || null, error: null };
  },

  async saveProfile(physioId, profileData) {
    const fullData = {
      physio_id: physioId,
      ...profileData,
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('physiotherapist_profiles')
        .upsert([fullData])
        .select();

      if (!error && data) {
        const localMap = this.getLocalProfiles();
        localMap[physioId] = data[0];
        this.saveLocalProfiles(localMap);
        return { data: data[0], error: null };
      }
    } catch (e) {
      // fallback to local
    }

    const localMap = this.getLocalProfiles();
    localMap[physioId] = fullData;
    this.saveLocalProfiles(localMap);
    return { data: fullData, error: null };
  },

  /**
   * Scans a profile data object for missing mandatory compliance items
   */
  getComplianceAudit(profileData, physioBase) {
    const missing = [];
    const p = profileData || {};

    if (!p.photo_url && !physioBase?.photo_url) missing.push('Photograph');
    if (!p.dob) missing.push('Date of Birth');
    if (!p.pan_number) missing.push('PAN Number');
    if (!p.pan_card_url) missing.push('PAN Card Copy');
    if (!p.govt_id_number) missing.push('Aadhaar / Govt ID Number');
    if (!p.govt_id_url) missing.push('Government ID Proof');
    if (!p.bpt_degree) missing.push('BPT Qualification Degree');
    if (!p.bpt_cert_url) missing.push('BPT Degree Certificate');
    if (!p.reg_number) missing.push('Professional Registration Number');
    if (!p.reg_cert_url) missing.push('Registration Certificate');
    if (!p.bank_account_number) missing.push('Bank Account Details');
    if (!p.cancelled_cheque_url) missing.push('Cancelled Cheque / Bank Proof');

    const isVerified = p.admin_verification_status === 'verified';
    return {
      missing,
      isComplete: missing.length === 0,
      isVerified,
      pendingCount: missing.length
    };
  }
};

export default physioProfileService;
