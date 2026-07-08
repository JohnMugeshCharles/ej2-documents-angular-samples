import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfDocument } from '@syncfusion/ej2-pdf';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfRedactor, PdfRedactionRegion } from '@syncfusion/ej2-pdf-data-extract';

@Component({
  selector: 'control-content',
  templateUrl: './redaction.html',
  standalone: true,
  imports: [FormsModule]
})
export class PdfRedactionComponent {
  constructor(private cdr: ChangeDetectorRef) {}

  // Default remote PDF used as a sample/template for redaction operations
  private resourceUrl =
    'https://cdn.syncfusion.com/content/pdf-resources/credit_card_statement.pdf';

  // Stores the user-selected file (from <input type="file">)
  uploadedFile?: File;

  fileName: string = '';

  // UI flag to indicate that user attempted to redact without selecting a file
  showFileError = false;

  // Coordinate inputs (strings because they are bound to form inputs)
  // These represent a rectangle region to redact in the uploaded PDF
  x = '0';
  y = '0';
  width = '200';
  height = '100';

  ngAfterViewInit(): void {
    const viewBtn = new Button({}, '#viewtemplatebtn');
    const topRedactBtn = new Button({}, '#topRedactBtn');

    /**
   * Downloads the sample/template PDF so the user can see the document structure
   * and choose the redaction coordinates accordingly.
   *
   * Flow:
   *  1) Fetch resource PDF as bytes
   *  2) Download it as a PDF file in browser
   */
  viewBtn.element.onclick = async (): Promise<void> => {
    const bytes = await this.fetchAsUint8Array(this.resourceUrl);
    this.downloadPdf(bytes, 'RedactionTemplate.pdf');
  }

  /**
   * Redacts fixed regions from the bundled resource PDF.
   * This demonstrates redacting multiple areas at once.
   *
   * Flow:
   *  1) Define an array of redaction rectangles (x,y,width,height)
   *  2) Fetch the resource PDF as bytes
   *  3) Call redactPdf() with multiple rectangles
   */
  topRedactBtn.element.onclick = async (): Promise<void> => {
    // Predefined sample redaction regions (page index is applied later: 0)
    const rects = [
      { x: 70, y: 120, width: 200, height: 80 },
      { x: 400, y: 150, width: 100, height: 30 }
    ];

    const bytes = await this.fetchAsUint8Array(this.resourceUrl);
    await this.redactPdf(bytes, rects);
  }
    /**
     * Redacts a region from a user-uploaded PDF using coordinates entered in the UI.
     *
     * Flow:
     *  1) Validate user uploaded a file
     *  2) Parse x/y/width/height from string -> number
     *  3) Validate parsed values are numeric
     *  4) Read file into ArrayBuffer -> Uint8Array
     *  5) Call redactPdf() with a single rectangle
     */

    // The upload redaction button is handled by Angular `(click)` bound to `onUploadRedactClick()`.
  }

  /**
   * Handles file selection from the UI.
   * Resets the error flag whenever the user picks a file.
   */
  onFileChange(event: Event): void {
    const fileName = document.getElementById('fileName') as HTMLSpanElement | null;
    const input = event.target as HTMLInputElement;
    this.uploadedFile = input.files?.[0];
    if (fileName) { fileName.style.display = 'none'; }
    this.fileName = input.files?.[0]?.name || '';
    this.showFileError = false;
    this.cdr.detectChanges();
  }

  // Angular click handler for the upload redaction button. Runs inside Angular zone.
  async onUploadRedactClick(): Promise<void> {
    if (!this.uploadedFile) {
      this.showFileError = true;
      return;
    }

    const x = parseFloat(this.x);
    const y = parseFloat(this.y);
    const w = parseFloat(this.width);
    const h = parseFloat(this.height);

    if ([x, y, w, h].some(v => isNaN(v))) {
      alert('Please enter valid numeric values for X, Y, Width, and Height.');
      return;
    }

    const buffer = await this.uploadedFile.arrayBuffer();
    await this.redactPdf(new Uint8Array(buffer), { x, y, width: w, height: h });
  }


  /**
   * Core redaction routine that applies redaction regions and outputs a new PDF.
   *
   * Notes:
   * - Accepts either a single rectangle or an array of rectangles.
   * - Currently applies redactions on page index 0 (first page) via PdfRedactionRegion(0, ...).
   *
   * Flow:
   *  1) Load PDF bytes into PdfDocument
   *  2) Create PdfRedactor instance
   *  3) Normalize input to an array and convert each rect into PdfRedactionRegion
   *  4) Add regions to redactor and execute redaction
   *  5) Save the redacted output and release resources
   */
  private async redactPdf(
    pdfBytes: Uint8Array,
    rect:
      | { x: number; y: number; width: number; height: number }
      | Array<{ x: number; y: number; width: number; height: number }>
  ): Promise<void> {

    // Load the PDF document to be redacted
    const pdf = new PdfDocument(pdfBytes);

    // Redactor works on an existing PdfDocument instance
    const redactor = new PdfRedactor(pdf);

    // Ensure we always handle regions uniformly as an array
    const regions = (Array.isArray(rect) ? rect : [rect]).map(r => {

      // Create a redaction region on page 0 (first page) using provided bounds
      const region = new PdfRedactionRegion(0, {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height
      });

      // Fill color of the redaction overlay (black box)
      region.fillColor = { r: 0, g: 0, b: 0 };

      return region;
    });

    // Register redaction regions with the redactor
    redactor.add(regions);

    // Apply redaction (removes/masks content in defined regions)
    redactor.redactSync();

    // Save the result as a new PDF file
    pdf.save('Redaction.pdf');

    // Release resources used by PdfDocument
    pdf.destroy();
  }

  /**
   * Fetches a remote resource and returns it as a Uint8Array.
   * Used for loading the sample PDF from a URL.
   */
  private async fetchAsUint8Array(url: string): Promise<Uint8Array> {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }
    return new Uint8Array(await res.arrayBuffer());
  }

  /**
   * Downloads raw PDF bytes as a file in the browser by using a Blob + object URL.
   * The object URL is revoked afterward to avoid memory leaks.
   */
  private downloadPdf(bytes: Uint8Array, fileName: string): void {
    const arrayBuffer = bytes.buffer as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    // Clean up the object URL once the download is triggered
    URL.revokeObjectURL(url);
  }
}