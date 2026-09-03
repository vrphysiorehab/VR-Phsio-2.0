import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  // Shortcut functions
  const success = (message, duration) => context.addToast(message, 'success', duration);
  const error = (message, duration) => context.addToast(message, 'error', duration);
  const warning = (message, duration) => context.addToast(message, 'warning', duration);
  const info = (message, duration) => context.addToast(message, 'info', duration);

  return {
    toasts: context.toasts,
    addToast: context.addToast,
    removeToast: context.removeToast,
    success,
    error,
    warning,
    info
  };
};
