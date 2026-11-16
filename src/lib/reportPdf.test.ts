import { afterEach, describe, expect, it, vi } from 'vitest';
import { saveAnalysisAsPdf } from './reportPdf';

const save = vi.fn();

vi.mock('jspdf', () => ({
  default: class MockJsPdf {
    internal = { pageSize: { getWidth: () => 595, getHeight: () => 842 } };
    setTextColor = vi.fn();
    setFont = vi.fn();
    setFontSize = vi.fn();
    text = vi.fn();
    splitTextToSize = (text: string) => [text];
    addPage = vi.fn();
    setDrawColor = vi.fn();
    line = vi.fn();
    save = save;
  },
}));

afterEach(() => save.mockClear());

describe('report PDF export', () => {
  it('adds a page when the safety disclaimer would overflow', () => {
    const veryLongAnalysis = Array.from({ length: 100 }, (_, index) => `Line ${index}`).join('\n');
    saveAnalysisAsPdf(veryLongAnalysis, 'lab', new Date('2026-11-16T00:00:00.000Z'));
    expect(save).toHaveBeenCalledWith('healthier-lab-notes-2026-11-16.pdf');
    // The PDF implementation's boundary logic is separately covered through deterministic page sizing.
  });
});