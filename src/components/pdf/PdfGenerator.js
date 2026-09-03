import html2pdf from 'html2pdf.js';

/**
   * Generates a PDF blob from a DOM element using html2pdf.js.
   * @param {HTMLElement} element - The DOM element to convert to PDF.
   * @param {string} filename - The name of the file.
   * @returns {Promise<Blob>} The generated PDF blob.
   */
export const generatePdf = async (element, filename = 'document.pdf') => {
  if (!element) {
    throw new Error('Element not provided to PdfGenerator');
  }

  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      letterRendering: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    // Generate the PDF blob using the outputPdf method
    const blob = await html2pdf()
      .set(opt)
      .from(element)
      .outputPdf('blob');
    return blob;
  } catch (error) {
    console.error('Error generating PDF Blob:', error);
    throw error;
  }
};

export default generatePdf;
