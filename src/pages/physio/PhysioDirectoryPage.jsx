import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Phone, Award, Briefcase, Search, Bell, Lock, CheckCircle, Clock, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import SearchBar from '../../components/ui/SearchBar';
import EmptyState from '../../components/ui/EmptyState';
import ClinicalNotesModal from '../admin/components/ClinicalNotesModal';
import RevenueAuthModal from '../admin/components/RevenueAuthModal';
import { useToast } from '../../hooks/useToast';
import { physiosService } from '../../services/physiosService';
import { notesService } from '../../services/notesService';
import { useAdminMetrics } from '../../hooks/useAdminMetrics';
import { formatDate, formatDateTime } from '../../utils/dateHelpers';
import PhysioForm from './PhysioForm';
import styles from './PhysioDirectoryPage.module.css';

export const PhysioDirectoryPage = () => {
  const [physios, setPhysios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPhysio, setEditingPhysio] = useState(null);
  
  // Delete handling state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetPhysio, setTargetPhysio] = useState(null);
  const [activeCasesCount, setActiveCasesCount] = useState(0);
  const [checkingAssignments, setCheckingAssignments] = useState(false);

  // Notes & Restricted Access state
  const [notesMap, setNotesMap] = useState({});
  const [selectedPhysioForNotes, setSelectedPhysioForNotes] = useState(null);
  const [isRevenueUnlocked, setIsRevenueUnlocked] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [masterPin, setMasterPin] = useState(() => localStorage.getItem('vr_physio_master_pin') || '1234');

  const toast = useToast();
  const metrics = useAdminMetrics();

  const loadPhysios = async () => {
    setLoading(true);
    try {
      const { data, error } = await physiosService.getPhysios();
      if (error) throw error;
      setPhysios(data || []);

      // Load notes map
      const nMap = {};
      if (data) {
        for (const p of data) {
          const { data: nData } = await notesService.getNotesForPhysio(p.id);
          nMap[p.id] = nData || [];
        }
      }
      setNotesMap(nMap);
    } catch (err) {
      console.error('Error loading therapists:', err);
      toast.error('Failed to load physiotherapists directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhysios();
  }, []);

  const handleMarkRead = async (physioId, noteId) => {
    await notesService.markAsRead(noteId);
    const { data } = await notesService.getNotesForPhysio(physioId);
    setNotesMap((prev) => ({ ...prev, [physioId]: data || [] }));
  };

  const handleAddClick = () => {
    setEditingPhysio(null);
    setShowFormModal(true);
  };

  const handleEditClick = (physio) => {
    setEditingPhysio(physio);
    setShowFormModal(true);
  };

  const handleDeleteClick = async (physio) => {
    setTargetPhysio(physio);
    setCheckingAssignments(true);
    
    try {
      const { data: count, error } = await physiosService.getActiveAssignmentsCount(physio.id);
      if (error) throw error;
      
      setActiveCasesCount(count || 0);
      setShowDeleteModal(true);
    } catch (err) {
      console.error('Error verifying assignments:', err);
      toast.error('Failed to verify therapist active roster count.');
    } finally {
      setCheckingAssignments(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    setMutating(true);
    try {
      if (editingPhysio) {
        const { error } = await physiosService.updatePhysio(editingPhysio.id, formData);
        if (error) throw error;
        toast.success(`Therapist profile for ${formData.name} updated.`);
      } else {
        const { error } = await physiosService.createPhysio(formData);
        if (error) throw error;
        toast.success(`${formData.name} added to directory.`);
      }
      setShowFormModal(false);
      loadPhysios();
      metrics.refresh();
    } catch (err) {
      console.error('Save therapist error:', err);
      toast.error(`Operation failed: ${err.message || 'Check database writes.'}`);
    } finally {
      setMutating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!targetPhysio) return;
    
    setMutating(true);
    try {
      const { error } = await physiosService.deletePhysio(targetPhysio.id);
      if (error) throw error;
      
      toast.success(`${targetPhysio.name} has been removed from directory.`);
      setShowDeleteModal(false);
      loadPhysios();
      metrics.refresh();
    } catch (err) {
      console.error('Delete therapist error:', err);
      toast.error(`Failed to delete therapist: ${err.message || 'Cannot delete due to linked sessions.'}`);
    } finally {
      setMutating(false);
      setTargetPhysio(null);
    }
  };

  // Filter therapists by search query
  const filteredPhysios = physios.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (p.name || '').toLowerCase();
    const desig = (p.designation || '').toLowerCase();
    const phone = (p.phone || '').toLowerCase();

    // Check primary patients assigned to this therapist
    const primaryAssigns = metrics.allAssignments?.filter((a) => a.physio_id === p.id) || [];
    const matchesPatient = primaryAssigns.some((a) => {
      const patName = `${a.patients?.first_name || ''} ${a.patients?.surname || ''}`.toLowerCase();
      const code = (a.patients?.patient_code || '').toLowerCase();
      return patName.includes(q) || code.includes(q);
    });

    return name.includes(q) || desig.includes(q) || phone.includes(q) || matchesPatient;
  });

  return (
    <div className={styles.container}>
      {/* Revenue Auth Security Modal */}
      <RevenueAuthModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onUnlock={() => setIsRevenueUnlocked(true)}
        currentPin={masterPin}
        onUpdatePin={(newPin) => {
          setMasterPin(newPin);
          localStorage.setItem('vr_physio_master_pin', newPin);
          toast.success('Master Security PIN updated.');
        }}
      />

      {/* Previous Notes History Modal */}
      {selectedPhysioForNotes && (
        <ClinicalNotesModal
          isOpen={!!selectedPhysioForNotes}
          onClose={() => setSelectedPhysioForNotes(null)}
          physioName={selectedPhysioForNotes.name}
          notes={notesMap[selectedPhysioForNotes.id] || []}
          onMarkRead={(noteId) => handleMarkRead(selectedPhysioForNotes.id, noteId)}
        />
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => !mutating && setShowFormModal(false)}
        title={editingPhysio ? 'Edit Therapist Profile' : 'Register New Physiotherapist'}
      >
        <PhysioForm
          initialValues={editingPhysio}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowFormModal(false)}
          mutating={mutating}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !mutating && setShowDeleteModal(false)}
        title="Confirm Therapist Removal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)} disabled={mutating}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} loading={mutating}>
              Confirm Delete
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
            Are you sure you want to delete <strong>{targetPhysio?.name}</strong> from the clinic directory?
          </p>

          {activeCasesCount > 0 && (
            <div style={inlineStyles.warningBox}>
              <strong>⚠️ Active Patients Warning:</strong> This therapist is currently assigned to{' '}
              <strong>{activeCasesCount} active case(s)</strong>.
            </div>
          )}
        </div>
      </Modal>

      {/* Top Header & Search Bar Bar */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>🩺 Therapists Details & Performance</h2>
          <p className={styles.subtitle}>Manage clinical specialists, duty roster, active cases, and clinical notes.</p>
        </div>

        <div className={styles.headerActions}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search therapist name, designation, patient..."
          />
          <Button onClick={handleAddClick} variant="primary" icon={<Plus size={18} />}>
            Add Specialist
          </Button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>Loading therapists directory & clinical roster...</div>
      ) : filteredPhysios.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No Therapists Found" : "No Physiotherapists Logged"}
          description={searchQuery ? `No therapist matches "${searchQuery}". Try a different name or clear search.` : "Register the first therapist to enable treatment plans and session tracking."}
          icon={Users}
          actionLabel="Add Specialist"
          onAction={handleAddClick}
          actionIcon={<Plus size={16} />}
        />
      ) : (
        <div className={styles.grid}>
          {filteredPhysios.map((p) => {
            const physioNotes = notesMap[p.id] || [];
            const unreadNotes = physioNotes.filter((n) => !n.is_read);
            const latestNote = physioNotes.length > 0 ? physioNotes[0] : null;

            const primaryAssignments = (metrics.allAssignments || []).filter((a) => a.physio_id === p.id);
            const activePrimaryPatients = primaryAssignments
              .filter((a) => a.is_active && a.patients)
              .map((a) => a.patients);

            const sessionsTook = (metrics.allSessions || []).filter((s) => s.physio_id === p.id);
            const revenueAccrued = sessionsTook.reduce((acc, s) => acc + Number(s.cost || 0), 0);

            let workloadBadge = 'Optimal Load';
            let workloadVariant = 'success';
            if (activePrimaryPatients.length >= 5) {
              workloadBadge = 'Heavy Load';
              workloadVariant = 'warning';
            } else if (activePrimaryPatients.length === 0) {
              workloadBadge = 'Available';
              workloadVariant = 'secondary';
            }

            return (
              <Card
                key={p.id}
                title={p.name}
                subtitle={p.designation || 'Physical Therapy Specialist'}
                className="glass-panel"
                extra={
                  <div className={styles.cardHeaderExtra}>
                    <Badge variant={workloadVariant}>{workloadBadge}</Badge>
                    <div className={styles.actionBtnsGroup}>
                      <button
                        type="button"
                        className={styles.editBtn}
                        onClick={() => handleEditClick(p)}
                        title="Edit profile"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteClick(p)}
                        title="Delete therapist"
                        disabled={checkingAssignments}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                }
              >
                <div className={styles.cardBody}>
                  {/* Contact Info Line */}
                  <div className={styles.infoLine}>
                    <Phone size={13} className={styles.infoIcon} />
                    <span>{p.phone || 'No Phone Recorded'}</span>
                  </div>

                  {/* Notes Notification Box */}
                  <div className={styles.notesBox}>
                    <div className={styles.notesHeader}>
                      <span className={styles.notesTitle}>
                        <Bell size={12} style={{ color: unreadNotes.length > 0 ? 'var(--warning)' : 'var(--text-secondary)' }} />
                        Notes ({unreadNotes.length} New)
                      </span>
                      <button
                        className={styles.historyBtn}
                        onClick={() => setSelectedPhysioForNotes(p)}
                      >
                        History ({physioNotes.length})
                      </button>
                    </div>

                    {latestNote ? (
                      <div className={styles.latestNoteItem}>
                        <div className={styles.noteTopRow}>
                          <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
                            {latestNote.priority ? latestNote.priority.toUpperCase() : 'NOTE'}
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {formatDateTime(latestNote.created_at)}
                          </span>
                        </div>
                        <p className={styles.noteText}>{latestNote.note_text}</p>
                        {!latestNote.is_read && (
                          <button
                            className={styles.readBtn}
                            onClick={() => handleMarkRead(p.id, latestNote.id)}
                          >
                            <CheckCircle size={11} /> Mark Read
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className={styles.noNotes}>No active instructions logged.</p>
                    )}
                  </div>

                  {/* Metrics Bar */}
                  <div className={styles.metricsGrid}>
                    <div className={styles.metricCol}>
                      <span className={styles.metricVal}>{primaryAssignments.length}</span>
                      <span className={styles.metricLabel}>Cases</span>
                    </div>
                    <div className={styles.metricCol}>
                      <span className={styles.metricVal}>{sessionsTook.length}</span>
                      <span className={styles.metricLabel}>Sessions</span>
                    </div>
                    <div className={styles.metricCol}>
                      {isRevenueUnlocked ? (
                        <span className={styles.revenueVal}>₹{revenueAccrued.toFixed(0)}</span>
                      ) : (
                        <span className={styles.maskedVal} onClick={() => setIsUnlockModalOpen(true)}>
                          <Lock size={10} /> Masked
                        </span>
                      )}
                      <span className={styles.metricLabel}>Revenue</span>
                    </div>
                  </div>

                  {/* Active Primary Patients Roster */}
                  <div className={styles.rosterSection}>
                    <span className={styles.rosterHeader}>Active Roster ({activePrimaryPatients.length})</span>
                    {activePrimaryPatients.length === 0 ? (
                      <p className={styles.emptyRoster}>No active primary patients assigned.</p>
                    ) : (
                      <div className={styles.rosterList}>
                        {activePrimaryPatients.map((pat) => (
                          <div key={pat.id} className={styles.rosterItem}>
                            <span className={styles.patName}>{pat.first_name} {pat.surname || ''}</span>
                            <span className={styles.patCode}>{pat.patient_code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const inlineStyles = {
  warningBox: {
    backgroundColor: 'var(--danger-light)',
    border: '1px solid var(--danger)',
    color: 'var(--danger)',
    padding: 'var(--space-md)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-xs)',
    lineHeight: '1.5'
  }
};

export default PhysioDirectoryPage;
