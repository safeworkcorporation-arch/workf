import jsPDF from 'jspdf';
import { toCanvas, toJpeg } from 'html-to-image';

export async function generatePdfFromElement(
  element: HTMLElement,
  filename: string = 'Hoja_de_Servicio.pdf'
): Promise<{ pdfBlob: Blob; pdfBase64: string; download: () => void }> {
  // Use html-to-image which relies on native browser SVG foreignObject rendering.
  // This natively supports all modern CSS color functions (oklch, oklab, color-mix)
  // without triggering JavaScript color parser errors.
  let imgData: string;
  let imgWidthPx = element.offsetWidth || 850;
  let imgHeightPx = element.offsetHeight || 1100;

  try {
    const canvas = await toCanvas(element, {
      quality: 0.95,
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true,
    });
    imgData = canvas.toDataURL('image/jpeg', 0.95);
    imgWidthPx = canvas.width;
    imgHeightPx = canvas.height;
  } catch (canvasErr) {
    console.warn('toCanvas fallback to toJpeg:', canvasErr);
    imgData = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true,
    });
  }

  // Letter portrait format (standard in Ecuador / Latin America)
  // 215.9 mm x 279.4 mm
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
    compress: true,
  });

  pdf.setProperties({
    title: filename.replace('.pdf', ''),
    subject: 'Documento Oficial Safe Work Corporation',
    author: 'Safe Work Corporation',
    creator: 'Safe Work Corporation',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (imgHeightPx * pdfWidth) / imgWidthPx;

  // Center or scale to fit single page
  if (imgHeight <= pdfHeight) {
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
  } else {
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  }

  const pdfBlob = pdf.output('blob');
  const pdfBase64 = pdf.output('datauristring');

  return {
    pdfBlob,
    pdfBase64,
    download: () => {
      pdf.save(filename);
    },
  };
}
