import { Component } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfPage, PdfBrush, PdfFontFamily, PdfDestination, PdfBookmark, PdfStandardFont, Rectangle, PdfBookmarkBase } from '@syncfusion/ej2-pdf';

@Component({
	selector: 'control-content',
	templateUrl: './bookmark.html',
	standalone: true,
})
export class PdfBookmarkComponent {

	/**
	 * Entry point triggered from the UI (usually button click).
	 * Flow:
	 * 1) Create PDF document
	 * 2) Loop chapters -> create page + headings
	 * 3) Build bookmark tree (chapter -> sections -> paragraphs)
	 * 4) Save the PDF and dispose resources
	 */
	ngAfterViewInit(): void {
		var button: Button = new Button();
		button.appendTo('#bookmarkbtn');
		button.element.onclick = (): void => {
			// Create a new in-memory PDF
			const document = new PdfDocument();
			// Create 3 chapters; each chapter is placed on a new page
			for (let i = 1; i <= 3; i++) {
				// Add page for the chapter
				const page: PdfPage = document.addPage();
				// ----- Chapter title + top-level bookmark -----
				const chapterTitle = `Chapter ${i}`;
				// Draw chapter title at top-left in red
				this.drawTitle(page, chapterTitle, 10, 10, new PdfBrush({ r: 255, g: 0, b: 0 }));
				// Root bookmarks collection for the document
				const bookmarks: PdfBookmarkBase = document.bookmarks;
				// Create chapter bookmark at root level
				const chapter: PdfBookmark = bookmarks.add(chapterTitle);
				// Make bookmark jump to the chapter title position
				chapter.destination = new PdfDestination(page, { x: 10, y: 10 });
				chapter.color = { r: 255, g: 0, b: 0 };
				// ----- Section titles + child bookmarks under chapter -----
				const sec1Title = `Section ${i}.1`;
				const sec2Title = `Section ${i}.2`;
				// Draw section headings on the same page at different Y positions
				this.drawTitle(page, sec1Title, 30, 30, new PdfBrush({ r: 255, g: 0, b: 0 }));
				this.drawTitle(page, sec2Title, 30, 400, new PdfBrush({ r: 255, g: 0, b: 0 }));
				// Section 1 bookmark nested under the chapter
				const section1 = chapter.add(sec1Title);
				section1.destination = new PdfDestination(page, { x: 30, y: 30 });
				section1.color = { r: 0, g: 128, b: 0 };
				// Section 2 bookmark nested under the chapter
				const section2 = chapter.add(sec2Title);
				section2.destination = new PdfDestination(page, { x: 30, y: 400 });
				section2.color = { r: 0, g: 128, b: 0 };
				// ----- Paragraphs + deeper bookmark levels under each section -----
				// Adds 3 paragraphs under Section 1 starting below its header
				this.addParagraphs(page, section1, i, 1, 50);
				// Adds 3 paragraphs under Section 2 starting below its header
				this.addParagraphs(page, section2, i, 2, 420);
			}
			// Download/save the PDF file
			document.save('Bookmarks.pdf');
			// Free internal resources
			document.destroy();
		}
	}

	/**
	 * Adds multiple paragraph labels to the page and creates bookmarks under a parent section.
	 * Each paragraph:
	 * - is drawn on the page in blue
	 * - is added as a child bookmark pointing to its exact location
	 */
	private addParagraphs(page: PdfPage, parent: PdfBookmark, chapter: number, section: number, startY: number) {
		// Fixed list to generate 3 paragraphs (index 0..2)
		const paragraphs = [0, 1, 2];
		paragraphs.forEach((_, index) => {
			// Position each paragraph 100 units below the previous
			const y = startY + index * 100;
			// Label pattern: Paragraph <chapter>.<section>.<paragraphIndex>
			const text = `Paragraph ${chapter}.${section}.${index + 1}`;
			// Draw paragraph title in blue at (50, y)
			this.drawTitle(page, text, 50, y, new PdfBrush({ r: 0, g: 0, b: 255 }));
			// Create paragraph bookmark under the section bookmark
			const b = parent.add(text);
			// Set destination to the paragraph's drawn position
			b.destination = new PdfDestination(page, { x: 50, y });
			b.color = { r: 0, g: 0, b: 255 };
		});
	}

	/**
	 * Draws a single title string on the PDF page at the given coordinates.
	 * Uses Helvetica size 10 and draws inside a rectangle for layout bounds.
	 */
	private drawTitle(page: PdfPage, title: string, x: number, y: number, brush: PdfBrush) {
		// Shared font used for all headings/labels
		const font = new PdfStandardFont(PdfFontFamily.helvetica, 10);
		// Drawing area for the text
		const bounds: Rectangle = { x, y, width: 500, height: 20 };
		// Render text onto the page graphics
		page.graphics.drawString(title, font, bounds, brush);
	}
}