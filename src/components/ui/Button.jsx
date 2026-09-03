import React from 'react';
import styles from './Button.module.css';
import { LoadingSpinner } from './LoadingSpinner';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary', // primary, secondary, danger, accent, ghost, outline
  size = 'md', // sm, md, lg
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${
        loading ? styles.loading : ''
      } ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className={styles.spinner} />}
      {!loading && icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.content}>{children}</span>
    </button>
  );
};

export default Button;
