import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'vr_physio_therapist_notes_v1';

export const notesService = {
  /**
   * Helper to fetch notes from localStorage
   */
  getLocalNotes() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error reading notes from localStorage:', e);
      return [];
    }
  },

  /**
   * Helper to save notes to localStorage
   */
  saveLocalNotes(notes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Error saving notes to localStorage:', e);
    }
  },

  /**
   * Get all notes for a specific physiotherapist
   */
  async getNotesForPhysio(physioId) {
    const allNotes = this.getLocalNotes();
    const physioNotes = allNotes
      .filter((n) => n.physio_id === physioId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { data: physioNotes, error: null };
  },

  /**
   * Get unread count map for all physiotherapists
   */
  getUnreadCountMap() {
    const allNotes = this.getLocalNotes();
    const map = {};
    allNotes.forEach((n) => {
      if (!n.is_read) {
        map[n.physio_id] = (map[n.physio_id] || 0) + 1;
      }
    });
    return map;
  },

  /**
   * Add a new note for a physiotherapist
   */
  async addNote({ physioId, physioName, noteText, priority = 'normal', author = 'Admin Desk' }) {
    const newNote = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      physio_id: physioId,
      physio_name: physioName,
      note_text: noteText,
      priority, // 'normal' | 'high' | 'urgent'
      author,
      is_read: false,
      created_at: new Date().toISOString()
    };

    // Try Supabase insert first
    try {
      const { data, error } = await supabase
        .from('therapist_notes')
        .insert([newNote])
        .select();

      if (!error && data) {
        // Also sync local
        const local = this.getLocalNotes();
        this.saveLocalNotes([newNote, ...local]);
        return { data: data[0], error: null };
      }
    } catch (e) {
      // Fallback
    }

    const local = this.getLocalNotes();
    const updated = [newNote, ...local];
    this.saveLocalNotes(updated);
    return { data: newNote, error: null };
  },

  /**
   * Mark a note as read
   */
  async markAsRead(noteId) {
    try {
      await supabase
        .from('therapist_notes')
        .update({ is_read: true })
        .eq('id', noteId);
    } catch (e) {
      // silent
    }

    const local = this.getLocalNotes();
    const updated = local.map((n) => (n.id === noteId ? { ...n, is_read: true } : n));
    this.saveLocalNotes(updated);
    return { success: true };
  },

  /**
   * Mark all notes for a physio as read
   */
  markAllAsReadForPhysio(physioId) {
    const local = this.getLocalNotes();
    const updated = local.map((n) => (n.physio_id === physioId ? { ...n, is_read: true } : n));
    this.saveLocalNotes(updated);
    return { success: true };
  }
};

export default notesService;
