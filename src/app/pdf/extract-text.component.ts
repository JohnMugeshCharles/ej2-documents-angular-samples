import { Component } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument } from '@syncfusion/ej2-pdf';
import { PdfDataExtractor } from '@syncfusion/ej2-pdf-data-extract';

@Component({
    selector: 'control-content',
    templateUrl: './extract-text.html',
    standalone: true,
})
export class ExtractTextPdfComponent {
    // Remote template PDF used as the input source for text extraction
    private templateURL = 'https://cdn.syncfusion.com/content/pdf-resources/pdf-succinctly.pdf';

    /**
     * Extracts text content from the template PDF and downloads it as a .txt file.
     * Flow:
     * 1) Fetch PDF bytes from template URL
     * 2) Load bytes into PdfDocument
     * 3) Create PdfDataExtractor and extract text across all pages
     * 4) Destroy the PDF document (resource cleanup)
     * 5) Download extracted text as a plain text file
     */
    ngAfterViewInit(): void {
        const viewBtn = new Button();
        viewBtn.appendTo('#viewtemplatebtn');
        const extractBtn = new Button();
        extractBtn.appendTo('#normalbtn');
        extractBtn.element.onclick = async (): Promise<void> => {
            try {
                // Read the PDF as raw bytes (Uint8Array) using fetch()
                const pdfBytes = await this.readFromPdfResources(this.templateURL);

                // Open the PDF from bytes
                const pdf = new PdfDocument(pdfBytes);

                // Create extractor bound to the document
                const extractor = new PdfDataExtractor(pdf);

                // Extract text from page range [0..pageCount-1]
                // Note: extractText() returns a single concatenated string for the range
                const text: string = extractor.extractText({
                    startPageIndex: 0,
                    endPageIndex: pdf.pageCount - 1
                });

                // Cleanup document resources as soon as we are done extracting
                pdf.destroy();

                // Trigger browser download of the extracted text
                this.downloadBlob(new Blob([text], { type: 'text/plain' }), 'Sample.txt');
            } catch (err) {
                // Handles both network failures and PDF parsing/extraction errors
                console.error('Extract Text failed:', err);
            }
        }

        /**
         * Downloads the original template PDF so users can preview the source content.
         * Flow:
         * 1) Fetch PDF bytes from template URL
         * 2) Create a PDF Blob
         * 3) Trigger a browser download
         */
        viewBtn.element.onclick = async (): Promise<void> => {
            try {
                const pdfBytes = await this.readFromPdfResources(this.templateURL);
                // Download the PDF as-is for viewing
                this.downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'PDF_Succinctly.pdf');
            } catch (err) {
                console.error('View Template failed:', err);
            }
        }
    }

    /**
     * Fetches a remote PDF file and returns its content as Uint8Array.
     * Includes basic HTTP status validation for clearer error reporting.
     */
    private async readFromPdfResources(url: string): Promise<Uint8Array> {
        const res = await fetch(url);

        // Fail fast if the request did not succeed
        if (!res.ok) {
            throw new Error(`Failed to fetch PDF: ${res.status} ${res.statusText}`);
        }

        return new Uint8Array(await res.arrayBuffer());
    }

    /**
     * Browser download helper:
     * - Creates an object URL for the Blob
     * - Uses a temporary <a> element to initiate download
     * - Cleans up the element and revokes the object URL to free memory
     */
    private downloadBlob(blob: Blob, fileName: string): void {
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;

        // Append is used for wider browser compatibility with programmatic click()
        document.body.appendChild(a);
        a.click();

        // Cleanup DOM + memory
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}