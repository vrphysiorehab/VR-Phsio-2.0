import React from 'react';
import styles from './Card.module.css';

export const Card = ({
  title,
  subtitle,
  extra,
  children,
  className = '',
  glass = false,
  onClick
}) => {
  return (
    <div
      className={`${styles.card} ${glass ? styles.glass : styles.normal} ${
        onClick ? styles.clickable : ''
      } ${className}`}
      onClick={onClick}
    >
      {(title || subtitle || extra) && (
        <div className={styles.header}>
          <div className={styles.titleSection}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
          </div>
          {extra && <div className={styles.extra}>{extra}</div>}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  );
};

export default Card;
