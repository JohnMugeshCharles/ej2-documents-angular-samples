import { Component } from '@angular/core';
import { PdfDocument } from '@syncfusion/ej2-pdf';
import { Button } from '@syncfusion/ej2-buttons';

@Component({
    selector: 'control-content',
    templateUrl: './rearrange-pages.html',
    standalone: true,
})
export class RearrangePagesComponent {

    // Remote PDF used as the source document for viewing and rearranging pages
    private templateUrl =
        'https://cdn.syncfusion.com/content/pdf-resources/syncfusion-brochure.pdf';

    // Output filename for the rearranged PDF
    private outputPdfName = 'RearrangedPages.pdf';

    /**
     * Downloads the original template PDF as-is for preview purposes.
     *
     * Flow:
     *  1) Fetch PDF bytes from templateUrl
     *  2) Wrap bytes into a Blob (application/pdf)
     *  3) Trigger browser download via an <a> element
     */
    ngAfterViewInit(): void {
        const viewBtn = new Button({}, '#viewtemplatebtn');
        const rearrangeBtn = new Button({}, '#rearrangebtn');
        viewBtn.element.onclick = async (): Promise<void> => {
            try {
                // Fetch the PDF as raw bytes from the remote URL
                const bytes = await this.fetchPdfBytes(this.templateUrl);
                // Download the PDF bytes as a file so the user can view the template
                this.download(new Blob([bytes], { type: 'application/pdf' }), 'SyncfusionBrochure.pdf');
            } catch (err) {
                // Handle network / fetch errors
                console.error('View Template failed', err);
            }
        }

        /**
         * Rearranges pages of the template PDF and saves a new PDF.
         *
         * Flow:
         *  1) Fetch PDF bytes from templateUrl
         *  2) Load bytes into PdfDocument
         *  3) Reorder pages using zero-based indices
         *  4) Save output and release resources
         */
        rearrangeBtn.element.onclick = async (): Promise<void> => {
            try {
                // Fetch the PDF data from the remote URL
                const bytes = await this.fetchPdfBytes(this.templateUrl);
                // Load the PDF into Syncfusion PdfDocument for manipulation
                const pdf = new PdfDocument(bytes);
                // Reorder pages using 0-based indexing:
                // [2, 0, 1] => 3rd page becomes 1st, then 1st becomes 2nd, then 2nd becomes 3rd
                pdf.reorderPages([2, 0, 1]);
                // Save the rearranged document (typically triggers download in browser)
                pdf.save(this.outputPdfName);
                // Free PDF resources from memory
                pdf.destroy();
            } catch (err) {
                // Handle errors from fetching/parsing/reordering/saving
                console.error('Rearrange Pages failed', err);
            }
        }
    }

    /**
     * Fetches a remote PDF and returns it as Uint8Array.
     * This byte array is required to load PDFs into PdfDocument.
     */
    private async fetchPdfBytes(url: string): Promise<Uint8Array> {
        // no-cache helps during development to avoid stale responses
        const res = await fetch(url, { cache: 'no-cache' });

        // Fail fast if the server response is not successful
        if (!res.ok) {
            throw new Error(`Failed to fetch PDF: ${res.status}`);
        }

        // Convert the response to bytes
        return new Uint8Array(await res.arrayBuffer());
    }

    /**
     * Triggers a file download in the browser using an object URL.
     * Note: Object URLs must be revoked to avoid memory leaks.
     */
    private download(blob: Blob, name: string): void {
        // Create a temporary URL representing the Blob data
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor to initiate download
        const a = document.createElement('a');
        a.href = url;
        a.download = name;

        // Programmatically click the link to start download
        a.click();

        // Release the object URL once used
        URL.revokeObjectURL(url);
    }
}