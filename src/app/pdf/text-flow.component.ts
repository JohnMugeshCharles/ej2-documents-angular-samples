
import { Component } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import {
    PdfDocument,
    PdfPage,
    PdfFontFamily,
    PdfLayoutFormat,
    PdfLayoutType,
    PdfLayoutBreakType,
    PdfBrush,
    PdfStandardFont,
    PdfTextElement
} from '@syncfusion/ej2-pdf';

@Component({
    selector: 'control-content',
    templateUrl: './text-flow.html',
    standalone: true
})
export class TextFlowComponent {
    ngAfterViewInit(): void {

        const button = new Button();
        button.appendTo('#textFlow');

        button.element.onclick = async (): Promise<void> => {
            let textContent = '';
            try {
                const resp = await fetch('https://cdn.syncfusion.com/content/pdf-resources/pdf-textFlow.txt');
                if (resp.ok) {
                    textContent = await resp.text();
                }
            } catch (e) {
                // ignore fetch errors and proceed with empty textContent
            }

            // Create a new PDF document
            const doc: PdfDocument = new PdfDocument();

            // Add a new page
            const page: PdfPage = doc.addPage();

            // Get page client size
            const clientSize = page.graphics.clientSize;

            // Setup layout format for pagination
            const layoutFormat: PdfLayoutFormat = new PdfLayoutFormat();
            layoutFormat.layout = PdfLayoutType.paginate;
            layoutFormat.break = PdfLayoutBreakType.fitPage;
            layoutFormat.paginateBounds = { x: 0, y: 0, width: clientSize.width, height: clientSize.height };

            // Define a text element with styling and layout options
            let element: PdfTextElement = {
                text: textContent, // The text string to render
                font: new PdfStandardFont(PdfFontFamily.timesRoman, 14), // Times Roman font at 14pt
                brush: new PdfBrush({ r: 0, g: 0, b: 0 }), // Black color brush (RGB: 0,0,0)
                layoutFormat: layoutFormat // Apply the pagination layout settings
            };

            // Draw the text element on the page within the specified bounds
            page.drawTextElement(element, {
                x: 0, // X coordinate starting position
                y: 0, // Y coordinate starting position
                width: clientSize.width, // Width matches page width
                height: clientSize.height // Height matches page height
            });

            // Save the document
            doc.save('TextFlowOutput.pdf');
            // Destroy the document
            doc.destroy();
        };
    }
}
