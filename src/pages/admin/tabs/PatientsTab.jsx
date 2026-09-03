import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import SearchBar from '../../../components/ui/SearchBar';
import PatientDetailModal from '../components/PatientDetailModal';
import { formatDate } from '../../../utils/dateHelpers';
import { LayoutGrid, Table as TableIcon, ArrowUpDown, UserCheck } from 'lucide-react';

export const PatientsTab = ({ patients = [], assignments = [], billing = [], onPrintReport, reportStep, onOpenMail, onOpenWhatsApp }) => {
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name' | 'cost'
  const [selectedPatientItem, setSelectedPatientItem] = useState(null);

  // Filter & Sort patients
  const filteredPatients = patients.filter((p) => {
    const patientAssigns = assignments.filter((a) => a.patient_id === p.id);
    const hasActive = patientAssigns.some((a) => a.is_active);
    const hasCompleted = patientAssigns.length > 0 && !hasActive;

    if (filter === 'active' && !hasActive) return false;
    if (filter === 'completed' && !hasCompleted) return false;

    if (query.trim()) {
      const q = query.toLowerCase();
      const name = `${p.first_name} ${p.surname || ''}`.toLowerCase();
      return (
        name.includes(q) ||
        p.patient_code.toLowerCase().includes(q) ||
        (p.mobile && p.mobile.includes(q))
      );
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'name') return a.first_name.localeCompare(b.first_name);
    return 0;
  });

  return (
    <div style={styles.container}>
      {/* Patient Detail 360 EHR Modal */}
      {selectedPatientItem && (
        <PatientDetailModal
          isOpen={!!selectedPatientItem}
          onClose={() => setSelectedPatientItem(null)}
          patient={selectedPatientItem.patient}
          assignment={selectedPatientItem.assignment}
          billing={selectedPatientItem.billing}
          onPrintReport={onPrintReport}
          onOpenMail={onOpenMail}
          onOpenWhatsApp={onOpenWhatsApp}
        />
      )}

      {/* Top Filter & Toolbar */}
      <div style={styles.controls}>
        <div style={styles.filterBtns}>
          <button
            style={filter === 'all' ? styles.activeFilter : styles.filterBtn}
            onClick={() => setFilter('all')}
          >
            All Patients ({patients.length})
          </button>
          <button
            style={filter === 'active' ? styles.activeFilter : styles.filterBtn}
            onClick={() => setFilter('active')}
          >
            Active Treatment
          </button>
          <button
            style={filter === 'completed' ? styles.activeFilter : styles.filterBtn}
            onClick={() => setFilter('completed')}
          >
            Completed Cases
          </button>
        </div>

        <div style={styles.toolbarRight}>
          <div style={styles.sortSelectGroup}>
            <ArrowUpDown size={14} style={{ color: 'var(--text-secondary)' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.select}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>

          <div style={styles.viewToggle}>
            <button
              style={viewMode === 'grid' ? styles.activeViewBtn : styles.viewBtn}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              style={viewMode === 'table' ? styles.activeViewBtn : styles.viewBtn}
              onClick={() => setViewMode('table')}
              title="Dense Table View"
            >
              <TableIcon size={16} />
            </button>
          </div>

          <SearchBar value={query} onChange={setQuery} placeholder="Search patient name, code, phone..." />
        </div>
      </div>

      {/* Grid or Table Display */}
      {viewMode === 'grid' ? (
        <div style={styles.grid}>
          {filteredPatients.length === 0 ? (
            <div style={styles.emptyState}>No patients found matching the search criteria.</div>
          ) : (
            filteredPatients.map((p) => {
              const patientAssigns = assignments.filter((a) => a.patient_id === p.id);
              const activeAssign = patientAssigns.find((a) => a.is_active);
              const latestAssign = activeAssign || (patientAssigns.length > 0 ? patientAssigns[0] : null);
              
              const billRecord = billing.find((b) => b.patient_id === p.id && b.assignment_id === latestAssign?.id);
              const totalSessions = billRecord?.total_sessions || 0;
              const totalCost = billRecord?.total_cost || 0;

              return (
                <Card
                  key={p.id}
                  title={`${p.first_name} ${p.surname || ''}`}
                  subtitle={`Registered: ${formatDate(p.created_at)}`}
                  className="glass-panel"
                  extra={<Badge variant={activeAssign ? 'success' : 'secondary'}>{activeAssign ? 'Active' : 'Closed'}</Badge>}
                >
                  <div style={styles.cardContent}>
                    <div style={styles.meta}>
                      <p style={styles.text}><strong>Code:</strong> {p.patient_code}</p>
                      <p style={styles.text}><strong>Mobile:</strong> {p.mobile}</p>
                      <p style={styles.text}><strong>Diagnosis:</strong> {latestAssign?.diagnosis || 'General Rehab'}</p>
                      <p style={styles.text}><strong>Primary Therapist:</strong> {latestAssign?.physiotherapists?.name || 'Unassigned'}</p>
                      <p style={styles.text}><strong>Sessions Logged:</strong> {totalSessions} session(s)</p>
                      <p style={styles.text}><strong>Total Accrued Cost:</strong> ₹{Number(totalCost).toFixed(2)}</p>
                    </div>

                    <div style={styles.actions}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedPatientItem({ patient: p, assignment: latestAssign, billing: billRecord })}
                      >
                        <UserCheck size={13} style={{ marginRight: 4 }} /> 360° EHR Profile
                      </Button>

                      {latestAssign && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPrintReport(p, latestAssign)}
                          loading={reportStep === 'generating'}
                        >
                          Case Report PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        /* Dense Data Table View */
        <div style={styles.tableWrapper} className="glass-panel">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Patient Code</th>
                <th style={styles.th}>Patient Name</th>
                <th style={styles.th}>Mobile</th>
                <th style={styles.th}>Diagnosis</th>
                <th style={styles.th}>Primary Therapist</th>
                <th style={styles.th}>Sessions</th>
                <th style={styles.th}>Accrued Cost</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={9} style={styles.emptyTd}>No patients match filter criteria.</td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const patientAssigns = assignments.filter((a) => a.patient_id === p.id);
                  const activeAssign = patientAssigns.find((a) => a.is_active);
                  const latestAssign = activeAssign || (patientAssigns.length > 0 ? patientAssigns[0] : null);
                  const billRecord = billing.find((b) => b.patient_id === p.id && b.assignment_id === latestAssign?.id);
                  const totalSessions = billRecord?.total_sessions || 0;
                  const totalCost = billRecord?.total_cost || 0;

                  return (
                    <tr key={p.id} style={styles.tr}>
                      <td style={styles.tdCode}>{p.patient_code}</td>
                      <td style={styles.tdName}>{p.first_name} {p.surname || ''}</td>
                      <td style={styles.td}>{p.mobile}</td>
                      <td style={styles.td}>{latestAssign?.diagnosis || 'General Rehab'}</td>
                      <td style={styles.td}>{latestAssign?.physiotherapists?.name || 'Unassigned'}</td>
                      <td style={styles.td}>{totalSessions}</td>
                      <td style={styles.tdCost}>₹{Number(totalCost).toFixed(2)}</td>
                      <td style={styles.td}>
                        <Badge variant={activeAssign ? 'success' : 'secondary'}>{activeAssign ? 'Active' : 'Closed'}</Badge>
                      </td>
                      <td style={styles.tdActions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPatientItem({ patient: p, assignment: latestAssign, billing: billRecord })}
                        >
                          View EHR
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--space-md)',
    flexWrap: 'wrap',
    marginBottom: 'var(--space-sm)'
  },
  filterBtns: {
    display: 'flex',
    gap: 'var(--space-sm)'
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  activeFilter: {
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--primary-light)',
    border: '1px solid var(--primary)',
    color: 'var(--primary)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-glow)'
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    flexWrap: 'wrap'
  },
  sortSelectGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '0 8px'
  },
  select: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: 'var(--text-xs)',
    padding: '6px 0',
    outline: 'none',
    cursor: 'pointer'
  },
  viewToggle: {
    display: 'flex',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '2px'
  },
  viewBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer'
  },
  activeViewBtn: {
    backgroundColor: 'var(--primary)',
    border: 'none',
    color: '#000',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 'var(--space-lg)'
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: 'var(--space-2xl) 0',
    color: 'var(--text-muted)',
    fontSize: 'var(--text-sm)'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    gap: 'var(--space-md)'
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  text: {
    margin: 0,
    fontSize: 'var(--text-xs)',
    color: 'var(--text-secondary)'
  },
  actions: {
    display: 'flex',
    gap: 'var(--space-sm)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: 'var(--space-sm)',
    marginTop: 'var(--space-xs)',
    flexWrap: 'wrap'
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: 'var(--text-xs)'
  },
  th: {
    padding: '10px 14px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    borderBottom: '1px solid var(--border-color)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontSize: '10px'
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)'
  },
  td: {
    padding: '10px 14px',
    color: 'var(--text-primary)'
  },
  tdCode: {
    padding: '10px 14px',
    color: 'var(--primary)',
    fontWeight: '700'
  },
  tdName: {
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontWeight: '700'
  },
  tdCost: {
    padding: '10px 14px',
    color: 'var(--success)',
    fontWeight: '700'
  },
  tdActions: {
    padding: '8px 14px'
  },
  emptyTd: {
    textAlign: 'center',
    padding: 'var(--space-xl)',
    color: 'var(--text-muted)'
  }
};

export default PatientsTab;
