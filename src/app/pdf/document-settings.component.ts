import { Component } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfBrush, PdfFontFamily, PdfFontStyle } from '@syncfusion/ej2-pdf';

@Component({
  templateUrl: './document-settings.html',
  selector: 'control-content',
  standalone: true,
  // Lightweight local styling for the demo container
  styles: [`
   .control-section {
     padding: 12px;
   }
 `]
})
export class PdfDocPropertiesComponent {

  /**
   * Generates a PDF and demonstrates how to set and display document metadata.
   * Flow:
   * 1) Create document instance
   * 2) Set PDF document information (metadata)
   * 3) Add a page and draw a simple "Document Properties" summary
   * 4) Save the PDF and cleanup resources
   */
  ngAfterViewInit(): void {
    const btn = new Button({}, '#documentbtn');
    btn.element.onclick = (): void => {
      // Create a new PDF document in memory
      const pdf = new PdfDocument();
      // Capture current timestamp for creation & modification metadata
      const now = new Date();
      // ---------------------- Document metadata ----------------------
      // These values are stored in the PDF's document information dictionary
      // and can be viewed in PDF readers under "Properties".
      pdf.setDocumentInformation({
        author: 'Syncfusion',
        creationDate: now,
        modificationDate: now,
        creator: 'Essential PDF',
        keywords: 'PDF',
        subject: 'Document information DEMO',
        title: 'Syncfusion JavaScript PDF Library Example',
        producer: 'Syncfusion PDF'
      });
      // ---------------------- Page + drawing setup ----------------------
      // Add a page where we will render metadata details as visible text
      const page = pdf.addPage();
      const graphics = page.graphics;
      // Fonts used for title and detail lines
      const boldFont = pdf.embedFont(PdfFontFamily.helvetica, 12, PdfFontStyle.bold);
      const regularFont = pdf.embedFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
      // Brush for all text in this sample
      const blackBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
      // Draw a visible heading for the page content
      graphics.drawString(
        'Document Properties',
        boldFont,
        { x: 10, y: 10, width: 520, height: 20 },
        blackBrush
      );
      // Format the date in a readable way for the visible text output
      // (Metadata itself is stored as Date objects above.)
      const formattedDate = now.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
      });
      // Y cursor used to stack lines vertically
      let y = 50;
      /**
       * Helper to draw one line of text and advance the Y cursor.
       * Keeps the layout consistent and avoids repeated drawString code.
       */
      const drawLine = (text: string) => {
        graphics.drawString(
          text,
          regularFont,
          { x: 10, y, width: 520, height: 16 },
          blackBrush
        );
        y += 20;
      };
      // ---------------------- Visible metadata summary ----------------------
      // These lines mirror the values set in setDocumentInformation()
      drawLine('Title: Syncfusion JavaScript PDF Library Example');
      drawLine('Author: Syncfusion');
      drawLine('Subject: Document information DEMO');
      drawLine('Keywords: PDF');
      drawLine('Created: ' + formattedDate);
      drawLine('Modified: ' + formattedDate);
      drawLine('Application: Essential PDF');
      // Save triggers a download (in browser usage) with the given file name
      pdf.save('DocPropertiesAndXml.pdf');
      // Always destroy to release memory/resources
      pdf.destroy();
    }
  }
}