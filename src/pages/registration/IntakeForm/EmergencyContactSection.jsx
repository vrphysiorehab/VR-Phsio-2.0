import React from 'react';
import Input from '../../../components/ui/Input';

export const EmergencyContactSection = ({ values, onChange }) => {
  const contact = values.emergency_contact || {
    name: '',
    relation: '',
    phone: ''
  };

  const handleFieldChange = (key, val) => {
    onChange('emergency_contact', {
      ...contact,
      [key]: val
    });
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>3. Emergency Contact Details</h3>
      <div style={styles.grid}>
        <Input
          label="Contact Name"
          value={contact.name || ''}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder="e.g. Spouse, Parent, Sibling"
        />

        <Input
          label="Relationship"
          value={contact.relation || ''}
          onChange={(e) => handleFieldChange('relation', e.target.value)}
          placeholder="e.g. Wife, Husband, Mother"
        />

        <Input
          label="Phone Number"
          type="tel"
          value={contact.phone || ''}
          onChange={(e) => handleFieldChange('phone', e.target.value)}
          placeholder="e.g. +1 (555) 019-2834"
        />
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
  }
};

export default EmergencyContactSection;
