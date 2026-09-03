import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  CalendarCheck,
  FileText,
  CreditCard,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import styles from './Sidebar.module.css';

export const Sidebar = ({ collapsed, toggleCollapsed }) => {
  const menuItems = [
    { path: '/admin', label: 'Admin Panel', icon: LayoutDashboard },
    { path: '/registration', label: 'Patient Intake', icon: UserPlus },
    { path: '/attendance', label: 'Session Logger', icon: CalendarCheck },
    { path: '/treatment', label: 'Treatment Ledger', icon: FileText },
    { path: '/bill', label: 'Billing & Invoices', icon: CreditCard },
    { path: '/physio', label: 'Therapists Details', icon: Users }
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.logoSection}>
        <img
          src="/logo.png"
          alt="VR Physio Logo"
          className={styles.logoIcon}
          style={{ width: '42px', height: '42px', objectFit: 'contain' }}
        />
        {!collapsed && <span className={styles.logoText}>VR Physio</span>}
      </div>

      <nav className={styles.navigation}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <Icon size={20} className={styles.navIcon} />
              {!collapsed && <span className={styles.linkLabel}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <button
        type="button"
        className={styles.collapseToggle}
        onClick={toggleCollapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
};

export default Sidebar;
