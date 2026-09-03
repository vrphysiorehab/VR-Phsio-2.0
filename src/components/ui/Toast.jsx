import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import styles from './Toast.module.css';

export const Toast = ({ toast, onClose }) => {
  const { id, message, type } = toast;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className={styles.successIcon} />;
      case 'warning':
        return <AlertTriangle size={18} className={styles.warningIcon} />;
      case 'error':
        return <AlertCircle size={18} className={styles.errorIcon} />;
      case 'info':
      default:
        return <Info size={18} className={styles.infoIcon} />;
    }
  };

  return (
    <div className={`${styles.toast} ${styles[type]} glass-panel`}>
      <div className={styles.icon}>{getIcon()}</div>
      <div className={styles.message}>{message}</div>
      <button
        type="button"
        className={styles.closeBtn}
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
