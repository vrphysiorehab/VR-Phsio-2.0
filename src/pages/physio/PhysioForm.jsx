import React, { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const PhysioForm = ({ initialValues, onSubmit, onCancel, mutating }) => {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name || '');
      setDesignation(initialValues.designation || '');
      setPhone(initialValues.phone || '');
      setExperience(initialValues.experience !== undefined && initialValues.experience !== null ? String(initialValues.experience) : '');
    } else {
      setName('');
      setDesignation('');
      setPhone('');
      setExperience('');
    }
    setErrors({});
  }, [initialValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!designation.trim()) newErrors.designation = 'Designation is required';
    if (!phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else {
      // Basic phone check
      const re = /^\+?[0-9\s\-()]{7,15}$/;
      if (!re.test(phone)) newErrors.phone = 'Invalid phone number format';
    }

    if (experience !== '') {
      const expNum = Number(experience);
      if (isNaN(expNum) || expNum < 0) {
        newErrors.experience = 'Experience must be a positive number';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name,
      designation,
      phone,
      experience: experience !== '' ? Number(experience) : null
    });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <Input
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
        disabled={mutating}
        placeholder="e.g. Dr. Jane Smith"
      />

      <Input
        label="Designation / Specialization"
        value={designation}
        onChange={(e) => setDesignation(e.target.value)}
        error={errors.designation}
        required
        disabled={mutating}
        placeholder="e.g. Senior Sports Physiotherapist"
      />

      <Input
        label="Years of Experience"
        type="number"
        min="0"
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
        error={errors.experience}
        disabled={mutating}
        placeholder="e.g. 5"
      />

      <Input
        label="Phone Number"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
        required
        disabled={mutating}
        placeholder="e.g. +91 77949 21287"
      />

      <div style={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={mutating}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={mutating}>
          {initialValues ? 'Save Changes' : 'Add Therapist'}
        </Button>
      </div>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--space-md)',
    marginTop: 'var(--space-md)'
  }
};

export default PhysioForm;
