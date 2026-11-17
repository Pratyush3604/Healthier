import { describe, expect, it } from 'vitest';
import { extractClinicianQuestions, MAX_REPORT_FILE_BYTES, removeClinicianQuestions, reportMimeType, validateReportFile } from './reportDocuments';

const fileInfo = (name: string, type: string, size: number) => ({ name, type, size });

describe('report document validation', () => {
  it('accepts PDF, JPG, PNG, and WebP files up to 10 MB', () => {
    expect(validateReportFile(fileInfo('results.pdf', 'application/pdf', MAX_REPORT_FILE_BYTES))).toBeNull();
    expect(validateReportFile(fileInfo('scan.jpg', 'image/jpeg', 100))).toBeNull();
    expect(validateReportFile(fileInfo('scan.png', 'image/png', 100))).toBeNull();
    expect(validateReportFile(fileInfo('scan.webp', 'image/webp', 100))).toBeNull();
    expect(validateReportFile(fileInfo('scan.jpeg', '', 100))).toBeNull();
    expect(reportMimeType(fileInfo('scan.jpeg', '', 100))).toBe('image/jpeg');
    expect(reportMimeType(fileInfo('results.pdf', '', 100))).toBe('application/pdf');
  });

  it('rejects empty, oversized, and unsupported files', () => {
    expect(validateReportFile(fileInfo('empty.pdf', 'application/pdf', 0))).toContain('empty');
    expect(validateReportFile(fileInfo('large.pdf', 'application/pdf', MAX_REPORT_FILE_BYTES + 1))).toContain('10 MB');
    expect(validateReportFile(fileInfo('notes.txt', 'text/plain', 100))).toContain('PDF, JPG, PNG, or WebP');
  });
});

describe('clinician question extraction', () => {
  it('returns the clinician questions section for the copy action', () => {
    expect(extractClinicianQuestions('## Questions to Ask Your Clinician\n- What does this value mean?\n\n## Next steps\nDiscuss it.'))
      .toBe('- What does this value mean?');
  });

  it('returns null when no questions section is present', () => {
    expect(extractClinicianQuestions('## Summary\nDiscuss the result with your clinician.')).toBeNull();
  });

  it('removes the question section from the main summary to prevent duplicate display', () => {
    expect(removeClinicianQuestions('## Summary\nReview this value.\n\n## Questions to Ask Your Clinician\n- What does it mean?\n\n## Next step\nAsk your doctor.'))
      .toBe('## Summary\nReview this value.\n\n## Next step\nAsk your doctor.');
  });
});