import React from 'react';

export const ClinicHeader = () => {
  return (
    <div style={styles.headerContainer}>
      {/* Left Column: Clinic Logo */}
      <div style={styles.leftCol}>
        <img src="/logo.png" alt="VR Physio Logo" style={styles.logoImg} />
      </div>

      {/* Center Column: Doctor Credentials & Director Details */}
      <div style={styles.centerCol}>
        <h1 style={styles.mainTitle}>VR Physio Rehab</h1>
        <h2 style={styles.drName}>Dr. Venkat PT</h2>
        <p style={styles.drSub}>M.P.T Ortho | M.I.A.P</p>
        <p style={styles.drSub}>Ph.D (Ortho)</p>
        <p style={styles.drSub}>Director, VR Physio Rehab</p>
      </div>

      {/* Right Column: Address & Contact */}
      <div style={styles.rightCol}>
        <p style={styles.boldDetailText}>VR Physio Rehab</p>
        <p style={styles.detailText}>Aditya Ellen Plaza</p>
        <p style={styles.detailText}>Hyderabad - 500096</p>
        <p style={styles.detailText}>+91 77949 21287</p>
        <p style={styles.detailText}>vrphysiorehab@gmail.com</p>
        <p style={styles.detailText}>vrphysiorehab.com</p>
      </div>
    </div>
  );
};

const styles = {
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2.5px solid #000000',
    paddingBottom: '8px',
    marginBottom: '15px',
    fontFamily: "'Inter', sans-serif",
    width: '100%'
  },
  leftCol: {
    display: 'flex',
    alignItems: 'center',
    width: '15%'
  },
  logoImg: {
    width: '78px',
    height: '78px',
    objectFit: 'contain'
  },
  centerCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
    textAlign: 'center'
  },
  mainTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '800',
    color: '#090d16',
    lineHeight: '1.2'
  },
  drName: {
    margin: '3px 0 1px 0',
    fontSize: '11px',
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: '1.2'
  },
  drSub: {
    margin: 0,
    fontSize: '8.5px',
    color: '#4b5563',
    lineHeight: '1.2',
    fontWeight: '500'
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'right',
    width: '35%',
    gap: '1px'
  },
  detailText: {
    margin: 0,
    fontSize: '8.5px',
    color: '#374151',
    lineHeight: '1.2',
    fontWeight: '500'
  },
  boldDetailText: {
    margin: '0 0 1px 0',
    fontSize: '9px',
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: '1.2'
  }
};

export default ClinicHeader;
