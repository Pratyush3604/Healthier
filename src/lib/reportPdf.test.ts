import { afterEach, describe, expect, it, vi } from 'vitest';
import { writeReportPdf, type PdfDocument } from './reportPdf';

const makePdf = (height: number) => {
  const pages = { count: 1 };
  const saved = vi.fn();
  const pdf: PdfDocument = {
    internal: { pageSize: { getWidth: () => 595, getHeight: () => height } },
    setTextColor: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    text: vi.fn(),
    splitTextToSize: (text) => text.startsWith('For information only') ? [text, 'Safety line 2', 'Safety line 3', 'Safety line 4'] : text.split('\n'),
    addPage: () => { pages.count += 1; return pdf; },
    setDrawColor: vi.fn(),
    line: vi.fn(),
    save: saved,
  };
  return { pdf, pages, saved };
};

describe('report PDF export', () => {
  it('moves the safety disclaimer to a new page if it would be clipped', () => {
    const { pdf, pages, saved } = makePdf(400);
    writeReportPdf(pdf, 'A short summary.', 'lab', new Date('2026-11-16T00:00:00.000Z'));
    expect(pages.count).toBe(2);
    expect(saved).toHaveBeenCalledWith('healthier-lab-notes-2026-11-16.pdf');
  });

  it('adds pages for long summaries while retaining the disclaimer', () => {
    const { pdf, pages, saved } = makePdf(400);
    const veryLongAnalysis = Array.from({ length: 80 }, (_, index) => `Line ${index}`).join('\n');
    writeReportPdf(pdf, veryLongAnalysis, 'prescription', new Date('2026-11-16T00:00:00.000Z'));
    expect(pages.count).toBeGreaterThan(1);
    expect(saved).toHaveBeenCalledWith('healthier-prescription-notes-2026-11-16.pdf');
  });
});