import jsPDF from 'jspdf';

export type ReportMode = 'lab' | 'prescription' | 'unknown';

export interface PdfDocument {
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
  setTextColor: (...args: number[]) => void;
  setFont: (...args: string[]) => void;
  setFontSize: (size: number) => void;
  text: (text: string | string[], x: number, y: number) => void;
  splitTextToSize: (text: string, width: number) => string[];
  addPage: () => unknown;
  setDrawColor: (...args: number[]) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  save: (filename: string) => void;
}

export function writeReportPdf(pdf: PdfDocument, analysis: string, mode: ReportMode, date = new Date()) {
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 48;
  const title = mode === 'lab' ? 'Lab report summary' : mode === 'prescription' ? 'Prescription reading notes' : 'Document reading notes';

  pdf.setTextColor(20, 70, 82);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('Healthier', margin, 54);
  pdf.setFontSize(14);
  pdf.text(title, margin, 82);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Created ${date.toLocaleDateString()}`, margin, 100);

  let y = 128;
  pdf.setFontSize(11);
  pdf.setTextColor(35, 45, 48);
  const lines = pdf.splitTextToSize(analysis.replace(/[#*`]/g, ''), width - margin * 2);
  const bodyLineHeight = 15;
  const footerTop = height - margin - 64;
  for (let index = 0; index < lines.length; index += 1) {
    if (y > footerTop) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(lines[index], margin, y);
    y += bodyLineHeight;
  }

  const disclaimer = pdf.splitTextToSize(
    'For information only—not a diagnosis or treatment plan. Verify every result and medication instruction against the original document with a qualified clinician or pharmacist. Do not change or start medication based on this summary.',
    width - margin * 2,
  );
  const disclaimerHeight = disclaimer.length * 12 + 34;
  if (y + disclaimerHeight > height - margin) {
    pdf.addPage();
    y = margin;
  }
  pdf.setDrawColor(180, 140, 50);
  pdf.line(margin, y + 4, width - margin, y + 4);
  pdf.setFontSize(9);
  pdf.setTextColor(100, 80, 40);
  pdf.text(disclaimer, margin, y + 22);
  pdf.save(`healthier-${mode}-notes-${date.toISOString().slice(0, 10)}.pdf`);
}

export function saveAnalysisAsPdf(analysis: string, mode: ReportMode, date = new Date()) {
  writeReportPdf(new jsPDF({ unit: 'pt', format: 'a4' }), analysis, mode, date);
}