import html2pdf from 'html2pdf.js';

/**
 * Generates a high-quality PDF blob from a DOM element.
 * @param {HTMLElement} element
 * @param {string} filename
 * @returns {Promise<Blob>}
 */
export const generatePdf = async (element, filename = 'document.pdf') => {
  if (!element) {
    throw new Error('Element not provided to PdfGenerator');
  }

  const opt = {
    margin: 0,
    filename: filename,

    // PNG = lossless and much sharper for text, logos and line details
    image: {
      type: 'png'
    },

    html2canvas: {
      scale: 3,
      useCORS: true,
      letterRendering: true,
      logging: false,
      backgroundColor: '#ffffff'
    },

    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true
    },

    pagebreak: {
      mode: ['css', 'legacy']
    }
  };

  try {
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
