/**
 * Centralized validation rules for VR Physio Clinic forms
 */

export const validateRequired = (val) => {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  return true;
};

export const validateEmail = (email) => {
  if (!email) return true; // Optional field
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePhone = (phone) => {
  if (!phone) return false;
  // Validates basic phone formats (7 to 15 digits, optional + prefix)
  const re = /^\+?[0-9\s\-()]{7,15}$/;
  return re.test(String(phone));
};

export const validateCost = (cost) => {
  const num = Number(cost);
  return !isNaN(num) && num > 0;
};

export const validatePastDate = (dateStr) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Allow today
  return date <= today;
};

/**
 * Validates intake patient forms
 * @param {object} values - Form values
 * @returns {object} Errors map
 */
export const validatePatientForm = (values) => {
  const errors = {};

  if (!validateRequired(values.title)) {
    errors.title = 'Title is required';
  }

  if (!validateRequired(values.first_name)) {
    errors.first_name = 'First name is required';
  }

  if (!validateRequired(values.mobile)) {
    errors.mobile = 'Mobile phone is required';
  } else if (!validatePhone(values.mobile)) {
    errors.mobile = 'Invalid phone number format';
  }

  if (!validateRequired(values.present_complaints)) {
    errors.present_complaints = 'Present complaints / symptoms is required';
  }

  if (values.dob && !validatePastDate(values.dob)) {
    errors.dob = 'Date of birth cannot be in the future';
  }

  if (values.email && !validateEmail(values.email)) {
    errors.email = 'Invalid email address format';
  }

  return errors;
};
