import React from 'react';
import styles from './LoadingSpinner.module.css';

export const LoadingSpinner = ({ size = 'md', fullPage = false, className = '' }) => {
  const spinnerElement = (
    <div className={`${styles.spinner} ${styles[size]} ${className}`}>
      <div className={styles.doubleBounce1}></div>
      <div className={styles.doubleBounce2}></div>
    </div>
  );

  if (fullPage) {
    return <div className={styles.fullPageWrapper}>{spinnerElement}</div>;
  }

  return spinnerElement;
};

export default LoadingSpinner;
