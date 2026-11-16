import jsPDF from 'jspdf';

export type ReportMode = 'lab' | 'prescription' | 'unknown';

export function saveAnalysisAsPdf(analysis: string, mode: ReportMode, date = new Date()) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
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
  for (const line of lines) {
    if (y > height - 100) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(line, margin, y);
    y += 15;
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