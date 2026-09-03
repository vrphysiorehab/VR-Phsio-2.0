import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy-loaded pages
const AdminPage = React.lazy(() => import('./pages/admin/AdminPage'));
const RegistrationPage = React.lazy(() => import('./pages/registration/RegistrationPage'));
const AttendancePage = React.lazy(() => import('./pages/attendance/AttendancePage'));
const TreatmentPage = React.lazy(() => import('./pages/treatment/TreatmentPage'));
const BillingPage = React.lazy(() => import('./pages/billing/BillingPage'));
const PhysioDirectoryPage = React.lazy(() => import('./pages/physio/PhysioDirectoryPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin" replace />
      },
      {
        path: 'admin',
        element: (
          <Suspense fallback={<LoadingSpinner fullPage />}>
            <AdminPage />
          </Suspense>
        )
      },
      {
        path: 'registration',
        element: (
          <Suspense fallback={<LoadingSpinner fullPage />}>
            <RegistrationPage />
          </Suspense>
        )
      },
      {
        path: 'attendance',
        element: (
          <Suspense fallback={<LoadingSpinner fullPage />}>
            <AttendancePage />
          </Suspense>
        )
      },
      {
        path: 'treatment',
        element: (
          <Suspense fallback={<LoadingSpinner fullPage />}>
            <TreatmentPage />
          </Suspense>
        )
      },
      {
        path: 'bill',
        element: (
          <Suspense fallback={<LoadingSpinner fullPage />}>
            <BillingPage />
          </Suspense>
        )
      },
      {
        path: 'physio',
        element: (
          <Suspense fallback={<LoadingSpinner fullPage />}>
            <PhysioDirectoryPage />
          </Suspense>
        )
      },
      {
        path: '*',
        element: <Navigate to="/admin" replace />
      }
    ]
  }
]);

export default router;
