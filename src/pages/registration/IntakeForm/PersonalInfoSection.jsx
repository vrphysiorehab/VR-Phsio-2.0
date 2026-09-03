import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { calculateAge } from '../../../utils/dateHelpers';

export const PersonalInfoSection = ({ values, onChange, errors }) => {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>1. Personal Demographics</h3>
      
      <div style={styles.highlightedSection}>
        <Input
          label="Registration / Intake Date"
          type="date"
          value={values.registration_date || ''}
          onChange={(e) => onChange('registration_date', e.target.value)}
          error={errors.registration_date}
        />
        <span style={styles.helperText}>
          Defaults to today's date. Change if retroactively entering patient intake form.
        </span>
      </div>

      <div style={styles.grid}>
        <Select
          label="Title *"
          value={values.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          options={['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Master', 'Baby']}
          placeholder="Select Title"
          error={errors.title}
          required
        />
        
        <Input
          label="First Name *"
          value={values.first_name || ''}
          onChange={(e) => onChange('first_name', e.target.value)}
          error={errors.first_name}
          required
        />

        <Input
          label="Middle Name"
          value={values.middle_name || ''}
          onChange={(e) => onChange('middle_name', e.target.value)}
        />

        <Input
          label="Surname"
          value={values.surname || ''}
          onChange={(e) => onChange('surname', e.target.value)}
          error={errors.surname}
        />

        <Input
          label="Date of Birth"
          type="date"
          value={values.dob || ''}
          onChange={(e) => {
            const dobVal = e.target.value;
            onChange('dob', dobVal);
            onChange('age', calculateAge(dobVal));
          }}
          error={errors.dob}
        />

        <Input
          label="Age (Auto-Calculated)"
          type="number"
          value={values.age || ''}
          readOnly
          disabled
        />

        <Select
          label="Gender"
          value={values.gender || ''}
          onChange={(e) => onChange('gender', e.target.value)}
          options={['Male', 'Female', 'Other', 'Prefer not to say']}
          placeholder="Select Gender"
        />

        <Input
          label="Mobile Phone"
          type="tel"
          value={values.mobile || ''}
          onChange={(e) => onChange('mobile', e.target.value)}
          error={errors.mobile}
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={values.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          error={errors.email}
        />

        <Input
          label="Occupation"
          value={values.occupation || ''}
          onChange={(e) => onChange('occupation', e.target.value)}
        />

        <div style={styles.fullWidth}>
          <Input
            label="Residential Address"
            value={values.address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="Complete street address"
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  },
  title: {
    fontSize: 'var(--text-base)',
    fontWeight: '700',
    color: 'var(--primary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: 'var(--space-xs)',
    margin: 0
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 'var(--space-md)'
  },
  fullWidth: {
    gridColumn: '1 / -1'
  },
  highlightedSection: {
    border: '2px solid var(--primary)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-md)',
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
    marginBottom: 'var(--space-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)'
  },
  helperText: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontStyle: 'italic'
  }
};

export default PersonalInfoSection;
