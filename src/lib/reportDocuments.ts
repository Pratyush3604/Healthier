export const MAX_REPORT_FILE_BYTES = 10 * 1024 * 1024;

const supportedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const extensionTypes: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export function reportMimeType(file: Pick<File, 'name' | 'type'>): string | null {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const candidate = mimeType || extensionTypes[extension] || '';
  return supportedTypes.has(candidate) ? candidate : null;
}

export function validateReportFile(file: Pick<File, 'name' | 'type' | 'size'>): string | null {
  if (!reportMimeType(file)) return 'Choose a PDF, JPG, PNG, or WebP file.';
  if (file.size <= 0) return 'That file is empty. Choose another file.';
  if (file.size > MAX_REPORT_FILE_BYTES) return 'Files must be 10 MB or smaller.';
  return null;
}

export function extractClinicianQuestions(analysis: string): string | null {
  const match = analysis.match(
    /(?:^|\n)#{1,4}\s*Questions to Ask Your Clinician\s*\n([\s\S]*?)(?=\n#{1,4}\s|$)/i,
  );
  return match?.[1]?.trim() || null;
}

export function removeClinicianQuestions(analysis: string): string {
  return analysis.replace(
    /(?:^|\n)#{1,4}\s*Questions to Ask Your Clinician\s*\n[\s\S]*?(?=\n#{1,4}\s|$)/i,
    '',
  ).trim();
}