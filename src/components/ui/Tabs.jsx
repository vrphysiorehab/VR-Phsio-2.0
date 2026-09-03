import React from 'react';
import styles from './Tabs.module.css';

export const Tabs = ({
  tabs = [], // [{ id, label, badge }]
  activeTab,
  onChange,
  className = ''
}) => {
  return (
    <div className={`${styles.tabsContainer} ${className}`}>
      <div className={styles.tabsList}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabBtn} ${isActive ? styles.active : ''}`}
              onClick={() => onChange(tab.id)}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge !== null && (
                <span className={`${styles.badge} ${isActive ? styles.activeBadge : ''}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
