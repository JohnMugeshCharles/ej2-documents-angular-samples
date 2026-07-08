import { Component } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import { NumericTextBox } from '@syncfusion/ej2-inputs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PdfDocument } from '@syncfusion/ej2-pdf';
const DEFAULT_PDF_NAME = 'pdf-succinctly.pdf';
const DEFAULT_PDF_URL = 'https://cdn.syncfusion.com/content/pdf-resources/pdf-succinctly.pdf';
@Component({
  selector: 'control-content',
  templateUrl: './split-pdf.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class PdfSplitComponent {

  // Display name shown in UI (defaults to sample PDF name)
  fileName = 'pdf-succinctly.pdf';

  // Stores uploaded PDF file from <input type="file">
  selectedFile?: File;

  // Determines how the PDF will be split:
  // - fixed: split by a user-provided page range (fromPage..toPage)
  // - fileCount: split into N files (auto-calculated ranges)
  // - pageCount: split into chunks of X pages per file
  splitMode: 'fixed' | 'fileCount' | 'pageCount' = 'fixed';

  // Page range inputs for "fixed" mode (1-based in UI)
  fromPage = 1;
  toPage = 1;

  // Number of output files for "fileCount" mode
  fileCount = 2;

  // Pages per output file for "pageCount" mode
  pagesPerFile = 1;

  /**
   * Captures the selected PDF file from the file input.
   * Also updates the displayed fileName in the UI.
   */
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    // Ensure input has files and at least one file is selected
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
    }
  }

  /**
   * Splits a PDF according to the selected splitMode.
   *
   * Flow:
   *  1) Load PDF bytes from uploaded file OR fallback URL
   *  2) Create PdfDocument instance from bytes
   *  3) Assign splitEvent callback to receive each split part as bytes
   *  4) Based on splitMode:
   *      - fixed: validate range and splitByPageRanges([[from,to]])
   *      - fileCount: compute ranges evenly and splitByPageRanges(ranges)
   *      - pageCount: splitByFixedNumber(pagesPerFile)
   *  5) Destroy the source PdfDocument to free memory
   */
  ngAfterViewInit(): void {
    const splitBtnSf = new Button({}, '#splitBtn');
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement | null;
    const fileNameSpan = document.getElementById('fileName') as HTMLSpanElement | null;
    const fixedRangeRadio = document.getElementById('fixedRange') as HTMLInputElement | null;
    const fileCountRadio = document.getElementById('fileCount') as HTMLInputElement | null;
    const pageCountRadio = document.getElementById('pageCount') as HTMLInputElement | null;
    const rangeSection = document.getElementById('rangeSection') as HTMLDivElement | null;
    const fileCountSection = document.getElementById('fileCountSection') as HTMLDivElement | null;
    const pageCountSection = document.getElementById('pageCountSection') as HTMLDivElement | null;
    if (fileNameSpan) fileNameSpan.textContent = DEFAULT_PDF_NAME;
    if (fileInput && fileNameSpan) {
      fileInput.addEventListener('change', () => {
        fileNameSpan.textContent = fileInput.files?.[0]?.name || DEFAULT_PDF_NAME;
      });
    }
    const elFrom = document.getElementById('fromPage') as HTMLInputElement | null;
    const elTo = document.getElementById('toPage') as HTMLInputElement | null;
    const elFileCount = document.getElementById('fileCountInput') as HTMLInputElement | null;
    const elPagesPer = document.getElementById('pagesPerFileInput') as HTMLInputElement | null;
    new NumericTextBox({ min: 1, value: elFrom ? parseInt(elFrom.value || '1', 10) : 1, format: 'n0', width: '120px', showSpinButton: true }, '#fromPage');
    new NumericTextBox({ min: 1, value: elTo ? parseInt(elTo.value || '1', 10) : 1, format: 'n0', width: '120px', showSpinButton: true }, '#toPage');
    new NumericTextBox({ min: 1, value: elFileCount ? parseInt(elFileCount.value || '2', 10) : 2, format: 'n0', width: '120px', showSpinButton: true }, '#fileCountInput');
    new NumericTextBox({ min: 1, value: elPagesPer ? parseInt(elPagesPer.value || '1', 10) : 1, format: 'n0', width: '120px', showSpinButton: true }, '#pagesPerFileInput');
    function updateVisibility(): void {
      const selected = (document.querySelector('input[name="splitOption"]:checked') as HTMLInputElement | null)?.value;
      if (rangeSection) rangeSection.style.display = selected === 'fixed' ? 'block' : 'none';
      if (fileCountSection) fileCountSection.style.display = selected === 'fileCount' ? 'block' : 'none';
      if (pageCountSection) pageCountSection.style.display = selected === 'pageCount' ? 'block' : 'none';
    }
    fixedRangeRadio?.addEventListener('change', updateVisibility);
    fileCountRadio?.addEventListener('change', updateVisibility);
    pageCountRadio?.addEventListener('change', updateVisibility);
    updateVisibility();
    splitBtnSf.element.onclick = async (): Promise<void> => {
      this.splitPdf();
    };
  }

  async splitPdf(): Promise<void> {
    try {
      const bytes = await this.getPdfBytes();
      const pdf = new PdfDocument(bytes);

      (pdf as any).splitEvent = (_: any, args: any) => {
        const part = new PdfDocument(args.pdfData);
        part.save(`SplittedDoc_${args.index + 1}.pdf`);
        part.destroy();
      };

      const total = pdf.pageCount;

      if (total <= 0) {
        pdf.destroy();
        alert('PDF has no pages');
        return;
      }
      const selected = (
        document.querySelector(
          'input[name="splitOption"]:checked'
        ) as HTMLInputElement | null
      )?.value;
      const getValue = (id: string, fallback: number) => {
        const el = document.getElementById(id) as any;
        if (!el) return fallback;

        const inst = el.ej2_instances && el.ej2_instances[0];
        if (inst && typeof inst.value !== 'undefined') {
          return Number(inst.value);
        }

        return fallback;
      };
      if (selected === 'fixed') {
        const from = getValue('fromPage', 1);
        const to = getValue('toPage', 1);

        if (from < 1 || to < from || to > total) {
          alert(`Enter range between 1 and ${total}`);
          pdf.destroy();
          return;
        }

        (pdf as any).splitByPageRanges([[from - 1, to - 1]]);
      }
      else if (selected === 'fileCount') {
        const fileCount = Math.max(1, getValue('fileCountInput', 2));

        const ranges = this.buildRanges(total, fileCount);

        (pdf as any).splitByPageRanges(ranges);
      }
      else if (selected === 'pageCount') {
        const pagesPerFile = Math.max(1, getValue('pagesPerFileInput', 1));

        (pdf as any).splitByFixedNumber(pagesPerFile);
      }
      pdf.destroy();
    } catch (e: any) {
      alert(e?.message || 'Error');
    }
  }

  /**
   * Returns PDF bytes from either:
   *  - the user-selected file, OR
   *  - the default sample PDF URL (when no file is uploaded)
   */
  private async getPdfBytes(): Promise<Uint8Array> {

    // Use uploaded file if present
    if (this.selectedFile) {
      const buf = await this.selectedFile.arrayBuffer();
      return new Uint8Array(buf);
    }

    // Otherwise, fetch the default PDF from remote URL
    const res = await fetch(DEFAULT_PDF_URL, { cache: 'no-cache' });
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  }

  /**
   * Builds page ranges to split a document into a given number of files.
   *
   * Example:
   *  total=10 pages, files=3 => per=4 => ranges:
   *   [0..3], [4..7], [8..9]
   *
   * @param total - total pages in the document
   * @param files - desired number of split output files
   * @returns Array of [startIndex, endIndex] pairs (0-based)
   */
  private buildRanges(total: number, files: number): Array<[number, number]> {

    // Holds all output ranges
    const ranges: Array<[number, number]> = [];

    // Pages per file (rounded up so all pages are included)
    const per = Math.ceil(total / files);

    // Start building ranges from the first page index
    let start = 0;

    // Continue until we cover all pages
    while (start < total) {
      // End is clamped to the last available page index
      const end = Math.min(start + per - 1, total - 1);

      // Add this chunk to the ranges list
      ranges.push([start, end]);

      // Next chunk starts after the current end
      start = end + 1;
    }

    return ranges;
  }
}