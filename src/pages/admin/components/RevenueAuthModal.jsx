import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Shield, Lock, Key, CheckCircle, AlertCircle } from 'lucide-react';

export const RevenueAuthModal = ({ isOpen, onClose, onUnlock, currentPin = '1234', onUpdatePin }) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (pinInput === currentPin) {
      onUnlock();
      setPinInput('');
      onClose();
    } else {
      setErrorMsg('Incorrect Security PIN. Authorized Head/Admin access only.');
    }
  };

  const handleChangePinSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (pinInput !== currentPin) {
      setErrorMsg('Current Master PIN is incorrect.');
      return;
    }
    if (newPin.length < 4) {
      setErrorMsg('New PIN must be at least 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMsg('New PIN and Confirm PIN do not match.');
      return;
    }

    onUpdatePin(newPin);
    setSuccessMsg('Master Security PIN updated successfully!');
    setIsChangingPin(false);
    setPinInput('');
    setNewPin('');
    setConfirmPin('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔒 Revenue Vault Security Access">
      <div style={styles.container}>
        <div style={styles.headerBadge}>
          <Shield size={36} style={{ color: 'var(--primary)' }} />
          <h3 style={styles.title}>Restricted Executive Data</h3>
          <p style={styles.subtitle}>
            Financial earnings, revenue accruals, and ledger accounts are restricted for Head/Admin access.
          </p>
        </div>

        {errorMsg && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={styles.successBox}>
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {!isChangingPin ? (
          <form onSubmit={handleAuth} style={styles.form}>
            <Input
              type="password"
              label="Enter Head/Admin Security PIN (Default: 1234)"
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              autoFocus
              maxLength={10}
            />

            <div style={styles.actionRow}>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsChangingPin(true)}>
                <Key size={14} style={{ marginRight: 4 }} /> Change PIN
              </Button>
              <Button type="submit" variant="primary" size="md">
                <Lock size={14} style={{ marginRight: 6 }} /> Unlock Revenue Vault
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePinSubmit} style={styles.form}>
            <Input
              type="password"
              label="Current Security PIN"
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
            />
            <Input
              type="password"
              label="New Security PIN (Min 4 digits)"
              placeholder="••••"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
            />
            <Input
              type="password"
              label="Confirm New PIN"
              placeholder="••••"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
            />

            <div style={styles.actionRow}>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsChangingPin(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" size="sm">
                Save New PIN
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    padding: 'var(--space-xs)'
  },
  headerBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'var(--space-xs)',
    marginBottom: 'var(--space-xs)'
  },
  title: {
    margin: 0,
    fontSize: 'var(--text-lg)',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  subtitle: {
    margin: 0,
    fontSize: 'var(--text-xs)',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid var(--danger)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--danger)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600'
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid var(--success)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--success)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)'
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'var(--space-sm)'
  }
};

export default RevenueAuthModal;
