import React, { useState, useMemo } from 'react';
import { FileText, Search, ArrowUpDown, Download } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import { formatDateTime } from '../../utils/dateHelpers';

export const SessionLedger = ({ sessions = [], patient, assignment }) => {
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  const filteredAndSortedSessions = useMemo(() => {
    let result = [...sessions];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((s) => {
        const treatmentMatch = s.treatment?.toLowerCase().includes(q);
        const physioMatch = s.physiotherapists?.name?.toLowerCase().includes(q);
        const dateMatch = formatDateTime(s.session_date).toLowerCase().includes(q);
        return treatmentMatch || physioMatch || dateMatch;
      });
    }

    result.sort((a, b) => {
      const timeA = new Date(a.session_date || 0).getTime();
      const timeB = new Date(b.session_date || 0).getTime();
      if (timeA !== timeB) {
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      const createdA = new Date(a.created_at || 0).getTime();
      const createdB = new Date(b.created_at || 0).getTime();
      return sortOrder === 'asc' ? createdA - createdB : createdB - createdA;
    });

    return result;
  }, [sessions, query, sortOrder]);

  const handleExportCsv = () => {
    if (!sessions || sessions.length === 0) return;
    const headers = ['S.No.', 'Session Date & Time', 'Treating Therapist', 'Treatment Description', 'Session Fee (INR)'];
    const rows = filteredAndSortedSessions.map((s, index) => {
      const dateStr = formatDateTime(s.session_date);
      const therapist = s.physiotherapists?.name || 'Primary Therapist';
      const treatmentClean = `"${(s.treatment || '').replace(/"/g, '""')}"`;
      const cost = Number(s.cost || 0).toFixed(2);
      return [index + 1, `"${dateStr}"`, `"${therapist}"`, treatmentClean, cost];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const patientCode = patient?.patient_code || 'PATIENT';
    link.setAttribute('download', `Clinical_Ledger_${patientCode}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="Ledger Empty"
        description="No treatment sessions have been recorded for this case yet. Log sessions under Attendance first."
        icon={FileText}
      />
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <h3 style={styles.heading}>
          Detailed Clinical Ledger ({filteredAndSortedSessions.length})
        </h3>

        <div style={styles.controlsRow}>
          <div style={styles.searchWrapper}>
            <Search size={14} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search notes or therapist..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <button
            type="button"
            style={styles.controlBtn}
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            title={
              sortOrder === 'asc'
                ? 'Sorted: Oldest first. Click to sort Newest first'
                : 'Sorted: Newest first. Click to sort Oldest first'
            }
          >
            <ArrowUpDown size={14} />
            <span>{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
          </button>

          <button
            type="button"
            style={styles.controlBtn}
            onClick={handleExportCsv}
            title="Export session ledger to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>S.No.</th>
              <th style={styles.th}>Date & Time</th>
              <th style={styles.th}>Treating Therapist</th>
              <th style={styles.th}>Treatment / Care Description</th>
              <th style={styles.thRight}>Session Fee</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedSessions.length === 0 ? (
              <tr style={styles.tr}>
                <td colSpan={5} style={styles.noMatchTd}>
                  No treatment sessions match "{query}"
                </td>
              </tr>
            ) : (
              filteredAndSortedSessions.map((session, index) => (
                <tr key={session.id} style={styles.tr}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{formatDateTime(session.session_date)}</td>
                  <td style={styles.td}>
                    {session.physiotherapists?.name || 'Primary Therapist'}
                  </td>
                  <td style={styles.tdDesc}>{session.treatment}</td>
                  <td style={styles.tdRight}>₹{Number(session.cost).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--space-md)'
  },
  heading: {
    fontSize: 'var(--text-sm)',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    flexWrap: 'wrap'
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    color: 'var(--text-secondary)',
    pointerEvents: 'none'
  },
  searchInput: {
    padding: '6px 12px 6px 30px',
    fontSize: 'var(--text-xs)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '210px',
    transition: 'border-color 0.2s ease'
  },
  controlBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    color: 'var(--text-primary)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'var(--bg-secondary)',
    fontSize: 'var(--text-sm)',
    textAlign: 'left'
  },
  thRow: {
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)'
  },
  th: {
    padding: 'var(--space-md)',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  thRight: {
    padding: 'var(--space-md)',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textAlign: 'right'
  },
  tr: {
    borderBottom: '1px solid var(--border-color)'
  },
  td: {
    padding: 'var(--space-md)',
    color: 'var(--text-primary)',
    verticalAlign: 'top'
  },
  tdDesc: {
    padding: 'var(--space-md)',
    color: 'var(--text-primary)',
    verticalAlign: 'top',
    whiteSpace: 'pre-wrap',
    fontWeight: '500'
  },
  tdRight: {
    padding: 'var(--space-md)',
    color: 'var(--primary)',
    fontWeight: '600',
    textAlign: 'right',
    verticalAlign: 'top'
  },
  noMatchTd: {
    padding: 'var(--space-lg)',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: 'var(--text-sm)'
  }
};

export default SessionLedger;
