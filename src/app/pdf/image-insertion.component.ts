import { Component, OnInit } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfPage, PdfGraphics, PdfBrush, PdfFont, PdfFontFamily, PdfFontStyle, PdfBitmap } from '@syncfusion/ej2-pdf';

@Component({
    selector: 'control-content',
    templateUrl: './image-insertion.html',
    standalone: true,
})
export class ImagesPdfComponent implements OnInit {
    // Remote image URLs used for the demo (loaded at runtime via fetch)
    private jpegUrl = 'https://cdn.syncfusion.com/content/pdf-resources/xamarin-jpeg.jpg';
    private pngUrl = 'https://cdn.syncfusion.com/content/pdf-resources/xamarin-png.png';

    /**
     * Angular lifecycle hook.
     * No initialization required for this sample.
     */
    ngOnInit(): void { }

    /**
     * Generates a PDF that demonstrates inserting images (JPEG + PNG).
     * Flow:
     * 1) Download both image resources in parallel (as Uint8Array)
     * 2) Create a PDF document and add one page
     * 3) Draw labels ("JPEG Image", "PNG Image")
     * 4) Convert downloaded bytes to PdfBitmap and draw images at fixed positions
     * 5) Save and destroy the document
     */
    ngAfterViewInit(): void {
        const generateBtn = new Button();
        generateBtn.appendTo('#generatebtn');
        generateBtn.element.onclick = async (): Promise<void> => {
            try {
                // Fetch both images concurrently for better performance
                const [jpgBytes, pngBytes] = await Promise.all([
                    this.fetchAsUint8Array(this.jpegUrl),
                    this.fetchAsUint8Array(this.pngUrl)
                ]);
                // Create the PDF document in memory
                const document = new PdfDocument();
                // Add a page that will contain both images
                const page: PdfPage = document.addPage();
                // Graphics context used to draw text and images
                const g: PdfGraphics = page.graphics;
                // ---------------------- Common styling ----------------------
                // Font used for section labels and a blue brush for text color
                const font: PdfFont = document.embedFont(PdfFontFamily.helvetica, 12, PdfFontStyle.bold);
                const blueBrush = new PdfBrush({ r: 0, g: 0, b: 255 });
                // ---------------------- JPEG section ----------------------
                // Draw label for the JPEG image
                g.drawString(
                    'JPEG Image',
                    font,
                    { x: 0, y: 40, width: 150, height: 30 },
                    blueBrush
                );
                // Create bitmap from downloaded JPEG bytes and draw it on the page
                const jpgImage = new PdfBitmap(jpgBytes);
                g.drawImage(jpgImage, {
                    x: 0,
                    y: 70,
                    width: 515,
                    height: 215
                });
                // ---------------------- PNG section ----------------------
                // Draw label for the PNG image
                g.drawString(
                    'PNG Image',
                    font,
                    { x: 0, y: 355, width: 150, height: 30 },
                    blueBrush
                );
                // Create bitmap from downloaded PNG bytes and draw it on the page
                const pngImage = new PdfBitmap(pngBytes);
                g.drawImage(pngImage, {
                    x: 0,
                    y: 385,
                    width: 199,
                    height: 300
                });
                // Save/download the PDF file
                document.save('Images.pdf');
                // Cleanup resources
                document.destroy();
            } catch (error) {
                // Handles network fetch errors and PDF rendering errors
                console.error('Generate PDF failed:', error);
            }
        }
    }

    /**
     * Downloads a remote resource and returns it as a Uint8Array.
     * - Uses no-cache to ensure fresh content
     * - Throws an explicit error for non-200 responses (better debugging)
     */
    private async fetchAsUint8Array(url: string): Promise<Uint8Array> {
        const res = await fetch(url, { cache: 'no-cache' });

        // Fail fast when the resource cannot be retrieved
        if (!res.ok) {
            throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
        }

        const buffer = await res.arrayBuffer();
        return new Uint8Array(buffer);
    }
}