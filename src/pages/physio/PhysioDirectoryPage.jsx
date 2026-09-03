import React, { useState, useEffect } from 'react';
import { User, Users, Plus, Edit2, Trash2, Phone, Award, Briefcase, Search, Bell, Lock, CheckCircle, Clock, Calendar, ShieldAlert, FileText, UserCheck, ShieldCheck, Camera } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import SearchBar from '../../components/ui/SearchBar';
import EmptyState from '../../components/ui/EmptyState';
import ClinicalNotesModal from '../admin/components/ClinicalNotesModal';
import RevenueAuthModal from '../admin/components/RevenueAuthModal';
import PhysioProfileWizardModal from './components/PhysioProfileWizardModal';
import PhysioProfileDrawer from './components/PhysioProfileDrawer';

import { useToast } from '../../hooks/useToast';
import { physiosService } from '../../services/physiosService';
import { notesService } from '../../services/notesService';
import { physioProfileService } from '../../services/physioProfileService';
import { useAdminMetrics } from '../../hooks/useAdminMetrics';
import { formatDate, formatDateTime } from '../../utils/dateHelpers';
import PhysioForm from './PhysioForm';
import styles from './PhysioDirectoryPage.module.css';

export const PhysioDirectoryPage = ({ isAdminView = false }) => {
  const [physios, setPhysios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'profiles'
  
  // Profiles Data Map & Compliance Audits Map
  const [profilesMap, setProfilesMap] = useState({});
  const [auditsMap, setAuditsMap] = useState({});

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPhysio, setEditingPhysio] = useState(null);
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [targetWizardPhysio, setTargetWizardPhysio] = useState(null);

  // Drawer state
  const [selectedDrawerPhysio, setSelectedDrawerPhysio] = useState(null);
  const [pendingDrawerPhysio, setPendingDrawerPhysio] = useState(null);

  const handleOpenVaultDrawer = (physio) => {
    if (isRevenueUnlocked) {
      setSelectedDrawerPhysio(physio);
    } else {
      setPendingDrawerPhysio(physio);
      setIsUnlockModalOpen(true);
    }
  };

  const handleUnlockSuccess = () => {
    setIsRevenueUnlocked(true);
    if (pendingDrawerPhysio) {
      setSelectedDrawerPhysio(pendingDrawerPhysio);
      setPendingDrawerPhysio(null);
    }
  };
  
  // Delete handling state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetPhysio, setTargetPhysio] = useState(null);
  const [activeCasesCount, setActiveCasesCount] = useState(0);

  // Notes & Restricted Access state
  const [notesMap, setNotesMap] = useState({});
  const [selectedPhysioForNotes, setSelectedPhysioForNotes] = useState(null);
  const [isRevenueUnlocked, setIsRevenueUnlocked] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [masterPin, setMasterPin] = useState(() => localStorage.getItem('vr_physio_master_pin') || '1234');

  const toast = useToast();
  const metrics = useAdminMetrics();

  const loadPhysiosData = async () => {
    setLoading(true);
    try {
      const { data, error } = await physiosService.getPhysios();
      if (error) throw error;
      const physioList = data || [];
      setPhysios(physioList);

      // Load 59-field profiles & notes for each physio
      const pMap = {};
      const aMap = {};
      const nMap = {};

      for (const p of physioList) {
        const { data: prof } = await physioProfileService.getProfile(p.id);
        pMap[p.id] = prof || {};
        aMap[p.id] = physioProfileService.getComplianceAudit(prof, p);

        const { data: nData } = await notesService.getNotesForPhysio(p.id);
        nMap[p.id] = nData || [];
      }

      setProfilesMap(pMap);
      setAuditsMap(aMap);
      setNotesMap(nMap);
    } catch (err) {
      console.error('Error loading therapists:', err);
      toast.error('Failed to load physiotherapists directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhysiosData();
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

  const handleOpenWizard = (physio) => {
    setTargetWizardPhysio(physio);
    setShowWizardModal(true);
  };

  const handleSaveWizardProfile = async (formData, closeModal = true) => {
    if (!targetWizardPhysio) return;
    setMutating(true);
    try {
      const { error } = await physioProfileService.saveProfile(targetWizardPhysio.id, formData);
      if (error) throw error;

      toast.success(`Profile for ${targetWizardPhysio.name} saved successfully!`);
      if (closeModal) {
        setShowWizardModal(false);
      }
      loadPhysiosData();
    } catch (err) {
      console.error('Error saving wizard profile:', err);
      toast.error(`Failed to save profile: ${err.message}`);
    } finally {
      setMutating(false);
    }
  };

  const handleVerifyProfile = async (physioId, newStatus) => {
    setMutating(true);
    try {
      const current = profilesMap[physioId] || {};
      const updated = { ...current, admin_verification_status: newStatus };
      await physioProfileService.saveProfile(physioId, updated);
      toast.success(`Verification status updated to ${newStatus === 'verified' ? 'Verified' : 'Pending Audit'}.`);
      loadPhysiosData();
    } catch (e) {
      toast.error('Failed to update verification status.');
    } finally {
      setMutating(false);
    }
  };

  const handleDeleteClick = async (physio) => {
    setTargetPhysio(physio);
    try {
      const { data: count } = await physiosService.getActiveAssignmentsCount(physio.id);
      setActiveCasesCount(count || 0);
      setShowDeleteModal(true);
    } catch (err) {
      toast.error('Failed to check active cases.');
    }
  };

  const handleFormSubmit = async (formData) => {
    setMutating(true);
    try {
      if (editingPhysio) {
        const { error } = await physiosService.updatePhysio(editingPhysio.id, formData);
        if (error) throw error;
        toast.success(`Profile for ${formData.name} updated.`);
      } else {
        const { error } = await physiosService.createPhysio(formData);
        if (error) throw error;
        toast.success(`${formData.name} added to directory.`);
      }
      setShowFormModal(false);
      loadPhysiosData();
      metrics.refresh();
    } catch (err) {
      toast.error(`Operation failed: ${err.message}`);
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
      toast.success(`${targetPhysio.name} removed from directory.`);
      setShowDeleteModal(false);
      loadPhysiosData();
      metrics.refresh();
    } catch (err) {
      toast.error(`Failed to delete therapist: ${err.message}`);
    } finally {
      setMutating(false);
      setTargetPhysio(null);
    }
  };

  // Compute total pending compliance alerts
  const totalPendingVerification = Object.values(auditsMap).filter((a) => !a?.isVerified).length;
  const totalIncompleteProfiles = Object.values(auditsMap).filter((a) => a?.pendingCount > 0).length;

  // Filter therapists by search query
  const filteredPhysios = physios.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (p.name || '').toLowerCase();
    const desig = (p.designation || '').toLowerCase();
    const phone = (p.phone || '').toLowerCase();
    const prof = profilesMap[p.id] || {};
    const spec = (prof.specialization || '').toLowerCase();
    const regNo = (prof.reg_number || '').toLowerCase();

    return name.includes(q) || desig.includes(q) || phone.includes(q) || spec.includes(q) || regNo.includes(q);
  });

  return (
    <div className={styles.container}>
      {/* Revenue / Security PIN Modal */}
      <RevenueAuthModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onUnlock={handleUnlockSuccess}
        currentPin={masterPin}
        onUpdatePin={(newPin) => {
          setMasterPin(newPin);
          localStorage.setItem('vr_physio_master_pin', newPin);
          toast.success('Master Security PIN updated.');
        }}
      />

      {/* 59-Field Enrollment Wizard Modal */}
      {targetWizardPhysio && (
        <PhysioProfileWizardModal
          isOpen={showWizardModal}
          onClose={() => setShowWizardModal(false)}
          physio={targetWizardPhysio}
          profileData={profilesMap[targetWizardPhysio.id]}
          onSave={handleSaveWizardProfile}
          mutating={mutating}
        />
      )}

      {/* 360° Profile Drawer Modal */}
      {selectedDrawerPhysio && (
        <PhysioProfileDrawer
          isOpen={!!selectedDrawerPhysio}
          onClose={() => setSelectedDrawerPhysio(null)}
          physio={selectedDrawerPhysio}
          profileData={profilesMap[selectedDrawerPhysio.id]}
          isRevenueUnlocked={isRevenueUnlocked}
          onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
          onVerifyProfile={isAdminView ? handleVerifyProfile : null}
          isAdminView={isAdminView}
        />
      )}

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

      {/* Basic Form Modal */}
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

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !mutating && setShowDeleteModal(false)}
        title="Confirm Therapist Removal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete} loading={mutating}>Confirm Delete</Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
          Are you sure you want to delete <strong>{targetPhysio?.name}</strong>?
          {activeCasesCount > 0 && <span style={{ color: 'var(--danger)', display: 'block', marginTop: '6px' }}>⚠️ Assigned to {activeCasesCount} active cases.</span>}
        </p>
      </Modal>

      {/* Page Title & Main Toolbar */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>🩺 Therapists Details & Compliance Vault</h2>
          <p className={styles.subtitle}>Complete 59-field enrollment, photograph repository, roster workload, and audit verification.</p>
        </div>

        <div className={styles.headerActions}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search name, specialization, phone, reg no..."
          />
          <Button onClick={handleAddClick} variant="primary" icon={<Plus size={18} />}>
            Add Specialist
          </Button>
        </div>
      </div>

      {/* Compliance Warning Alerts Bar */}
      {(totalPendingVerification > 0 || totalIncompleteProfiles > 0) && (
        <div className={styles.alertsBar}>
          <ShieldAlert size={18} style={{ color: 'var(--warning)' }} />
          <div>
            <strong>⚠️ Compliance Audit Alerts:</strong> {totalIncompleteProfiles} profile(s) have missing mandatory documents. {totalPendingVerification} therapist(s) pending Head Audit verification.
          </div>
        </div>
      )}

      {/* View Mode Navigation Tabs */}
      <div className={styles.viewModeTabs}>
        <button
          className={activeTab === 'roster' ? styles.activeModeBtn : styles.modeBtn}
          onClick={() => setActiveTab('roster')}
        >
          🩺 Roster & Clinical Stream
        </button>
        <button
          className={activeTab === 'profiles' ? styles.activeModeBtn : styles.modeBtn}
          onClick={() => setActiveTab('profiles')}
        >
          📋 59-Field Enrollment & Verification Vault ({physios.length})
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingState}>Loading therapists directory & clinical roster...</div>
      ) : filteredPhysios.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No Therapists Found" : "No Physiotherapists Logged"}
          description={searchQuery ? `No therapist matches "${searchQuery}".` : "Register the first therapist to enable treatment plans."}
          icon={Users}
          actionLabel="Add Specialist"
          onAction={handleAddClick}
        />
      ) : (
        <div className={styles.grid}>
          {filteredPhysios.map((p) => {
            const prof = profilesMap[p.id] || {};
            const audit = auditsMap[p.id] || { missing: [], isVerified: false };
            const physioNotes = notesMap[p.id] || [];
            const unreadNotes = physioNotes.filter((n) => !n.is_read);
            const latestNote = physioNotes.length > 0 ? physioNotes[0] : null;

            const photoUrl = prof.photo_url || p.photo_url;
            const primaryAssignments = (metrics.allAssignments || []).filter((a) => a.physio_id === p.id);
            const activePrimaryPatients = primaryAssignments.filter((a) => a.is_active && a.patients).map((a) => a.patients);
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
              <Card key={p.id} className="glass-panel" style={{ padding: 0 }}>
                <div className={styles.cardHeaderBanner}>
                  {/* Perfectly Aligned Photograph */}
                  <div className={styles.photoAvatarFrame}>
                    {photoUrl ? (
                      <img src={photoUrl} alt={p.name} className={styles.photoAvatarImg} />
                    ) : (
                      <User size={36} style={{ color: 'var(--primary)' }} />
                    )}
                  </div>

                  <div className={styles.cardTitleCol}>
                    <div className={styles.nameRow}>
                      <h3 className={styles.therapistName}>{p.name}</h3>
                      <div className={styles.badgeRow}>
                        <Badge variant={audit.isVerified ? 'success' : 'warning'}>
                          {audit.isVerified ? '✅ Verified' : '🟡 Audit Pending'}
                        </Badge>
                      </div>
                    </div>

                    <p className={styles.therapistDesig}>{prof.designation || p.designation || 'Physiotherapist'}</p>
                    <span className={styles.specializationTag}>{prof.specialization || 'General Physical Therapy'}</span>
                  </div>

                  <div className={styles.cardActionsGroup}>
                    <button className={styles.iconBtn} onClick={() => handleEditClick(p)} title="Edit profile"><Edit2 size={13} /></button>
                    <button className={styles.iconBtn} onClick={() => handleDeleteClick(p)} title="Delete therapist"><Trash2 size={13} /></button>
                  </div>
                </div>

                <div className={styles.cardInnerBody}>
                  {/* Compliance Warning Badge if incomplete */}
                  {!audit.isComplete && (
                    <div className={styles.incompleteBadge}>
                      ⚠️ Incomplete Profile ({audit.pendingCount} Pending Docs: {audit.missing.slice(0, 2).join(', ')})
                    </div>
                  )}

                  {/* TAB A: ROSTER VIEW */}
                  {activeTab === 'roster' ? (
                    <>
                      {/* Clinical Notes Notification Box */}
                      <div className={styles.notesBox}>
                        <div className={styles.notesHeader}>
                          <span className={styles.notesTitle}>
                            <Bell size={12} style={{ color: unreadNotes.length > 0 ? 'var(--warning)' : 'var(--text-secondary)' }} />
                            Notes ({unreadNotes.length} New)
                          </span>
                          <button className={styles.historyBtn} onClick={() => setSelectedPhysioForNotes(p)}>
                            History ({physioNotes.length})
                          </button>
                        </div>

                        {latestNote ? (
                          <div className={styles.latestNoteItem}>
                            <div className={styles.noteTopRow}>
                              <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
                                {latestNote.priority ? latestNote.priority.toUpperCase() : 'NOTE'}
                              </span>
                              <span style={{ color: 'var(--text-muted)' }}>{formatDateTime(latestNote.created_at)}</span>
                            </div>
                            <p className={styles.noteText}>{latestNote.note_text}</p>
                            {!latestNote.is_read && (
                              <button className={styles.readBtn} onClick={() => handleMarkRead(p.id, latestNote.id)}>
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

                      {/* Active Roster */}
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
                    </>
                  ) : (
                    /* TAB B: 59-FIELD PROFILES VIEW */
                    <div className={styles.profileDetailsSummary}>
                      <div className={styles.detailRow}>
                        <span className={styles.dLabel}>Mobile:</span>
                        <span className={styles.dVal}>{p.phone || prof.phone || 'N/A'}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.dLabel}>Reg Council No:</span>
                        <span className={styles.dVal}>{prof.reg_number || 'Pending'}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.dLabel}>Experience:</span>
                        <span className={styles.dVal}>{prof.total_experience ? `${prof.total_experience} Years` : 'N/A'}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.dLabel}>Shift Timings:</span>
                        <span className={styles.dVal}>{prof.working_hours || '09:00 AM - 05:00 PM'}</span>
                      </div>

                      <div className={styles.wizardBtnRow}>
                        <Button size="sm" variant="primary" onClick={() => handleOpenWizard(p)}>
                          <FileText size={13} style={{ marginRight: 4 }} /> Edit Profile Progress
                        </Button>
                        {isAdminView && (
                          <Button size="sm" variant="outline" onClick={() => handleOpenVaultDrawer(p)}>
                            <UserCheck size={13} style={{ marginRight: 4 }} /> View Vault & Docs
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PhysioDirectoryPage;
