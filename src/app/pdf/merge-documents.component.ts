import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfPageImportOptions } from '@syncfusion/ej2-pdf';

@Component({
    selector: 'control-content',
    templateUrl: './merge-documents.html',
    standalone: true,
    imports: [FormsModule]
})
export class PdfMergeComponent {

    // Controls whether the import process attempts to reuse shared resources
    // (fonts/images/etc.) between documents to reduce final file size.

    // Source PDF URL used as input for merging (downloaded as bytes)
    private templateUrl =
        'https://cdn.syncfusion.com/content/pdf-resources/pdf-succinctly.pdf';

    // Output filename used when saving the merged PDF
    private outputPdfName = 'MergedPDF.pdf';

    /**
     * Merges PDF documents by importing pages from one document into another.
     *
     * Flow:
     *  1) Fetch the source PDF as bytes
     *  2) Create two PdfDocument instances from the same bytes (doc1 and doc2)
     *  3) Configure import options (resource optimization)
     *  4) Import all pages from doc2 into doc1
     *  5) Save merged output and destroy resources
     */
    ngAfterViewInit(): void {
        const mergeBtn = new Button();
        mergeBtn.appendTo('#mergebtn');
        mergeBtn.element.onclick = async (): Promise<void> => {
            try {
                // Download the source PDF file and convert it into Uint8Array
                const pdfBytes = await this.fetchAsUint8Array(this.templateUrl);
                // Create two PDF documents.
                // doc1 will be the destination document, doc2 will be imported into doc1.
                const doc1 = new PdfDocument(pdfBytes);
                const doc2 = new PdfDocument(pdfBytes);
                // Import all pages from doc2 into doc1:
                // start index = 0, end index = last page (pageCount - 1)
                doc1.importPageRange(doc2, 0, doc2.pageCount - 1);
                // Save the merged PDF (typically triggers a download in browser)
                doc1.save(this.outputPdfName);
                // Clean up resources to prevent memory leaks
                doc1.destroy();
                doc2.destroy();
            } catch (err) {
                // Catch any network/PDF parsing/import errors
                console.error('Merge PDFs failed:', err);
            }
        }
    }

    /**
     * Fetches a remote file and returns it as Uint8Array.
     * Used to load the PDF file into Syncfusion PdfDocument.
     */
    private async fetchAsUint8Array(url: string): Promise<Uint8Array> {
        // no-cache ensures latest version is fetched (helpful during development)
        const res = await fetch(url, { cache: 'no-cache' });
        // Fail early when the resource cannot be fetched
        if (!res.ok) {
            throw new Error(`Failed to fetch ${url}`);
        }
        // Convert response into bytes for PdfDocument constructor
        const buffer = await res.arrayBuffer();
        return new Uint8Array(buffer);
    }
}