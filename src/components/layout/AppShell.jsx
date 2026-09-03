import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ToastContainer } from '../ui/Toast';
import styles from './AppShell.module.css';

export const AppShell = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin':
        return 'Admin Dashboard';
      case '/registration':
        return 'Patient Registration';
      case '/attendance':
        return 'Attendance & Session Logging';
      case '/treatment':
        return 'Patient Ledger & Treatment';
      case '/bill':
        return 'Billing & Invoicing';
      case '/physio':
        return 'Physiotherapist Directory';
      default:
        return 'Physiotherapy Management Clinic';
    }
  };

  return (
    <div className={styles.appContainer}>
      <Sidebar collapsed={collapsed} toggleCollapsed={() => setCollapsed(!collapsed)} />
      
      <div className={styles.mainWrapper}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.pageTitle}>{getPageTitle()}</h2>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.userStatus}>
              <span className={styles.statusIndicator}></span>
              <span className={styles.userName}>Internal Dashboard (Authenticated)</span>
            </div>
          </div>
        </header>

        <main className={styles.mainContent}>
          <div className={styles.pageContainer}>
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AppShell;
