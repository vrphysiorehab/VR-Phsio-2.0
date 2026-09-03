import { supabase } from '../lib/supabaseClient';

/**
 * Generates a random 6-digit code prefixed with VR-
 * @returns {string} e.g. "VR-678912"
 */
export const generateCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000);
  return `VR-${code}`;
};

export const generateUniquePatientCode = async () => {
  let code = generateCode();
  
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('patient_code')
      .eq('patient_code', code)
      .maybeSingle();

    if (error) {
      console.warn('Supabase duplicate code check failed, using generated code:', error);
      return code;
    }

    if (data) {
      // Collision found, generate a new one immediately
      code = generateCode();
    }
  } catch (err) {
    console.warn('Supabase code check threw exception, using generated code:', err);
  }

  return code;
};
