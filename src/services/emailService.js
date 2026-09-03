import { supabase } from '../lib/supabaseClient';

export const emailService = {
  /**
   * Helper function to convert a Blob to base64 string
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  /**
   * Sends the intake confirmation and signed policy document to the patient's email.
   */
  async sendIntakeEmail(recipientEmail, patientCode, fullName, pdfBlob) {
    if (!recipientEmail) {
      console.warn("Skipping intake email: no email address provided for patient.");
      return { success: false, error: "No email address registered" };
    }

    try {
      const base64Pdf = await this.blobToBase64(pdfBlob);
      
      const subject = `Registration Successful - VR Physio Rehab Pvt. Ltd. [Code: ${patientCode}]`;
      const bodyText = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #ca9f42; margin-top: 0;">Welcome to VR Physio Rehab</h2>
          <p>Dear <strong>${fullName}</strong>,</p>
          <p>Thank you for registering with us. Your unique patient code is: <strong style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #ca9f42;">${patientCode}</strong>.</p>
          <p>We have successfully compiled your clinical intake details and signed clinic policy. Your copy of the signed forms is attached to this email as a PDF for your personal archives.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            Aditya Ellen Plaza, Femcity Hospital, Shaikpet Rd, Hyderabad - 500096<br/>
            Contact: +91 77949 21287 | vrphysiorehab.com
          </p>
        </div>
      `;

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipientEmail,
          subject: subject,
          bodyText: bodyText,
          pdfBase64: base64Pdf,
          filename: `intake-form-${patientCode}.pdf`
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error("Error invoking send-email for intake form:", err);
      return { success: false, error: err.message || err };
    }
  },

  /**
   * Sends the settled receipt or invoice to the patient's email.
   */
  async sendInvoiceEmail(recipientEmail, patientCode, fullName, invoiceNumber, totalCost, pdfBlob) {
    if (!recipientEmail) {
      console.warn("Skipping invoice email: no email address provided for patient.");
      return { success: false, error: "No email address registered" };
    }

    try {
      const base64Pdf = await this.blobToBase64(pdfBlob);
      
      const subject = `Payment Invoice Receipt - ${invoiceNumber} [VR Physio Rehab]`;
      const bodyText = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #ca9f42; margin-top: 0;">Payment Receipt Settlement</h2>
          <p>Dear <strong>${fullName}</strong>,</p>
          <p>We are pleased to inform you that your physical therapy care invoice has been successfully settled.</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px dashed #e2e8f0; margin: 15px 0;">
            <p style="margin: 0 0 5px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p style="margin: 0 0 5px 0;"><strong>Patient Code:</strong> ${patientCode}</p>
            <p style="margin: 0;"><strong>Total Cleared Amount:</strong> ₹${Number(totalCost).toFixed(2)}</p>
          </div>
          <p>Please find attached your comprehensive ledger receipt and settled billing statement as a PDF.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            Aditya Ellen Plaza, Femcity Hospital, Shaikpet Rd, Hyderabad - 500096<br/>
            Contact: +91 77949 21287 | vrphysiorehab.com
          </p>
        </div>
      `;

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipientEmail,
          subject: subject,
          bodyText: bodyText,
          pdfBase64: base64Pdf,
          filename: `${invoiceNumber}.pdf`
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error("Error invoking send-email for invoice receipt:", err);
      return { success: false, error: err.message || err };
    }
  },

  async sendReportAndBillEmails({ recipientEmail, patientCode, fullName, emailType, treatmentPdfBlob, billPdfBlob, invoiceNumber, totalCost }) {
    const results = [];
    const subject = `VR Physio Rehab: Important Documents Regarding Your Treatment Report and Billing Invoice`;

    if (emailType === 'both') {
      try {
        const treatmentBase64 = await this.blobToBase64(treatmentPdfBlob);
        const billBase64 = await this.blobToBase64(billPdfBlob);

        const bodyText = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <p>Dear <strong>${fullName}</strong>,</p>
            <p>We hope this email finds you well and that you are progressing smoothly in your recovery.</p>
            <p>Please find attached the official documentation regarding your recent therapy sessions at VR Physio Rehab:</p>
            <ul style="padding-left: 20px; margin: 10px 0;">
              <li style="margin-bottom: 8px;">
                <strong>Treatment Report:</strong> A comprehensive summary detailing your attended sessions, progress, and specific therapies performed.
              </li>
              <li style="margin-bottom: 8px;">
                <strong>Billing Statement:</strong> A clear breakdown of the session charges and current payment status.
              </li>
            </ul>
            <h3 style="color: #ca9f42; margin-top: 20px; font-size: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">Additional Support & Care</h3>
            <p>If you require a customized Home Exercise Plan, guidance on your Diet & Nutrition Plan, or have any questions about your treatment or billing, please feel free to reach out to our team:</p>
            <p style="margin: 5px 0;"><strong>Phone / WhatsApp:</strong> +91 77949 21287</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> vrphysiorehab@gmail.com</p>
            <p style="margin-top: 20px;">Thank you for choosing VR Physio Rehab. We remain dedicated to supporting your health and recovery journey.</p>
            <p style="margin-top: 25px; margin-bottom: 0;">Warm regards,</p>
            <p style="margin: 0; font-weight: bold; color: #090d16;">VR Physio Rehab Team</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #4b5563;">
              📞 +91 77949 21287<br/>
              ✉️ vrphysiorehab@gmail.com | 🌐 www.vrphysiorehab.com
            </p>
          </div>
        `;

        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            to: recipientEmail,
            subject,
            bodyText,
            attachments: [
              {
                filename: `treatment-report-${patientCode}.pdf`,
                pdfBase64: treatmentBase64
              },
              {
                filename: `bill-report-${patientCode}.pdf`,
                pdfBase64: billBase64
              }
            ]
          }
        });

        if (error) throw error;
        results.push({ success: true, type: 'both' });
      } catch (err) {
        console.error("Error sending both reports email:", err);
        results.push({ success: false, type: 'both', error: err.message });
      }
    } else if (emailType === 'treatment') {
      try {
        const base64Pdf = await this.blobToBase64(treatmentPdfBlob);
        const bodyText = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <p>Dear <strong>${fullName}</strong>,</p>
            <p>We hope this email finds you well and that you are progressing smoothly in your recovery.</p>
            <p>Please find attached the official documentation regarding your recent therapy sessions at VR Physio Rehab:</p>
            <ul style="padding-left: 20px; margin: 10px 0;">
              <li style="margin-bottom: 8px;">
                <strong>Treatment Report:</strong> A comprehensive summary detailing your attended sessions, progress, and specific therapies performed.
              </li>
            </ul>
            <h3 style="color: #ca9f42; margin-top: 20px; font-size: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">Additional Support & Care</h3>
            <p>If you require a customized Home Exercise Plan, guidance on your Diet & Nutrition Plan, or have any questions about your treatment or billing, please feel free to reach out to our team:</p>
            <p style="margin: 5px 0;"><strong>Phone / WhatsApp:</strong> +91 77949 21287</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> vrphysiorehab@gmail.com</p>
            <p style="margin-top: 20px;">Thank you for choosing VR Physio Rehab. We remain dedicated to supporting your health and recovery journey.</p>
            <p style="margin-top: 25px; margin-bottom: 0;">Warm regards,</p>
            <p style="margin: 0; font-weight: bold; color: #090d16;">VR Physio Rehab Team</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #4b5563;">
              📞 +91 77949 21287<br/>
              ✉️ vrphysiorehab@gmail.com | 🌐 www.vrphysiorehab.com
            </p>
          </div>
        `;
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            to: recipientEmail,
            subject,
            bodyText,
            pdfBase64: base64Pdf,
            filename: `treatment-report-${patientCode}.pdf`
          }
        });
        if (error) throw error;
        results.push({ success: true, type: 'treatment' });
      } catch (err) {
        console.error("Error sending treatment report email:", err);
        results.push({ success: false, type: 'treatment', error: err.message });
      }
    } else if (emailType === 'bill') {
      try {
        const base64Pdf = await this.blobToBase64(billPdfBlob);
        const bodyText = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <p>Dear <strong>${fullName}</strong>,</p>
            <p>We hope this email finds you well and that you are progressing smoothly in your recovery.</p>
            <p>Please find attached the official documentation regarding your recent therapy sessions at VR Physio Rehab:</p>
            <ul style="padding-left: 20px; margin: 10px 0;">
              <li style="margin-bottom: 8px;">
                <strong>Billing Statement:</strong> A clear breakdown of the session charges and current payment status.
              </li>
            </ul>
            <h3 style="color: #ca9f42; margin-top: 20px; font-size: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">Additional Support & Care</h3>
            <p>If you require a customized Home Exercise Plan, guidance on your Diet & Nutrition Plan, or have any questions about your treatment or billing, please feel free to reach out to our team:</p>
            <p style="margin: 5px 0;"><strong>Phone / WhatsApp:</strong> +91 77949 21287</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> vrphysiorehab@gmail.com</p>
            <p style="margin-top: 20px;">Thank you for choosing VR Physio Rehab. We remain dedicated to supporting your health and recovery journey.</p>
            <p style="margin-top: 25px; margin-bottom: 0;">Warm regards,</p>
            <p style="margin: 0; font-weight: bold; color: #090d16;">VR Physio Rehab Team</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #4b5563;">
              📞 +91 77949 21287<br/>
              ✉️ vrphysiorehab@gmail.com | 🌐 www.vrphysiorehab.com
            </p>
          </div>
        `;
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            to: recipientEmail,
            subject,
            bodyText,
            pdfBase64: base64Pdf,
            filename: `bill-report-${patientCode}.pdf`
          }
        });
        if (error) throw error;
        results.push({ success: true, type: 'bill' });
      } catch (err) {
        console.error("Error sending bill report email:", err);
        results.push({ success: false, type: 'bill', error: err.message });
      }
    }

    return results;
  }
};

export default emailService;
