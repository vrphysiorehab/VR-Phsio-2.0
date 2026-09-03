import { supabase } from '../lib/supabaseClient';

export const whatsappService = {
  /**
   * Cleans and formats a phone number to standard international format (e.g. 917794921287)
   */
  formatPhoneNumber(phoneStr) {
    if (!phoneStr) return '';
    // Strip everything except numbers
    let cleaned = phoneStr.replace(/\D/g, '');
    // Default to India country code 91 if 10 digits
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    return cleaned;
  },

  /**
   * Generates a pre-filled WhatsApp web link for 1-click direct dispatch
   */
  generateWhatsAppLink({ phone, patientName, patientCode, docType, pdfPublicUrl, customMessage, invoiceNumber, totalCost }) {
    const formattedPhone = this.formatPhoneNumber(phone);
    
    let message = `*VR Physio Rehab Pvt. Ltd. - Clinical Updates*\n\n`;
    message += `Dear *${patientName}* (Code: ${patientCode}),\n\n`;

    if (customMessage && customMessage.trim()) {
      message += `${customMessage.trim()}\n\n`;
    }

    if (docType === 'treatment' || docType === 'both') {
      message += `📋 *Treatment Case Report* is compiled and ready for your records.\n`;
    }

    if (docType === 'bill' || docType === 'both') {
      message += `💳 *Billing Statement*`;
      if (invoiceNumber) message += ` (${invoiceNumber})`;
      if (totalCost !== undefined) message += ` - Total: ₹${Number(totalCost).toFixed(2)}`;
      message += `\n`;
    }

    if (pdfPublicUrl) {
      message += `\n📄 *View/Download Official PDF Document:* ${pdfPublicUrl}\n`;
    }

    message += `\nFor any queries or Home Exercise Plan guidance, feel free to contact us:\n`;
    message += `📞 +91 77949 21287 | 🌐 www.vrphysiorehab.com\n`;
    message += `_Thank you for choosing VR Physio Rehab!_`;

    const encodedText = encodeURIComponent(message);
    
    // Web WhatsApp / API WhatsApp launch link
    const waUrl = formattedPhone 
      ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    return { waUrl, message };
  },

  /**
   * Direct Web WhatsApp trigger
   */
  dispatchDirectWhatsApp(options) {
    const { waUrl } = this.generateWhatsAppLink(options);
    window.open(waUrl, '_blank');
    return { success: true };
  },

  /**
   * Meta WhatsApp Cloud API Hook Placeholder
   * When user populates VITE_WHATSAPP_API_KEY and VITE_WHATSAPP_PHONE_ID or uses Supabase function
   */
  async sendWhatsAppViaApi({ phone, patientName, patientCode, docType, pdfPublicUrl, customMessage }) {
    const formattedPhone = this.formatPhoneNumber(phone);
    const apiKey = import.meta.env.VITE_WHATSAPP_API_KEY || '';
    const phoneId = import.meta.env.VITE_WHATSAPP_PHONE_ID || '';

    // If Supabase function exists
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: formattedPhone,
          patientName,
          patientCode,
          docType,
          pdfUrl: pdfPublicUrl,
          message: customMessage
        }
      });
      if (!error) return { success: true, data };
    } catch (e) {
      console.log('Supabase send-whatsapp function not deployed, falling back to direct Web WhatsApp mode.');
    }

    // Direct Web WhatsApp dispatch as reliable fallback
    return this.dispatchDirectWhatsApp({ phone, patientName, patientCode, docType, pdfPublicUrl, customMessage });
  }
};

export default whatsappService;
