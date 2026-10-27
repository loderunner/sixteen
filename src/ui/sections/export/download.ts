import { type ExportFile } from '@/exports';

/**
 * Saves a file through the browser's download.
 *
 * @param file - The file to save.
 */
export function downloadFile({ filename, mime, content }: ExportFile): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  // Revoke after the click has started the download.
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}
