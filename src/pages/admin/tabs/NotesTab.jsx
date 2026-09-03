import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { useToast } from '../../../hooks/useToast';
import { notesService } from '../../../services/notesService';
import { FileText, Send, User, AlertCircle, CheckCircle, Bell } from 'lucide-react';

export const NotesTab = ({ physios = [], onNoteCreated }) => {
  const [selectedPhysioId, setSelectedPhysioId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [priority, setPriority] = useState('normal'); // 'normal' | 'high' | 'urgent'
  const [author, setAuthor] = useState('Admin Desk');
  const [sending, setSending] = useState(false);

  const toast = useToast();

  const handleDispatchNote = async (e) => {
    e.preventDefault();
    if (!selectedPhysioId) {
      toast.error('Please select a physiotherapist to assign the note to.');
      return;
    }
    if (!noteText.trim()) {
      toast.error('Please enter the clinical instruction / note content.');
      return;
    }

    const selectedPhysio = physios.find((p) => (p.id || p.physio_id) === selectedPhysioId);
    const physioName = selectedPhysio ? (selectedPhysio.name || selectedPhysio.first_name) : 'Specialist';

    setSending(true);
    try {
      const { data, error } = await notesService.addNote({
        physioId: selectedPhysioId,
        physioName,
        noteText: noteText.trim(),
        priority,
        author: author.trim() || 'Admin Desk'
      });

      if (error) throw error;

      toast.success(`Clinical instruction dispatched to ${physioName}'s roster!`);
      setNoteText('');
      
      if (onNoteCreated) {
        onNoteCreated();
      }
    } catch (err) {
      console.error('Note dispatch error:', err);
      toast.error(`Failed to dispatch note: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const physioOptions = physios.map((p) => ({
    value: p.id || p.physio_id,
    label: `${p.name || `${p.first_name} ${p.surname || ''}`} (${p.designation || 'Physiotherapist'})`
  }));

  return (
    <div style={styles.container}>
      <Card
        title="📝 Clinical Notes & Notification Dispatcher"
        subtitle="Write clinical instructions, schedule updates, or special patient notes directly to a physiotherapist's roster view."
        className="glass-panel"
      >
        <form onSubmit={handleDispatchNote} style={styles.form}>
          <Select
            label="Select Target Physiotherapist"
            value={selectedPhysioId}
            onChange={(e) => setSelectedPhysioId(e.target.value)}
            options={[
              { value: '', label: '-- Select Physiotherapist --' },
              ...physioOptions
            ]}
          />

          <div style={styles.rowTwo}>
            <Select
              label="Priority Level"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: 'normal', label: '🔵 Normal Instruction' },
                { value: 'high', label: '🟡 High Priority Alert' },
                { value: 'urgent', label: '🔴 Urgent / Urgent Care Notice' }
              ]}
            />

            <Input
              label="Sender Title / Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Admin Desk / Dr. Head"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Clinical Note / Instructions Content *</label>
            <textarea
              rows={4}
              placeholder="Type clinical notes, schedule changes, or patient precautions here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              style={styles.textArea}
              required
            />
          </div>

          <div style={styles.actionRow}>
            <Button type="submit" variant="primary" loading={sending} size="md">
              <Send size={16} style={{ marginRight: 6 }} /> Dispatch Note to Therapist
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    maxWidth: '800px',
    margin: '0 auto'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  },
  rowTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-md)'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)'
  },
  label: {
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  textArea: {
    width: '100%',
    padding: '0.6rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: 'var(--text-sm)',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.5'
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 'var(--space-xs)'
  }
};

export default NotesTab;
