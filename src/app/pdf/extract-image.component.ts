import { Component, OnInit } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument } from '@syncfusion/ej2-pdf';
import { PdfDataExtractor } from '@syncfusion/ej2-pdf-data-extract';

@Component({
    selector: 'control-content',
    templateUrl: './extract-image.html',
    standalone: true,
})
export class ExtractImagePdfComponent implements OnInit {
    // Remote template PDF used for extraction demo
    private templateUrl = 'https://cdn.syncfusion.com/content/pdf-resources/image-template.pdf';

    // Default filename used when downloading the first extracted image
    private outputImageName = 'Sample.jpg';

    /**
     * Angular lifecycle hook.
     * No initialization required for this sample (kept for extensibility).
     */
    ngOnInit(): void { }

    /**
     * Extracts images from the template PDF and downloads the first extracted image.
     * Flow:
     * 1) Fetch PDF bytes from remote URL
     * 2) Load bytes into PdfDocument
     * 3) Create PdfDataExtractor (requires a canvas render callback)
     * 4) Extract images across all pages
     * 5) If images exist -> create Blob and download it
     * 6) Destroy PdfDocument to release resources
     */
    ngAfterViewInit(): void {
        const viewBtn = new Button();
        viewBtn.appendTo('#viewtemplatebtn');
        const extractBtn = new Button();
        extractBtn.appendTo('#extractbtn');
        extractBtn.element.onclick = async (): Promise<void> => {
            try {
                // Read the PDF as raw bytes (Uint8Array)
                const pdfBytes = await this.readFromPdfResources(this.templateUrl);

                // Load the PDF into Syncfusion PDF document instance
                const pdf = new PdfDocument(pdfBytes);

                // Data extractor uses a canvas callback for rendering-related internals
                const extractor = new PdfDataExtractor(pdf, this.canvasRenderCallback);

                // Extract images from page range [0..pageCount-1]
                const images = await extractor.extractImages({
                    startPageIndex: 0,
                    endPageIndex: pdf.pageCount - 1
                });

                // If images were found, download the first one as a JPEG
                if (images && images.length > 0) {
                    const firstImage = images[0];

                    // Convert extracted image bytes to a Blob so the browser can download it
                    const blob = new Blob([firstImage.data], { type: 'image/jpeg' });

                    // Trigger a file download in the browser
                    this.downloadBlob(blob, this.outputImageName);
                } else {
                    // Helpful feedback when PDFs contain no embedded images
                    console.warn('No images found in the document');
                }

                // Cleanup to avoid memory leaks
                pdf.destroy();
            } catch (error) {
                // Catch both network errors and extraction/parsing errors
                console.error('Extract Image failed:', error);
            }
        }

        /**
         * Downloads the template PDF itself so the user can inspect what is being processed.
         * Flow:
         * 1) Fetch PDF bytes
         * 2) Create a PDF Blob
         * 3) Trigger browser download
         */
        viewBtn.element.onclick = async (): Promise<void> => {
            try {
                const pdfBytes = await this.readFromPdfResources(this.templateUrl);
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                this.downloadBlob(blob, 'ImageTemplate.pdf');
            } catch (error) {
                console.error('View Template failed:', error);
            }
        }
    }

    /**
     * Callback required by PdfDataExtractor for any canvas-based rendering needs.
     * Creates an off-DOM <canvas> element and returns it to the extractor.
     */
    private canvasRenderCallback(): any {
        const canvas = document.createElement('canvas');

        // applicationPlatform is left undefined for browser default behavior
        return { canvas, applicationPlatform: undefined };
    }

    /**
     * Reads a remote PDF resource into a Uint8Array.
     * - Uses fetch() with no-cache to always retrieve latest content
     * - Throws a clear error if the resource is unavailable
     */
    private async readFromPdfResources(url: string): Promise<Uint8Array> {
        const res = await fetch(url, { cache: 'no-cache' });

        // Fail fast with a readable error message for troubleshooting
        if (!res.ok) {
            throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
        }

        const buffer = await res.arrayBuffer();
        return new Uint8Array(buffer);
    }

    /**
     * Browser download helper:
     * - Creates an object URL for the Blob
     * - Creates a temporary <a> element to trigger download
     * - Cleans up DOM and revokes the object URL
     */
    private downloadBlob(blob: Blob, fileName: string): void {
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;

        // Append to DOM so click() works reliably in all browsers
        document.body.appendChild(a);
        a.click();

        // Cleanup: remove link element and release memory
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}