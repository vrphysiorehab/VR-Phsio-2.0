import React from 'react';
import ClinicHeader from './ClinicHeader';

export const ExecutiveManualTemplate = () => {
  return (
    <div style={styles.pageContainer}>
      {/* PAGE 1: COVER PAGE & EXECUTIVE SUMMARY */}
      <div style={styles.page}>
        <ClinicHeader documentTitle="EXECUTIVE CLINIC OPERATIONS & TECHNICAL MANUAL" />
        
        <div style={styles.coverTitleBlock}>
          <div style={styles.docBadge}>DOCUMENT REF: VR-DOC-2026-EXEC-01</div>
          <h1 style={styles.mainTitle}>VR-Physio 2.0 Master Operating Guide</h1>
          <h3 style={styles.subTitle}>Comprehensive System Architecture, Workflow Procedures, Security Controls, and Tech Stack Reference</h3>
          <p style={styles.targetAudience}>Prepared Specially for: <strong>Head of Clinic & Executive Management</strong></p>
        </div>

        <div style={styles.cardBox}>
          <h3 style={styles.sectionHeader}>1. Executive Summary & Vision</h3>
          <p style={styles.bodyText}>
            VR-Physio 2.0 is an advanced, enterprise-grade Virtual Reality Physiotherapy Administration and Clinical EHR Suite designed for modern rehabilitation clinics. The platform unifies patient intake, daily attendance logging, treatment tracking, granular payment ledgers, therapist roster performance, and automated multi-channel messaging (WhatsApp & Email).
          </p>
          <p style={styles.bodyText}>
            This manual serves as the authoritative guide for clinic leadership and administrative staff. It outlines system features, security protocols (Role-Based Access Control), operational SOPs, messaging configurations, and technical stack details to ensure 100% operational continuity.
          </p>
        </div>

        <div style={styles.metaFooter}>
          <span>Version: 2.0 (Pro Max Edition)</span>
          <span>Date: September 2026</span>
          <span>Page 1 of 8</span>
        </div>
      </div>

      {/* PAGE 2: TABLE OF CONTENTS & QUICK SNAPSHOT */}
      <div style={{ ...styles.page, pageBreakBefore: 'always' }}>
        <ClinicHeader documentTitle="TABLE OF CONTENTS & SYSTEM SNAPSHOT" />

        <h2 style={styles.pageHeading}>Table of Contents</h2>
        
        <div style={styles.tocGrid}>
          <div style={styles.tocItem}>
            <span style={styles.tocNum}>Section 1</span>
            <span style={styles.tocTitle}>Master Technology Stack & System Architecture</span>
            <span style={styles.tocPage}>Page 3</span>
          </div>
          <div style={styles.tocItem}>
            <span style={styles.tocNum}>Section 2</span>
            <span style={styles.tocTitle}>Complete Module Directory ("What All Is There")</span>
            <span style={styles.tocPage}>Page 4</span>
          </div>
          <div style={styles.tocItem}>
            <span style={styles.tocNum}>Section 3</span>
            <span style={styles.tocTitle}>Role-Based Security & Restricted Revenue Vault</span>
            <span style={styles.tocPage}>Page 5</span>
          </div>
          <div style={styles.tocItem}>
            <span style={styles.tocNum}>Section 4</span>
            <span style={styles.tocTitle}>Standard Operating Procedures (SOPs & Daily Workflows)</span>
            <span style={styles.tocPage}>Page 6</span>
          </div>
          <div style={styles.tocItem}>
            <span style={styles.tocNum}>Section 5</span>
            <span style={styles.tocTitle}>WhatsApp & Email Integration Setup Guide</span>
            <span style={styles.tocPage}>Page 7</span>
          </div>
          <div style={styles.tocItem}>
            <span style={styles.tocNum}>Section 6</span>
            <span style={styles.tocTitle}>Troubleshooting, System Maintenance & Sign-off</span>
            <span style={styles.tocPage}>Page 8</span>
          </div>
        </div>

        <div style={styles.cardBox}>
          <h3 style={styles.sectionHeader}>Quick System Snapshot</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Module Name</th>
                <th style={styles.th}>Primary Purpose</th>
                <th style={styles.th}>Authorized Personnel</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.tdBold}>📊 Admin Command Center</td>
                <td style={styles.td}>Executive dashboard, KPI counters, SVG financial charts</td>
                <td style={styles.td}>Head of Clinic (Restricted Revenue) / Admin</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>👥 Patients Directory & EHR</td>
                <td style={styles.td}>360° EHR profile drawers, patient search, intake & case PDFs</td>
                <td style={styles.td}>Receptionist / Admin / Physios</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>💳 Financial Ledger & Billing</td>
                <td style={styles.td}>Payment settlements, partial payment modal, CSV export</td>
                <td style={styles.td}>Head of Clinic (PIN Protected) / Receptionist</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>🩺 Therapists Details Page</td>
                <td style={styles.td}>Dedicated page for therapist roster, workload tags, notes</td>
                <td style={styles.td}>Receptionist / Head / Therapists</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>💬 WhatsApp Dispatcher</td>
                <td style={styles.td}>1-Click Web WhatsApp & Meta API PDF report link dispatch</td>
                <td style={styles.td}>Receptionist / Admin Desk</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>📝 Clinical Notes System</td>
                <td style={styles.td}>Dispatch priority alerts & schedule instructions to physios</td>
                <td style={styles.td}>Head of Clinic / Admin Desk</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={styles.metaFooter}>
          <span>VR-Physio 2.0 Manual</span>
          <span>Confidential - Executive Access</span>
          <span>Page 2 of 8</span>
        </div>
      </div>

      {/* PAGE 3: TECH STACK & SYSTEM ARCHITECTURE */}
      <div style={{ ...styles.page, pageBreakBefore: 'always' }}>
        <ClinicHeader documentTitle="SECTION 1: TECH STACK & ARCHITECTURE" />

        <h2 style={styles.pageHeading}>Section 1: Master Technology Stack</h2>

        <div style={styles.cardBox}>
          <p style={styles.bodyText}>
            VR-Physio 2.0 is engineered with a modern, high-performance tech stack designed for speed, security, and maximum reliability across desktop, tablet, and mobile devices.
          </p>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Layer / Technology</th>
                <th style={styles.th}>Specific Library / Version</th>
                <th style={styles.th}>Technical Role & Functionality</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.tdBold}>Core Frontend Framework</td>
                <td style={styles.td}>React 19.2.7</td>
                <td style={styles.td}>Concurrent UI rendering, fast component lifecycle, zero lag state updates.</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>Build & Development Tool</td>
                <td style={styles.td}>Vite 8.1.1</td>
                <td style={styles.td}>Ultra-fast Hot Module Replacement (HMR) and optimized ES module bundler.</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>Client-side Routing</td>
                <td style={styles.td}>React Router DOM v7.18</td>
                <td style={styles.td}>Single Page Application (SPA) routing with lazy-loaded page chunks.</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>Database & Real-time Cloud</td>
                <td style={styles.td}>Supabase PostgreSQL 2.110</td>
                <td style={styles.td}>Cloud database views (`v_patient_billing`, `v_physio_performance`), Row Level Security.</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>Cloud Media Storage</td>
                <td style={styles.td}>Supabase Storage Buckets</td>
                <td style={styles.td}>Secure cloud hosting for generated Intake PDFs and Treatment Report PDFs.</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>PDF Document Engine</td>
                <td style={styles.td}>html2pdf.js 0.14.0 + jsPDF</td>
                <td style={styles.td}>High-DPI A4 canvas rendering for patient reports, invoices, and clinic forms.</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>Messaging Protocols</td>
                <td style={styles.td}>WhatsApp Web API & Meta Hooks</td>
                <td style={styles.td}>1-Click Web WhatsApp pre-filled link launcher + Meta Cloud API hook placeholders.</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>Styling & Aesthetics</td>
                <td style={styles.td}>Vanilla CSS Modules + Glassmorphism</td>
                <td style={styles.td}>Translucent frosted glass design tokens, responsive breakpoints, dark mode optimization.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={styles.metaFooter}>
          <span>VR-Physio 2.0 Manual</span>
          <span>Section 1: Architecture</span>
          <span>Page 3 of 8</span>
        </div>
      </div>

      {/* PAGE 4: MODULE DIRECTORY */}
      <div style={{ ...styles.page, pageBreakBefore: 'always' }}>
        <ClinicHeader documentTitle="SECTION 2: COMPLETE MODULE DIRECTORY" />

        <h2 style={styles.pageHeading}>Section 2: Complete Module Directory ("What All Is There")</h2>

        <div style={styles.moduleBox}>
          <h3 style={styles.moduleTitle}>1. 📊 Executive Admin Dashboard (`/admin`)</h3>
          <p style={styles.bodyText}>
            The central nerve center of the clinic. Contains executive KPI metric cards (*Total Patients, Active Treatment Plans, Rostered Therapists, Today's Sessions*), visual SVG revenue charts, session velocity histograms, diagnosis distribution breakdowns, and clinical alert banners for inactive cases.
          </p>
        </div>

        <div style={styles.moduleBox}>
          <h3 style={styles.moduleTitle}>2. 👥 Patients EHR & 360° Profile Drawer (`/admin` &rarr; Patients EHR)</h3>
          <p style={styles.bodyText}>
            A comprehensive electronic health record directory featuring **Dual View Modes** (Glass Cards Grid View & Dense Data Table View), multi-column search, and a 360° EHR modal displaying full medical history, session logs, pain score tracking, and direct document action shortcuts.
          </p>
        </div>

        <div style={styles.moduleBox}>
          <h3 style={styles.moduleTitle}>3. 💳 Financial Ledger & Billing Vault (`/admin` &rarr; Financial Ledger & `/bill`)</h3>
          <p style={styles.bodyText}>
            Tracks total accrued clinic charges, settled payments, outstanding dues, and collection efficiency. Features a **Granular Payment Entry Modal** for partial/advance payments, payment method tagging (*UPI, Cash, Card, Transfer*), and 1-click CSV ledger export.
          </p>
        </div>

        <div style={styles.moduleBox}>
          <h3 style={styles.moduleTitle}>4. 🩺 Dedicated Therapists Details Page (`/physio`)</h3>
          <p style={styles.bodyText}>
            A standalone page located directly below Billing & Invoices in the sidebar. Displays therapist performance metrics, active primary patient rosters, conducted session logs, workload capacity tags (*Optimal, Heavy, Available*), clinical notes notifications, and therapist profile CRUD controls with a live SearchBar.
          </p>
        </div>

        <div style={styles.moduleBox}>
          <h3 style={styles.moduleTitle}>5. 💬 WhatsApp & ✉ Email Dispatchers (`/admin` &rarr; WhatsApp / Mail)</h3>
          <p style={styles.bodyText}>
            Multi-channel patient communication tools. Allows searching patient records and dispatching clinical treatment reports and settled billing statements directly via 1-click Web WhatsApp or automated email dispatches.
          </p>
        </div>

        <div style={styles.metaFooter}>
          <span>VR-Physio 2.0 Manual</span>
          <span>Section 2: Modules</span>
          <span>Page 4 of 8</span>
        </div>
      </div>

      {/* PAGE 5: ROLE-BASED ACCESS & HEAD SECURITY */}
      <div style={{ ...styles.page, pageBreakBefore: 'always' }}>
        <ClinicHeader documentTitle="SECTION 3: SECURITY & HEAD ACCESS VAULT" />

        <h2 style={styles.pageHeading}>Section 3: Security & Head Access Controls</h2>

        <div style={styles.cardBox}>
          <h3 style={styles.sectionHeader}>Role Separation: Receptionist vs. Head of Clinic</h3>
          <p style={styles.bodyText}>
            VR-Physio 2.0 enforces strict financial privacy. Operational workflows are open to receptionists for daily clinic throughput, while sensitive financial earnings are locked behind the **Executive Revenue Vault**.
          </p>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Feature / Data Item</th>
                <th style={styles.th}>Receptionist / Desk Staff</th>
                <th style={styles.th}>Head of Clinic (Unlocked PIN)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.tdBold}>Patient Registration & Intake</td>
                <td style={styles.td}>Full Access</td>
                <td style={styles.td}>Full Access</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>Session Logging & Attendance</td>
                <td style={styles.td}>Full Access</td>
                <td style={styles.td}>Full Access</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>Therapist Roster & Clinical Notes</td>
                <td style={styles.td}>Full Access</td>
                <td style={styles.td}>Full Access</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>WhatsApp & Email Dispatchers</td>
                <td style={styles.td}>Full Access</td>
                <td style={styles.td}>Full Access</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>Accrued Revenue & Financial Dues</td>
                <td style={styles.td}><span style={{ color: '#d97706', fontWeight: 'bold' }}>🔒 Masked (Restricted)</span></td>
                <td style={styles.td}><span style={{ color: '#059669', fontWeight: 'bold' }}>🔓 Fully Unlocked</span></td>
              </tr>
              <tr>
                <td style={styles.tdBold}>Interactive SVG Revenue Analytics</td>
                <td style={styles.td}><span style={{ color: '#d97706', fontWeight: 'bold' }}>🔒 Locked Vault</span></td>
                <td style={styles.td}><span style={{ color: '#059669', fontWeight: 'bold' }}>🔓 Fully Visible</span></td>
              </tr>
              <tr>
                <td style={styles.tdBold}>Therapist Revenue Share Numbers</td>
                <td style={styles.td}><span style={{ color: '#d97706', fontWeight: 'bold' }}>🔒 Masked</span></td>
                <td style={styles.td}><span style={{ color: '#059669', fontWeight: 'bold' }}>🔓 Unlocked</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={styles.cardBox}>
          <h3 style={styles.sectionHeader}>Master PIN Management Procedure</h3>
          <p style={styles.bodyText}>
            1. <strong>Default Master PIN</strong>: The initial factory security PIN is <strong>1234</strong>.<br/>
            2. <strong>Unlocking Revenue Vault</strong>: Click <em>"Unlock Revenue Vault"</em> on the Dashboard or Billing summary bar. Enter PIN `1234` and click Unlock.<br/>
            3. <strong>Changing Master PIN</strong>: Open the Revenue Access modal, click <em>"Change PIN"</em>, enter the current PIN, type the new PIN (min 4 digits), and save.<br/>
            4. <strong>Locking Financial Vault</strong>: Before stepping away, click <em>"🔒 Lock Financial Vault"</em> in the Admin header to immediately re-mask all financial data.
          </p>
        </div>

        <div style={styles.metaFooter}>
          <span>VR-Physio 2.0 Manual</span>
          <span>Section 3: Security</span>
          <span>Page 5 of 8</span>
        </div>
      </div>

      {/* PAGE 6: STANDARD OPERATING PROCEDURES (SOPs) */}
      <div style={{ ...styles.page, pageBreakBefore: 'always' }}>
        <ClinicHeader documentTitle="SECTION 4: STANDARD OPERATING PROCEDURES" />

        <h2 style={styles.pageHeading}>Section 4: Standard Operating Procedures (SOPs)</h2>

        <div style={styles.sopBox}>
          <h3 style={styles.sopTitle}>SOP 1: New Patient Intake & Registration</h3>
          <p style={styles.sopText}>
            1. Navigate to <strong>Patient Intake (`/registration`)</strong>.<br/>
            2. Fill patient demographic details (Name, Code, Mobile, Email).<br/>
            3. Select Primary Physiotherapist and Diagnosis.<br/>
            4. Capture patient signature on the canvas and click <strong>Submit & Generate Intake PDF</strong>.<br/>
            5. The signed PDF uploads automatically to Supabase storage and prompts an intake email to the patient.
          </p>
        </div>

        <div style={styles.sopBox}>
          <h3 style={styles.sopTitle}>SOP 2: Daily Session Logging & Attendance Stream</h3>
          <p style={styles.sopText}>
            1. Navigate to <strong>Session Logger (`/attendance`)</strong>.<br/>
            2. Search patient by name or code.<br/>
            3. Select attending therapist, session date, treatment details, and session cost.<br/>
            4. Click <strong>Save Session Log</strong>. The session automatically updates patient total session counts, ledger accrued totals, and therapist performance stream.
          </p>
        </div>

        <div style={styles.sopBox}>
          <h3 style={styles.sopTitle}>SOP 3: Recording Ledger Payments & Advances</h3>
          <p style={styles.sopText}>
            1. Navigate to <strong>Financial Ledger (`/bill`)</strong> or <strong>Patients EHR</strong>.<br/>
            2. Locate the patient card and click <strong>Record Payment / Advance</strong>.<br/>
            3. In the Payment Modal, enter payment amount, select payment method (*UPI, Cash, Card, Bank Transfer*), and enter transaction reference.<br/>
            4. Click <strong>Confirm & Save Payment</strong>. Outstanding dues update instantly.
          </p>
        </div>

        <div style={styles.sopBox}>
          <h3 style={styles.sopTitle}>SOP 4: Dispatching Reports via WhatsApp & Email</h3>
          <p style={styles.sopText}>
            1. Navigate to <strong>WhatsApp Dispatch (`/admin` &rarr; WhatsApp)</strong> or <strong>Email Services</strong>.<br/>
            2. Search patient name.<br/>
            3. Choose document attachment option (*Treatment Report PDF, Bill Invoice PDF, or Both*).<br/>
            4. Type optional custom instructions (e.g. appointment reminder).<br/>
            5. Click <strong>Send via WhatsApp</strong>. Web WhatsApp launches pre-filled with patient details, treatment summary, cost breakdown, and uploaded PDF document link.
          </p>
        </div>

        <div style={styles.metaFooter}>
          <span>VR-Physio 2.0 Manual</span>
          <span>Section 4: SOPs</span>
          <span>Page 6 of 8</span>
        </div>
      </div>

      {/* PAGE 7: WHATSAPP & EMAIL INTEGRATION GUIDE */}
      <div style={{ ...styles.page, pageBreakBefore: 'always' }}>
        <ClinicHeader documentTitle="SECTION 5: MESSAGING INTEGRATION GUIDE" />

        <h2 style={styles.pageHeading}>Section 5: WhatsApp & Email Integration Guide</h2>

        <div style={styles.cardBox}>
          <h3 style={styles.sectionHeader}>WhatsApp Integration Protocol</h3>
          <p style={styles.bodyText}>
            VR-Physio 2.0 supports a dual WhatsApp dispatch architecture:
          </p>
          <p style={styles.bodyText}>
            <strong>1. Direct Web WhatsApp Launcher (Default - Zero API Setup Required)</strong>:<br/>
            Out of the box, clicking "Send via WhatsApp" dynamically renders the patient's A4 Case Report PDF, uploads it to Supabase Storage, and launches `https://api.whatsapp.com/send` pre-filled with formatted text and the public PDF URL. Works immediately on all desktop computers and mobile devices without paying Meta API fees.
          </p>
          <p style={styles.bodyText}>
            <strong>2. Meta WhatsApp Cloud API Hooks (For Automated Background Messaging)</strong>:<br/>
            When the clinic registers for official Meta WhatsApp Cloud API credentials, populate the environment keys in `.env` / Vercel configuration:
          </p>

          <pre style={styles.codeSnippet}>
{`# VR-Physio Meta WhatsApp Cloud API Integration Keys
VITE_WHATSAPP_API_KEY=EAAG...YourMetaApiKey...
VITE_WHATSAPP_PHONE_ID=10928371928374
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=91823719283`}
          </pre>

          <p style={styles.bodyText}>
            The system's `whatsappService.js` automatically detects these keys and triggers background WhatsApp Cloud API messages when available.
          </p>
        </div>

        <div style={styles.cardBox}>
          <h3 style={styles.sectionHeader}>Email Dispatch Architecture</h3>
          <p style={styles.bodyText}>
            Emails are processed via Supabase Edge Function `send-email`. When an admin dispatches an email from <strong>Email Services</strong>, the frontend converts PDF blobs to Base64 attachments and invokes the secure server function to deliver branded emails directly to the patient's inbox.
          </p>
        </div>

        <div style={styles.metaFooter}>
          <span>VR-Physio 2.0 Manual</span>
          <span>Section 5: Integration</span>
          <span>Page 7 of 8</span>
        </div>
      </div>

      {/* PAGE 8: TROUBLESHOOTING & SIGN-OFF */}
      <div style={{ ...styles.page, pageBreakBefore: 'always' }}>
        <ClinicHeader documentTitle="SECTION 6: MAINTENANCE & SIGN-OFF" />

        <h2 style={styles.pageHeading}>Section 6: Troubleshooting & System Maintenance</h2>

        <div style={styles.cardBox}>
          <h3 style={styles.sectionHeader}>Troubleshooting Matrix</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Observed Issue</th>
                <th style={styles.th}>Probable Cause</th>
                <th style={styles.th}>Resolution Step</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.tdBold}>"Roster Sync Issue" Banner</td>
                <td style={styles.td}>Supabase database credentials or network offline.</td>
                <td style={styles.td}>Check internet connection and verify `.env` Supabase URL/Anon key.</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>PDF Report Print Fails</td>
                <td style={styles.td}>DOM element ref not mounted during print trigger.</td>
                <td style={styles.td}>Ensure patient card is active before clicking print. Wait 300ms for DOM render.</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>WhatsApp Link Not Opening</td>
                <td style={styles.td}>Pop-up blocker active in browser.</td>
                <td style={styles.td}>Allow pop-ups for clinic web domain in browser settings.</td>
              </tr>
              <tr>
                <td style={styles.tdBold}>Forgotten Head Master PIN</td>
                <td style={styles.td}>PIN changed and forgotten by staff.</td>
                <td style={styles.td}>Clear `vr_physio_master_pin` from browser LocalStorage or reset to default `1234`.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Executive Sign-off Block */}
        <div style={styles.signoffBox}>
          <h3 style={styles.signoffTitle}>Executive Authorization & System Acceptance</h3>
          <p style={styles.bodyText}>
            This manual has been reviewed and accepted as the official operating manual for VR-Physio 2.0 rehab operations.
          </p>

          <div style={styles.signatureRow}>
            <div style={styles.sigCol}>
              <div style={styles.sigLine} />
              <span style={styles.sigLabel}>Head of Clinic / Medical Director</span>
              <span style={styles.sigSub}>Date: ________________________</span>
            </div>
            <div style={styles.sigCol}>
              <div style={styles.sigLine} />
              <span style={styles.sigLabel}>Lead System Administrator</span>
              <span style={styles.sigSub}>Date: ________________________</span>
            </div>
          </div>
        </div>

        <div style={styles.metaFooter}>
          <span>VR-Physio 2.0 Manual</span>
          <span>Section 6: Acceptance</span>
          <span>Page 8 of 8</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    width: '210mm',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    fontFamily: 'Arial, sans-serif'
  },
  page: {
    width: '210mm',
    minHeight: '297mm',
    padding: '15mm 15mm 20mm 15mm',
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  coverTitleBlock: {
    textAlign: 'center',
    margin: '30px 0'
  },
  docBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: '10px'
  },
  mainTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ca9f42',
    margin: '0 0 10px 0'
  },
  subTitle: {
    fontSize: '14px',
    fontWeight: 'normal',
    color: '#4b5563',
    margin: '0 0 15px 0'
  },
  targetAudience: {
    fontSize: '13px',
    color: '#111827'
  },
  cardBox: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '15px'
  },
  sectionHeader: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#ca9f42',
    margin: '0 0 10px 0',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '4px'
  },
  pageHeading: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ca9f42',
    margin: '10px 0 15px 0',
    borderBottom: '2px solid #ca9f42',
    paddingBottom: '4px'
  },
  bodyText: {
    fontSize: '12px',
    lineHeight: '1.6',
    color: '#374151',
    margin: '0 0 10px 0'
  },
  tocGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px'
  },
  tocItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 14px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    fontSize: '12px'
  },
  tocNum: {
    fontWeight: 'bold',
    color: '#ca9f42',
    width: '80px'
  },
  tocTitle: {
    flex: 1,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  tocPage: {
    color: '#6b7280',
    fontWeight: 'bold'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11px',
    marginTop: '5px'
  },
  th: {
    backgroundColor: '#f3f4f6',
    padding: '8px',
    textAlign: 'left',
    fontWeight: 'bold',
    border: '1px solid #e5e7eb',
    color: '#374151'
  },
  td: {
    padding: '8px',
    border: '1px solid #e5e7eb',
    color: '#4b5563'
  },
  tdBold: {
    padding: '8px',
    border: '1px solid #e5e7eb',
    color: '#111827',
    fontWeight: 'bold'
  },
  moduleBox: {
    backgroundColor: '#f9fafb',
    borderLeft: '4px solid #ca9f42',
    padding: '10px 14px',
    marginBottom: '10px',
    borderRadius: '0 4px 4px 0'
  },
  moduleTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 4px 0'
  },
  sopBox: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '10px'
  },
  sopTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#ca9f42',
    margin: '0 0 6px 0'
  },
  sopText: {
    fontSize: '11px',
    lineHeight: '1.5',
    color: '#374151',
    margin: 0
  },
  codeSnippet: {
    backgroundColor: '#1f2937',
    color: '#f9fafb',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '10px',
    fontFamily: 'monospace',
    overflowX: 'auto',
    margin: '8px 0'
  },
  signoffBox: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '15px',
    marginTop: '15px'
  },
  signoffTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ca9f42',
    margin: '0 0 10px 0'
  },
  signatureRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '30px'
  },
  sigCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '45%'
  },
  sigLine: {
    borderBottom: '1px solid #9ca3af',
    marginBottom: '4px'
  },
  sigLabel: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  sigSub: {
    fontSize: '10px',
    color: '#6b7280'
  },
  metaFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: '#9ca3af',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '6px',
    marginTop: '10px'
  }
};

export default ExecutiveManualTemplate;
