import React from 'react';
import { HelpCircle } from 'lucide-react';
import styles from './EmptyState.module.css';
import Button from './Button';

export const EmptyState = ({
  title = 'No records found',
  description = 'Try adjusting your search filters or add a new record to get started.',
  icon: Icon = HelpCircle,
  actionLabel,
  onAction,
  actionIcon,
  className = ''
}) => {
  return (
    <div className={`${styles.emptyState} ${className}`}>
      <div className={styles.iconWrapper}>
        <Icon size={40} className={styles.icon} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={actionIcon} variant="outline" className={styles.btn}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
