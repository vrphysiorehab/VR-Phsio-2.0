import { supabase } from '../lib/supabaseClient';

export const storageService = {
  /**
   * Uploads a PDF blob to the 'pdfs' storage bucket.
   * @param {string} path - The path inside the bucket (e.g. 'VR-123456/registration.pdf')
   * @param {Blob} blob - The PDF file blob
   */
  async uploadPdf(path, blob) {
    const { data, error } = await supabase.storage
      .from('pdfs')
      .upload(path, blob, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading PDF to storage:', error);
      return { data: null, error };
    }

    // Retrieve the public URL
    const { data: publicUrlData } = supabase.storage
      .from('pdfs')
      .getPublicUrl(path);

    return { 
      data: { 
        path: data.path,
        publicUrl: publicUrlData?.publicUrl 
      }, 
      error: null 
    };
  }
};
