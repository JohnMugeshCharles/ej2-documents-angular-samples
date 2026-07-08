import { Component, OnInit } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfBrush, PdfFontFamily, PdfFontStyle } from '@syncfusion/ej2-pdf';

@Component({
    selector: 'control-content',
    templateUrl: './hello-world.html',
    standalone: true,
})
export class HelloPdfComponent implements OnInit {

    /**
     * Angular lifecycle hook.
     * No initialization required for this simple example.
     */
    ngOnInit(): void { }

    /**
     * Generates a basic "Hello World" PDF.
     * Flow:
     * 1) Create a new PDF document
     * 2) Add a page to the document
     * 3) Configure font and text brush
     * 4) Draw text onto the page graphics
     * 5) Save the PDF and release resources
     */
    ngAfterViewInit(): void {
        let button: Button = new Button();
        button.appendTo('#hellowbtn');
        button.element.onclick = (): void => {
            // Create a new PDF document instance
            const pdf = new PdfDocument();
            // Add a new blank page to the document
            const page = pdf.addPage();
            // Obtain the graphics object for drawing content
            const graphics = page.graphics;
            // Embed a Helvetica font with size 36 for the text
            const font = pdf.embedFont(
                PdfFontFamily.helvetica,
                36,
                PdfFontStyle.regular
            );
            // Define a black brush for rendering the text color
            const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
            // Draw the "Hello World!!!" text at the specified position on the page
            graphics.drawString(
                'Hello World!!!',
                font,
                {
                    x: 20,
                    y: 20,
                    width: graphics.clientSize.width - 20,
                    height: 60
                },
                brush
            );
            // Save the generated PDF (triggers download in browser context)
            pdf.save('Sample.pdf');
            // Destroy the document to free internal resources
            pdf.destroy();
        }
    }
}