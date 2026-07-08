import { Component, OnInit } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfPage, PdfGraphics, PdfBrush, PdfPen, PdfFontFamily, PdfFontStyle, PdfLineJoin } from '@syncfusion/ej2-pdf';

@Component({
	selector: 'shapes-pdf',
	templateUrl: './shapes.html',
	standalone: true,
})
export class ShapesPdfComponent implements OnInit {

	// Angular lifecycle hook (PDF generation is triggered manually from UI)
	ngOnInit(): void { }

	/**
	 * Generates a PDF that demonstrates various drawing primitives:
	 * polygon, pie segments, arcs, rectangle, ellipses spanning pages,
	 * and transparent rectangles.
	 *
	 * Flow:
	 *  1) Create document and first page
	 *  2) Prepare fonts, pens, brushes
	 *  3) Draw multiple shapes on page 1
	 *  4) Add page 2 to continue/complete shapes that extend beyond page 1
	 *  5) Draw transparency demo rectangles on page 2
	 *  6) Save and destroy PDF resources
	 */
	ngAfterViewInit(): void {
		let button: Button = new Button({}, '#shapebtn');
		button.element.onclick = (): void => {
			// Create a new PDF document instance (in-memory)
			const doc = new PdfDocument();
			// Add the first page with default settings
			const page: PdfPage = doc.addPage();
			// Graphics context for drawing on page 1
			const g: PdfGraphics = page.graphics;
			// ---------- Fonts ----------
			// Header font used for section titles on the PDF page
			const headerFont =
				doc.embedFont(PdfFontFamily.helvetica, 14, PdfFontStyle.bold);
			// ---------- Polygon ----------
			// Create a pen and configure stroke style for polygon outline
			let pen = new PdfPen({ r: 0, g: 0, b: 0 }, 3);
			// Override pen internals to apply specific stroke color/width/join style
			// (used here to show a thick, rounded, brown outline)
			pen._color = { r: 165, g: 42, b: 42 }; // Brown
			pen._width = 10;
			pen._lineJoin = PdfLineJoin.round;
			// Brush used to fill polygon and other shapes
			const greenBrush = new PdfBrush({ r: 0, g: 128, b: 0 });
			// Compute vertex points for a regular polygon (center, radius, point count)
			const polygonPoints = this.makeRegularPolygon(140, 140, 100, 16);
			// Draw section heading
			g.drawString(
				'Polygon',
				headerFont,
				{ x: 50, y: 0, width: 150, height: 50 },
				new PdfBrush({ r: 0, g: 0, b: 139 })
			);
			// Draw filled polygon using the computed points
			g.drawPolygon(polygonPoints, pen, greenBrush);
			// ---------- Pie ----------
			// Rectangle defines the bounding box of the ellipse/circle for the pie sections
			let rect = { x: 20, y: 280, width: 200, height: 200 };
			// Draw section heading
			g.drawString(
				'Pie shape',
				headerFont,
				{ x: 50, y: 250, width: 150, height: 50 },
				new PdfBrush({ r: 0, g: 0, b: 139 })
			);
			// Draw multiple pie slices using different start angles (each with 60-degree sweep)
			g.drawPie(rect, 180, 60, pen, greenBrush);
			g.drawPie(rect, 300, 60, pen, greenBrush);
			g.drawPie(rect, 60, 60, pen, greenBrush);
			// ---------- Arcs ----------
			// Arcs are drawn as thick quarter segments to form a ring-like pattern
			g.drawString(
				'Arcs',
				headerFont,
				{ x: 330, y: 0, width: 100, height: 50 },
				new PdfBrush({ r: 0, g: 0, b: 139 })
			);
			// Bounding rectangle for arcs (defines arc radius and placement)
			rect = { x: 310, y: 40, width: 200, height: 200 };
			// Draw four 90-degree arcs with alternating colors and slight offsets
			// to create a layered/overlapped arc effect
			g.drawArc(rect, 0, 90, new PdfPen({ r: 165, g: 42, b: 42 }, 11));
			g.drawArc({ ...rect, x: rect.x - 10 }, 90, 90, new PdfPen({ r: 0, g: 100, b: 0 }, 11));
			g.drawArc({ ...rect, x: rect.x - 10, y: rect.y - 10 }, 180, 90, new PdfPen({ r: 165, g: 42, b: 42 }, 11));
			g.drawArc({ ...rect, y: rect.y - 10 }, 270, 90, new PdfPen({ r: 0, g: 100, b: 0 }, 11));
			// ---------- Rectangle ----------
			// Draw a simple filled rectangle with thick outline
			rect = { x: 310, y: 280, width: 200, height: 100 };
			// Draw section heading
			g.drawString(
				'Simple Rectangle',
				headerFont,
				{ x: 310, y: 255, width: 200, height: 50 },
				new PdfBrush({ r: 0, g: 0, b: 139 })
			);
			// Draw rectangle using a brown pen stroke and green fill
			g.drawRectangle(
				rect,
				new PdfPen({ r: 165, g: 42, b: 42 }, 11),
				greenBrush
			);
			// ---------- Pagination & Ellipse ----------
			// Demonstrates how a shape can extend beyond one page and continue on another
			g.drawString(
				'Shape with pagination',
				headerFont,
				{ x: 300, y: 390, width: 250, height: 50 },
				new PdfBrush({ r: 0, g: 0, b: 139 })
			);
			// Create two brushes for overlapping ellipses
			const brownBrush = new PdfBrush({ r: 165, g: 42, b: 42 });
			const green = new PdfBrush({ r: 0, g: 128, b: 0 });
			// Draw tall ellipses that go beyond the bottom of page 1 (height 1100)
			// Only the visible portion is rendered on this page.
			g.drawEllipse({ x: 300, y: 450, width: 160, height: 1100 }, brownBrush);
			g.drawEllipse({ x: 320, y: 480, width: 160, height: 1100 }, green);
			// ---------- Page 2 ----------
			// Add a second page to continue the overflowing ellipses from page 1
			const page2 = doc.addPage();
			const g2 = page2.graphics;
			// Use negative Y offsets so the continuation aligns with where it left off on page 1
			g2.drawEllipse({ x: 300, y: -480, width: 160, height: 1100 }, brownBrush);
			g2.drawEllipse({ x: 320, y: -450, width: 160, height: 1100 }, green);
			// ---------- Transparent Rectangles ----------
			// Demonstrates alpha/transparency stacking by drawing overlapping rectangles
			g2.drawString(
				'Transparent Rectangles',
				headerFont,
				{ x: 50, y: 80, width: 250, height: 50 },
				new PdfBrush({ r: 0, g: 0, b: 139 })
			);
			// Start rectangle position and size (subsequent rectangles shift diagonally)
			let r = { x: 10, y: 150, width: 100, height: 100 };
			// Initial pen/brush for the first rectangle (opaque)
			let p = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
			let b: PdfBrush = new PdfBrush({ r: 0, g: 100, b: 0 }); // DarkGreen
			g2.drawRectangle(r, p, b);
			// Shift the rectangle down-right for overlap effect
			r = { x: r.x + 20, y: r.y + 20, width: r.width, height: r.height };
			// Change pen/brush and set transparency before drawing the next rectangle
			p = new PdfPen({ r: 165, g: 42, b: 42 }, 1); // Brown
			b = new PdfBrush({ r: 165, g: 42, b: 42 });
			g2.setTransparency(0.7);
			g2.drawRectangle(r, p, b);
			// Keep layering rectangles with decreasing alpha values
			r = { x: r.x + 20, y: r.y + 20, width: r.width, height: r.height };
			g2.setTransparency(0.5);
			g2.drawRectangle(r, p, new PdfBrush({ r: 0, g: 100, b: 0 }));
			r = { x: r.x + 20, y: r.y + 20, width: r.width, height: r.height };
			p = new PdfPen({ r: 0, g: 0, b: 255 }, 1); // Blue
			b = new PdfBrush({ r: 128, g: 128, b: 128 }); // Gray
			g2.setTransparency(0.25);
			g2.drawRectangle(r, p, b);
			r = { x: r.x + 20, y: r.y + 20, width: r.width, height: r.height };
			p = new PdfPen({ r: 0, g: 0, b: 0 }, 1); // Black
			b = new PdfBrush({ r: 0, g: 128, b: 0 }); // Green
			g2.setTransparency(0.1);
			g2.drawRectangle(r, p, b);
			// Save the final PDF and release resources
			doc.save('Shapes.pdf');
			doc.destroy();
		}
	}

	/**
	 * Generates vertex points for a regular polygon.
	 *
	 * @param cx - Center X coordinate
	 * @param cy - Center Y coordinate
	 * @param r - Radius (distance from center to each vertex)
	 * @param pointNum - Number of polygon vertices (e.g., 3 triangle, 5 pentagon)
	 * @returns Array of points that can be passed directly to drawPolygon()
	 */
	private makeRegularPolygon(
			cx: number,
			cy: number,
			r: number,
			pointNum: number
		): Array<{ x: number; y: number }> {

		// Collection to accumulate polygon vertices in order
		const pts: Array<{ x: number; y: number }> = [];

		// Convert degrees per step into radians per step
		const step = (360 / pointNum) * Math.PI / 180;

		// Compute each vertex using polar-to-Cartesian conversion
		for (let i = 0; i < pointNum; i++) {
			const theta = i * step;
			pts.push({
				x: Math.cos(theta) * r + cx,
				y: Math.sin(theta) * r + cy
			});
		}

		return pts;
	}
}