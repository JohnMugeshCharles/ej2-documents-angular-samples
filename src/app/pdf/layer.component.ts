import { Component } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfPageSettings, PdfMargins, PdfPage, PdfGraphics, PdfBrush, PdfPen, PdfFontFamily, PdfStandardFont } from '@syncfusion/ej2-pdf';

@Component({
	selector: 'control-content',
	templateUrl: './layer.html',
	standalone: true,
})
export class PdfLayersComponent {

	/**
	 * Creates a PDF demonstrating how "layers" (optional content groups)
	 * can be drawn independently on the same page.
	 *
	 * Flow:
	 *  1) Create PDF document + page settings
	 *  2) Add a page and draw a heading directly on the page graphics
	 *  3) Create 3 separate layers and draw arc groups on each layer
	 *  4) Save and release resources
	 */
	ngAfterViewInit(): void {
		let button: Button = new Button();
		button.appendTo('#layerbtn');
		button.element.onclick = (): void => {
			// Create a new PDF document in memory
			const doc = new PdfDocument();
			// ---------- Page settings ----------
			// Configure page size and margins before adding the page
			const settings = new PdfPageSettings();
			settings.size = { width: 350, height: 300 };
			settings.margins = new PdfMargins(0);
			// Add a page using the settings above
			const page: PdfPage = doc.addPage(settings);
			// ---------- Heading ----------
			// Draw title text directly onto the page (not inside any layer)
			const font = new PdfStandardFont(PdfFontFamily.helvetica, 16);
			const titleBrush = new PdfBrush({ r: 0, g: 0, b: 139 });
			page.graphics.drawString(
				'Layers',
				font,
				{ x: 150, y: 10, width: 100, height: 100 },
				titleBrush
			);
			// Base rectangle bounds used as the arc drawing region
			// (arcs are drawn relative to this rectangle)
			const rect = { x: 0, y: 0, width: 50, height: 50 };
			// ---------- Layer 1 ----------
			// Create a named layer and draw content into it using its own graphics context
			// Layer graphics are attached to the same page, but are logically separated.
			const layer1 = doc.layers.add('Layer1');
			const g1: PdfGraphics = layer1.createGraphics(page);
			// Move the layer's origin so arcs appear at the intended position
			g1.translateTransform({ x: 100, y: 60 });
			// Draw concentric arcs with default (full-circle) angles
			this.drawArcs(g1, rect);
			// ---------- Layer 2 ----------
			// Second layer draws the same arc group at a different position
			const layer2 = doc.layers.add('Layer2');
			const g2: PdfGraphics = layer2.createGraphics(page);
			// Translate origin for Layer 2 content placement
			g2.translateTransform({ x: 100, y: 180 });
			// Draw the same set of arcs again (separate optional content group)
			this.drawArcs(g2, rect);
			// ---------- Layer 3 ----------
			// Third layer uses a different translation and an "angled" arc variant
			const layer3 = doc.layers.add('Layer3');
			const g3: PdfGraphics = layer3.createGraphics(page);
			// Translate origin for Layer 3 content placement
			g3.translateTransform({ x: 160, y: 120 });
			// Draw partial arcs by enabling the angled flag
			this.drawArcs(g3, rect, true);
			// Save the document to a file (typically triggers a download in browser context)
			doc.save('Layers.pdf');
			// Clean up resources used by the PDF document
			doc.destroy();
		}
	}

	/**
	 * Draws a set of concentric arcs using multiple pens of varying thickness and colors.
	 *
	 * @param g - Graphics context to draw on (page graphics or layer graphics)
	 * @param rect - Bounds rectangle that defines arc size/position (before transforms)
	 * @param angled - If true, draw a partial arc segment; otherwise draw full arcs
	 */
	private drawArcs(
		g: PdfGraphics,
		rect: any,
		angled: boolean = false
	): void {
		// Use thick-to-thin strokes to create concentric arc rings
		// The "angled" flag controls start/sweep angles for partial arcs.
		// Red outermost arc
		let pen = new PdfPen({ r: 255, g: 0, b: 0 }, 50);
		g.drawArc(rect, angled ? -60 : 360, angled ? 60 : 360, pen);
		// Blue arc
		pen = new PdfPen({ r: 0, g: 0, b: 255 }, 30);
		g.drawArc(rect, angled ? -60 : 360, angled ? 60 : 360, pen);
		// Yellow arc
		pen = new PdfPen({ r: 255, g: 255, b: 0 }, 20);
		g.drawArc(rect, angled ? -60 : 360, angled ? 60 : 360, pen);
		// Green innermost arc
		pen = new PdfPen({ r: 0, g: 128, b: 0 }, 10);
		g.drawArc(rect, angled ? -60 : 360, angled ? 60 : 360, pen);
	}
}