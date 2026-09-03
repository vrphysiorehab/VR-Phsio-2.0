import React from 'react';
import Input from '../../../components/ui/Input';
import styles from './ClinicalHistorySection.module.css';

export const ClinicalHistorySection = ({ values, onChange, errors = {} }) => {
  const medHistory = values.medical_history || {
    hypertension: false,
    diabetes: false,
    asthma: false,
    heart_condition: false,
    prior_surgeries: false,
    active_medications: false
  };

  const handleCheckboxChange = (key, checked) => {
    onChange('medical_history', {
      ...medHistory,
      [key]: checked
    });
  };

  const handleInvestigationsChange = (key, val) => {
    onChange('investigations', {
      ...(values.investigations || {}),
      [key]: val
    });
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>2. Clinical Intake & History</h3>

      <div className={styles.row}>
        <div className={styles.textareaWrapper}>
          <label className={styles.label}>Present Complaints / Symptoms *</label>
          <textarea
            className={`${styles.textarea} ${errors.present_complaints ? styles.textareaError : ''}`}
            value={values.present_complaints || ''}
            onChange={(e) => onChange('present_complaints', e.target.value)}
            placeholder="Describe the physical complaints, location of pain, intensity, etc. *"
            rows={3}
            required
          />
          {errors.present_complaints && (
            <span className={styles.errorText}>{errors.present_complaints}</span>
          )}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.textareaWrapper}>
          <label className={styles.label}>History of Presenting Illness</label>
          <textarea
            className={styles.textarea}
            value={values.history_of_illness || ''}
            onChange={(e) => onChange('history_of_illness', e.target.value)}
            placeholder="Onset details, aggravating factors, relieving factors, duration..."
            rows={3}
          />
        </div>
      </div>

      <div className={styles.grid2}>
        <div>
          <label className={styles.label}>Co-Morbidities & Medical History</label>
          <div className={styles.checkboxGrid}>
            {Object.keys(medHistory).map((key) => (
              <label key={key} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={medHistory[key] || false}
                  onChange={(e) => handleCheckboxChange(key, e.target.checked)}
                />
                <span className={styles.checkText}>
                  {key.replace(/_/g, ' ').toUpperCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={styles.label}>Diagnostic Investigations</label>
          <div className={styles.investigationInputs}>
            <Input
              label="X-Ray Details"
              value={values.investigations?.xray || ''}
              onChange={(e) => handleInvestigationsChange('xray', e.target.value)}
              placeholder="e.g. Spine normal, Joint space narrowed"
            />
            <Input
              label="MRI / CT Scan"
              value={values.investigations?.mri || ''}
              onChange={(e) => handleInvestigationsChange('mri', e.target.value)}
              placeholder="e.g. L4-L5 disc bulge"
            />
            <Input
              label="Blood / Other Tests"
              value={values.investigations?.blood_test || ''}
              onChange={(e) => handleInvestigationsChange('blood_test', e.target.value)}
              placeholder="e.g. High uric acid"
            />
          </div>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.textareaWrapper}>
          <label className={styles.label}>Personal & Family Clinical History</label>
          <textarea
            className={styles.textarea}
            value={values.personal_family_history || ''}
            onChange={(e) => onChange('personal_family_history', e.target.value)}
            placeholder="Genetic disorders, similar issues in relatives, lifestyle notes..."
            rows={2}
          />
        </div>
      </div>
    </div>
  );
};

const defaultStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  }
};

export default ClinicalHistorySection;
