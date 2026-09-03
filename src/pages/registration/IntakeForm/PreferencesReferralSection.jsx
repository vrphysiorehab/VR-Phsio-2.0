import React from 'react';
import Input from '../../../components/ui/Input';
import styles from './PreferencesReferralSection.module.css';

export const PreferencesReferralSection = ({ values, onChange }) => {
  const gymVal = values.going_to_gym || 'No';
  const newsfeedVal = values.want_newsfeed || 'Yes';
  const referralVal = values.referral_source || 'Self';

  const referralOptions = [
    { value: 'Doctor', label: 'Doctor' },
    { value: 'Google', label: 'Google Search' },
    { value: 'Friends/Relatives', label: 'Friends / Relatives' },
    { value: 'Self', label: 'Self / Walk-in' }
  ];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>4. Fitness, Newsfeed & Referral Source</h3>

      <div className={styles.grid}>
        {/* Gym Attendance */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Are you currently going to a gym?</label>
          <div className={styles.radioGroup}>
            {['Yes', 'No'].map((opt) => (
              <label key={opt} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="going_to_gym"
                  value={opt}
                  checked={gymVal === opt}
                  onChange={(e) => onChange('going_to_gym', e.target.value)}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Newsfeed Subscription */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Would you like to receive our newsfeed & health updates?</label>
          <div className={styles.radioGroup}>
            {['Yes', 'No'].map((opt) => (
              <label key={opt} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="want_newsfeed"
                  value={opt}
                  checked={newsfeedVal === opt}
                  onChange={(e) => onChange('want_newsfeed', e.target.value)}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Referral Source */}
        <div className={styles.fullWidthGroup}>
          <label className={styles.label}>How did you hear about VR Physio Rehab?</label>
          <div className={styles.radioGrid}>
            {referralOptions.map((opt) => (
              <label key={opt.value} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="referral_source"
                  value={opt.value}
                  checked={referralVal === opt.value}
                  onChange={(e) => onChange('referral_source', e.target.value)}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Referral Details */}
        <div className={styles.fullWidthGroup}>
          <Input
            label="Referral Details / Doctor Name (Optional)"
            value={values.referral_details || ''}
            onChange={(e) => onChange('referral_details', e.target.value)}
            placeholder="e.g. Dr. Venkat / Recommender Name / Search Term"
          />
        </div>
      </div>
    </div>
  );
};

export default PreferencesReferralSection;
