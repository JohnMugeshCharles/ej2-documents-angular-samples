import { Component, OnInit } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfPageSettings, PdfMargins, PdfPage, PdfGraphics, PdfBrush, PdfPen, PdfFont, PdfFontFamily, PdfFontStyle, PdfTextWebLinkAnnotation } from '@syncfusion/ej2-pdf';

@Component({
  templateUrl: './default.html',
  selector: 'control-content',
  standalone: true,
})
export class DefaultPdfComponent implements OnInit {

  /**
   * Angular lifecycle hook.
   * Currently unused, but kept for future initialization needs.
   */
  ngOnInit(): void { }

  /**
   * Generates a single-page PDF with a brochure-like layout.
   * Flow:
   * 1) Create document + page (with zero margins)
   * 2) Paint background blocks (header/body/footer regions)
   * 3) Draw header branding text
   * 4) Draw header bullet points (top region)
   * 5) Draw body bullet points (middle region)
   * 6) Draw two-column feature sections (bottom region)
   * 7) Add footer + web link annotation
   * 8) Save and dispose the document
   */
  ngAfterViewInit(): void {
    let button: Button = new Button();
    button.appendTo('#successbtn');
    button.element.onclick = (): void => {
      // Create the PDF document in memory
      const pdf: PdfDocument = new PdfDocument();
      // Page settings: remove margins to allow full-bleed rectangles/backgrounds
      const settings: PdfPageSettings = new PdfPageSettings({
        margins: new PdfMargins(0)
      });
      // Add a page with the above settings
      const page: PdfPage = pdf.addPage(settings);
      // Graphics context used for all drawing operations on this page
      const g: PdfGraphics = page.graphics;
      // ---------------------- Brushes & Pens ----------------------
      // Brushes fill shapes and text; pens draw lines/strokes.
      const gray: PdfBrush = new PdfBrush({ r: 64, g: 64, b: 64 });
      const black: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
      const white: PdfBrush = new PdfBrush({ r: 255, g: 255, b: 255 });
      const violet: PdfBrush = new PdfBrush({ r: 255, g: 153, b: 255 });
      const redPen: PdfPen = new PdfPen({ r: 255, g: 0, b: 0 }, 2);
      const violetPen: PdfPen = new PdfPen({ r: 148, g: 0, b: 211 }, 2);
      const greenPen: PdfPen = new PdfPen({ r: 0, g: 128, b: 0 }, 2);
      const bluePen: PdfPen = new PdfPen({ r: 0, g: 0, b: 255 }, 2);
      // ---------------------- Background layout blocks ----------------------
      // 1) Full-page background (gray)
      g.drawRectangle(
        { x: 0, y: 0, width: g.clientSize.width, height: g.clientSize.height },
        gray
      );
      // 2) Header strip at the top (black)
      g.drawRectangle(
        { x: 0, y: 0, width: g.clientSize.width, height: 130 },
        black
      );
      // 3) Bottom content area (white) to contrast with the gray background
      //    (starts at y=400, leaving a gray middle section above it)
      g.drawRectangle(
        { x: 0, y: 400, width: g.clientSize.width, height: g.clientSize.height - 450 },
        white
      );
      // ---------------------- Header branding ----------------------
      // Large header font for the main brand word
      const headerFont: PdfFont = pdf.embedFont(
        PdfFontFamily.timesRoman, 35, PdfFontStyle.regular
      );
      // Draw the main header word in violet
      g.drawString('Enterprise', headerFont,
        { x: 10, y: 20, width: 150, height: 200 }, violet);
      // Draw a violet highlight rectangle behind the subheading
      g.drawRectangle({ x: 10, y: 63, width: 140, height: 35 }, violet);
      // Subheading font placed on top of the violet highlight
      const subHeadingFont: PdfFont = pdf.embedFont(
        PdfFontFamily.timesRoman, 16, PdfFontStyle.regular
      );
      g.drawString('Reporting Solutions', subHeadingFont,
        { x: 15, y: 70, width: 130, height: 200 }, black);
      // Y-position cursor used to place text blocks vertically in sequence
      let yPos = 30;
      // ---------------------- Fonts for bullets/content ----------------------
      const bodyFont: PdfFont = pdf.embedFont(
        PdfFontFamily.timesRoman, 11, PdfFontStyle.regular
      );
      // ZapfDingbats is used to render bullet glyphs (symbols) like 'l' and '3'
      const bulletHeaderFont: PdfFont = pdf.embedFont(
        PdfFontFamily.zapfDingbats, 10, PdfFontStyle.regular
      );
      // ---------------------- Header bullet list (top black strip) ----------------------
      // These are short selling points displayed in the header area.
      // drawHeaderPoint() returns the next Y position to keep stacking lines neatly.
      yPos = this.drawHeaderPoint(g,
        'Develop cloud-ready reporting applications in as little as 20% of the time.',
        yPos, bulletHeaderFont, bodyFont, white, violet);
      yPos = this.drawHeaderPoint(g,
        'Proven, reliable platform thousands of users over the past 10 years.',
        yPos, bulletHeaderFont, bodyFont, white, violet);
      yPos = this.drawHeaderPoint(g,
        'Microsoft Excel, Word, Adobe PDF, RDL display and editing.',
        yPos, bulletHeaderFont, bodyFont, white, violet);
      yPos = this.drawHeaderPoint(g,
        'Why start from scratch? Rely on our dependable solution frameworks',
        yPos, bulletHeaderFont, bodyFont, white, violet);
      // Add spacing before moving into the larger middle bullet list
      yPos += 105;
      // Larger bullets + larger text for the body feature list
      const bulletBodyFont: PdfFont = pdf.embedFont(
        PdfFontFamily.zapfDingbats, 16, PdfFontStyle.regular
      );
      const bodyContentFont: PdfFont = pdf.embedFont(
        PdfFontFamily.timesRoman, 17, PdfFontStyle.regular
      );
      // ---------------------- Body bullet list (middle area) ----------------------
      yPos = this.drawBodyContent(g,
        'Deployment-ready framework tailored to your needs.',
        yPos, bulletBodyFont, bodyContentFont, white, violet);
      yPos = this.drawBodyContent(g,
        'Our architects and developers have years of reporting experience.',
        yPos, bulletBodyFont, bodyContentFont, white, violet);
      yPos = this.drawBodyContent(g,
        'Solutions available for web, desktop, and mobile applications.',
        yPos, bulletBodyFont, bodyContentFont, white, violet);
      yPos = this.drawBodyContent(g,
        'Backed by our end-to-end product maintenance infrastructure.',
        yPos, bulletBodyFont, bodyContentFont, white, violet);
      yPos = this.drawBodyContent(g,
        'The quickest path from concept to delivery.',
        yPos, bulletBodyFont, bodyContentFont, white, violet);
      // ---------------------- Lower white section: two-column feature blocks ----------------------
      // Left edge alignment reference for the feature blocks
      const headerX = 45;
      // Reset Y to the start of the white region content
      yPos = 350;
      // Title font used for headings in the lower section
      const titleFont: PdfFont = pdf.embedFont(
        PdfFontFamily.timesRoman, 20, PdfFontStyle.regular
      );
      // ---- Row 1: "The Experts" and "Accurate Estimates" ----
      // Decorative vertical line + heading on the left column
      g.drawLine(redPen, { x: headerX, y: yPos + 92 }, { x: headerX, y: yPos + 145 });
      g.drawString('The Experts', titleFont,
        { x: headerX + 10, y: yPos + 90, width: 150, height: 200 }, black);
      // Decorative vertical line + heading on the right column
      g.drawLine(violetPen,
        { x: headerX + 280, y: yPos + 92 },
        { x: headerX + 280, y: yPos + 145 });
      g.drawString('Accurate Estimates', titleFont,
        { x: headerX + 290, y: yPos + 90, width: 300, height: 200 }, black);
      // Supporting text under each heading
      g.drawString(
        'A substantial number of .NET reporting applications use our frameworks',
        bodyFont,
        { x: headerX + 10, y: yPos + 115, width: 250, height: 200 },
        black
      );
      g.drawString(
        'Given our expertise, you can expect estimates to be accurate.',
        bodyFont,
        { x: headerX + 290, y: yPos + 115, width: 250, height: 200 },
        black
      );
      // Move down for the second row of feature blocks
      yPos += 200;
      // ---- Row 2: "Product Licensing" and "About Syncfusion" ----
      g.drawLine(greenPen, { x: headerX, y: yPos + 32 }, { x: headerX, y: yPos + 85 });
      g.drawString('Product Licensing', titleFont,
        { x: headerX + 10, y: yPos + 30, width: 250, height: 200 }, black);
      g.drawLine(bluePen,
        { x: headerX + 280, y: yPos + 32 },
        { x: headerX + 280, y: yPos + 85 });
      g.drawString('About Syncfusion', titleFont,
        { x: headerX + 290, y: yPos + 30, width: 250, height: 200 }, black);
      // Supporting text for second row
      g.drawString(
        'Solution packages can be combined with product licensing for great cost savings.',
        bodyFont,
        { x: headerX + 10, y: yPos + 55, width: 250, height: 200 },
        black
      );
      g.drawString(
        'Syncfusion has more than 7,000 customers including large financial institutions and Fortune 100 companies.',
        bodyFont,
        { x: headerX + 290, y: yPos + 55, width: 250, height: 200 },
        black
      );
      // ---------------------- Footer text ----------------------
      const footerFont: PdfFont = pdf.embedFont(
        PdfFontFamily.timesRoman, 8, PdfFontStyle.italic
      );
      // Footer disclaimer placed near the bottom-left (drawn in white on gray)
      g.drawString(
        'All trademarks mentioned belong to their owners.',
        footerFont,
        { x: 10, y: g.clientSize.height - 30, width: 250, height: 200 },
        white
      );
      // ---------------------- Clickable web link annotation ----------------------
      // Add a hyperlink-like annotation near the bottom-right.
      // The annotation rectangle defines clickable area; the appearance uses white text.
      const annot = new PdfTextWebLinkAnnotation(
        { x: g.clientSize.width - 100, y: g.clientSize.height - 30, width: 70, height: 10 },
        { r: 255, g: 255, b: 255 },
        null,
        0,
        { text: 'www.syncfusion.com', font: footerFont, url: 'http://www.syncfusion.com' }
      );
      // Attach annotation to the page so it becomes interactive in the PDF
      page.annotations.add(annot);
      // Save/download the PDF and release resources
      pdf.save('Sample.pdf');
      pdf.destroy();
    }
  }
  /**
   * Draws a single bullet point line in the header area.
   * - Bullet glyph: 'l' rendered via ZapfDingbats font
   * - Text is rendered in white on the black header background
   * Returns the next Y position to continue stacking bullet lines.
   */
  private drawHeaderPoint(
    g: PdfGraphics,
    text: string,
    y: number,
    bulletFont: PdfFont,
    bodyFont: PdfFont,
    white: PdfBrush,
    violet: PdfBrush
  ): number {
    // Draw bullet glyph (symbol) in violet
    g.drawString('l', bulletFont, { x: 220, y, width: 100, height: 100 }, violet);
    // Draw the bullet text next to the glyph in white
    g.drawString(text, bodyFont, { x: 240, y, width: 400, height: 100 }, white);
    // Advance Y slightly for the next bullet line
    return y + 15;
  }
  /**
   * Draws a body bullet line in the middle section.
   * - Bullet glyph: '3' rendered via ZapfDingbats (larger size)
   * - Returns next Y position for the next item
   */
  private drawBodyContent(
    g: PdfGraphics,
    text: string,
    y: number,
    bulletFont: PdfFont,
    bodyFont: PdfFont,
    white: PdfBrush,
    violet: PdfBrush
  ): number {
    // Draw bullet glyph in violet
    g.drawString('3', bulletFont, { x: 35, y, width: 100, height: 100 }, violet);
    // Draw body text next to the glyph in white (on gray background area)
    g.drawString(text, bodyFont, { x: 60, y, width: 500, height: 100 }, white);
    // Advance Y for the next bullet item
    return y + 25;
  }
}