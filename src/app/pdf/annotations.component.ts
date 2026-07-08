import { Component, OnInit } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import { FormsModule } from '@angular/forms';
import {
    PdfAnnotationBorder,
    PdfAnnotationFlag,
    PdfAnnotationState,
    PdfAnnotationStateModel,
    PdfBorderEffect,
    PdfBorderEffectStyle,
    PdfBrush,
    PdfCircleAnnotation,
    PdfDocument,
    PdfEllipseAnnotation,
    PdfFontFamily,
    PdfFreeTextAnnotation,
    PdfInkAnnotation,
    PdfLineAnnotation,
    PdfMeasurementUnit,
    PdfPage,
    PdfPolygonAnnotation,
    PdfPopupAnnotation,
    PdfRectangleAnnotation,
    PdfRedactionAnnotation,
    PdfRotationAngle,
    PdfRubberStampAnnotation,
    PdfStandardFont,
    PdfSquareAnnotation,
    PdfTextAlignment,
    PdfTextMarkupAnnotation,
    PdfTextMarkupAnnotationType,
    Rectangle,
    PdfPageSettings,
    PdfMargins
} from '@syncfusion/ej2-pdf';

@Component({
    selector: 'control-content',
    templateUrl: './annotations.html',
    standalone: true,
    imports: [FormsModule]
})
export class AnnotationsComponent implements OnInit {
    // Bound to the "Flatten annotation" checkbox
    flattenCheckbox = false;

    // File input state
    fileSelected = false;
    fileBytes: Uint8Array | null = null;
    fileName: string = '';

    // UI note message for errors/status
    noteVisible = false;
    noteMessage = '';

    // Attempt to invoke a global culture-loader if present (no compile-time import)
    ngOnInit(): void {
    }

    // Show an inline note message to the user
    private showNote(msg: string) {
        this.noteMessage = msg;
        this.noteVisible = true;
    }

    // Hide the inline note
    private hideNote() {
        this.noteVisible = false;
        this.noteMessage = '';
    }

    // Handler for file input change event
    async onFileChange(evt: Event) {
        const pdfFileName = document.getElementById('pdfFileName') as HTMLSpanElement | null;
        const input = evt.target as HTMLInputElement;
        this.fileSelected = false;
        this.fileBytes = null;
        this.fileName = '';
        if (!input || !input.files || input.files.length === 0) {
            return;
        }
        const file = input.files[0];
        this.fileName = file.name;
        if (pdfFileName) { pdfFileName.style.display = 'none'; }
        try {
            const buf = await file.arrayBuffer();
            this.fileBytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
            this.fileSelected = true;
        } catch (err: any) {
            this.showNote(err?.message || 'Error reading file.');
        }
    }

    // Returns whether the "Flatten" checkbox is checked
    private getFlattenCheckboxChecked(): boolean {
        const el: any = document.getElementById('checkboxFlatten');
        if (!el) return false;
        if ('checked' in el) return !!el.checked;
        if (el.ej2_instances && el.ej2_instances[0] && 'checked' in el.ej2_instances[0]) return !!el.ej2_instances[0].checked;
        return false;
    }

    ngAfterViewInit(): void {
        // Wire up UI controls: a submit button that creates a new PDF
        const submitEl = document.getElementById('submit') as HTMLInputElement | null;
        if (submitEl) {
            submitEl.addEventListener('click', (e) => { e.preventDefault(); this.createAndSavePdf(); });
        }

        // Flatten uploaded PDF: enable/disable the button based on file input
        // NOTE: HTML id uses the misspelling 'flatternButton' so we target that id.
        const flatBtnEl = document.getElementById('flatternButton') as HTMLButtonElement | null;
        if (flatBtnEl) {
            flatBtnEl.setAttribute('aria-disabled', 'true');
            flatBtnEl.addEventListener('click', (e) => { e.preventDefault(); void this.flattenUploadedPdf(); });
        }
    }

    // Create a new PDF with many annotation examples and save it.
    // This method is a direct conversion of the original sample code,
    // adapted to run inside an Angular component method.
    createAndSavePdf(): void {
        this.hideNote();
        try {
            // Create a new PDF document and add a page
            const pdfDoc = new PdfDocument();
            const page: PdfPage = pdfDoc.addPage();
            const font = new PdfStandardFont(PdfFontFamily.helvetica, 10);
            const brush = new PdfBrush({ r: 0, g: 0, b: 0 });

            // Add title and an introductory paragraph to the page
            page.graphics.drawString('Annotation with Comments and Reviews', font, { x: 30, y: 10, width: 200, height: 30 }, brush as any);

            const text = 'Adventure Works Cycles, the fictitious company on which the AdventureWorks sample databases are based, is a large, multinational manufacturing company. The company manufactures and sells metal and composite bicycles to North American, European and Asian commercial markets. While its base operation is located in Washington with 290 employees, several regional sales teams are located throughout their market base.';
            page.graphics.drawString(text, font, { x: 30, y: 40, width: page.graphics.clientSize.width - 60, height: 60 }, brush as any);

            // Create a highlighted text markup annotation and attach comment popups and review history
            const textMarkupAnnot: PdfTextMarkupAnnotation = new PdfTextMarkupAnnotation('Highlight', { x: 147, y: 63.5, width: 258, height: 10 },
                {
                    author: 'Annotation', opacity: 1, subject: 'Comments and Reviews', textMarkupType: PdfTextMarkupAnnotationType.highlight,
                    textMarkUpColor: { r: 255, g: 255, b: 0 }, innerColor: { r: 255, g: 0, b: 0 }
                }
            );
            textMarkupAnnot.modifiedDate = new Date(2015, 1, 18);
            textMarkupAnnot.color = { r: 255, g: 255, b: 0 };
            textMarkupAnnot.flags = PdfAnnotationFlag.print;

            // Add popup comments (like a threaded review) to the text markup
            const userQuery: PdfPopupAnnotation = new PdfPopupAnnotation({ author: 'John' });
            userQuery.text = 'Can you please change South Asian to Asian?';
            userQuery.modifiedDate = new Date(2015, 1, 18);
            textMarkupAnnot.comments.add(userQuery);

            const userAnswer: PdfPopupAnnotation = new PdfPopupAnnotation({ author: 'Smith' });
            userAnswer.text = 'South Asian has changed as Asian';
            userAnswer.modifiedDate = new Date(2015, 1, 18);
            textMarkupAnnot.comments.add(userAnswer);

            // Add review-state history entries on the reply
            const userAnswerReview: PdfPopupAnnotation = new PdfPopupAnnotation({ author: 'Smith', state: PdfAnnotationState.completed, stateModel: PdfAnnotationStateModel.review });
            userAnswerReview.modifiedDate = new Date(2015, 1, 18);
            userAnswer.reviewHistory.add(userAnswerReview);

            const userAnswerReviewJohn: PdfPopupAnnotation = new PdfPopupAnnotation({ author: 'John', state: PdfAnnotationState.accepted, stateModel: PdfAnnotationStateModel.review });
            userAnswerReviewJohn.modifiedDate = new Date(2015, 1, 18);
            userAnswer.reviewHistory.add(userAnswerReviewJohn);
            page.annotations.add(textMarkupAnnot);

            // Add various shape annotations (circle, ellipse, square, rectangle)
            const bounds: Rectangle = { x: 350, y: 170, width: 80, height: 80 };
            const circleannotation: PdfCircleAnnotation = new PdfCircleAnnotation(bounds, {
                innerColor: { r: 255, g: 255, b: 0 },
                color: { r: 255, g: 0, b: 0 }, author: 'Syncfusion', subject: 'CircleAnnotation'
            });
            circleannotation.modifiedDate = new Date(2015, 1, 18);
            circleannotation.flags = PdfAnnotationFlag.print;
            page.annotations.add(circleannotation);
            page.graphics.drawString('Circle Annotation', font, { x: 350, y: 130, width: 250, height: 30 }, brush as any);

            const ellipseannotation: PdfEllipseAnnotation = new PdfEllipseAnnotation({ x: 30, y: 150, width: 50, height: 100 }, {
                text: 'Ellipse Annotation', color: { r: 255, g: 0, b: 0 }, innerColor: { r: 255, g: 255, b: 0 }
            });
            page.graphics.drawString('Ellipse Annotation', font, { x: 30, y: 130, width: 250, height: 30 }, brush as any);
            ellipseannotation.flags = PdfAnnotationFlag.print;
            page.annotations.add(ellipseannotation);

            const squareannotation: PdfSquareAnnotation = new PdfSquareAnnotation({ x: 30, y: 300, width: 80, height: 80 }, {
                text: 'Square Annotation', innerColor: { r: 255, g: 0, b: 0 }, color: { r: 255, g: 255, b: 0 }
            });
            page.graphics.drawString('Square Annotation', font, { x: 30, y: 280, width: 250, height: 30 }, brush as any);
            squareannotation.flags = PdfAnnotationFlag.print;
            page.annotations.add(squareannotation);

            const rectannot = { x: 350, y: 320, width: 100, height: 50 };
            const rectangleannotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(rectannot, {
                text: 'Rectangle Annotation', innerColor: { r: 255, g: 0, b: 0 }, color: { r: 255, g: 255, b: 0 }
            });
            page.graphics.drawString('Rectangle Annotation', font, { x: 350, y: 280, width: 100, height: 30 }, brush as any);
            rectangleannotation.flags = PdfAnnotationFlag.print;
            page.annotations.add(rectangleannotation);

            // Line annotation with appearance and measurement example
            const lineAnnotation: PdfLineAnnotation = new PdfLineAnnotation({ x: 400, y: 350 }, { x: 550, y: 350 }, {
                text: 'Line Annotation is the one of the annotation type...', author: 'Syncfusion', subject: 'LineAnnotation'
            });
            lineAnnotation.modifiedDate = new Date(2015, 1, 18);
            lineAnnotation.text = 'PdfLineAnnotation';
            lineAnnotation.color = { r: 255, g: 0, b: 0 };
            lineAnnotation.setAppearance(true);
            page.graphics.drawString('Line Annotation', font, { x: 400, y: 420, width: 100, height: 50 }, brush as any);
            lineAnnotation.flags = PdfAnnotationFlag.print;
            page.annotations.add(lineAnnotation);

            // Polygon annotation: custom points, bounds and appearance
            const polygonannotation: PdfPolygonAnnotation = new PdfPolygonAnnotation([{ x: 50, y: 298 }, { x: 100, y: 325 }, { x: 200, y: 355 }, { x: 300, y: 230 }, { x: 180, y: 230 }], {
                text: 'Polygon Annotation', color: { r: 255, g: 0, b: 0 }, innerColor: { r: 255, g: 182, b: 193 }
            });
            polygonannotation.bounds = { x: 30, y: 210, width: 300, height: 200 };
            polygonannotation.setAppearance(true);
            page.graphics.drawString('Polygon Annotation', font, { x: 50, y: 420, width: 100, height: 30 }, brush as any);
            polygonannotation.flags = PdfAnnotationFlag.print;
            page.annotations.add(polygonannotation);

            // Free text annotation with callout lines
            const freeText: PdfFreeTextAnnotation = new PdfFreeTextAnnotation({ x: 405, y: 645, width: 80, height: 30 }, {
                textMarkUpColor: { r: 0, g: 128, b: 0 }, font: new PdfStandardFont(PdfFontFamily.helvetica, 7), text: 'Free Text with Callouts', borderColor: { r: 0, g: 0, b: 255 },
                border: new PdfAnnotationBorder({ width: 0.5 }), calloutLines: [{ x: 365, y: 700 }, { x: 379, y: 654 }, { x: 405, y: 654 }]
            });
            freeText.color = { r: 255, g: 255, b: 0 };
            freeText.border = new PdfAnnotationBorder({ width: 0.5 });
            freeText.flags = PdfAnnotationFlag.print;
            freeText.setAppearance(true);
            page.graphics.drawString('FreeText Annotation', font, { x: 400, y: 610, width: 100, height: 30 }, brush as any);
            page.annotations.add(freeText);

            const linePoints = [
                { x: 72.919, y: 136.376 },
                { x: 72.264, y: 136.376 },
                { x: 62.446, y: 142.922 },
                { x: 61.137, y: 142.922 },
                { x: 55.901, y: 139.649 },
                { x: 55.246, y: 138.34 },
                { x: 54.592, y: 132.449 },
                { x: 54.592, y: 127.867 },
                { x: 55.901, y: 125.904 },
                { x: 59.828, y: 121.976 },
                { x: 63.101, y: 121.322 },
                { x: 65.719, y: 122.631 },
                { x: 68.992, y: 125.249 },
                { x: 70.301, y: 130.485 },
                { x: 71.61, y: 133.104 },
                { x: 72.264, y: 136.376 },
                { x: 72.919, y: 140.304 },
                { x: 74.883, y: 144.885 },
                { x: 76.192, y: 150.776 },
                { x: 76.192, y: 151.431 },
                { x: 76.192, y: 152.085 },
                { x: 76.192, y: 158.631 },
                { x: 76.192, y: 159.94 },
                { x: 75.537, y: 155.358 },
                { x: 74.228, y: 150.122 },
                { x: 74.228, y: 146.195 },
                { x: 73.574, y: 141.613 },
                { x: 73.574, y: 137.685 },
                { x: 74.228, y: 132.449 },
                { x: 74.883, y: 128.522 },
                { x: 75.537, y: 124.594 },
                { x: 76.192, y: 123.285 },
                { x: 76.846, y: 122.631 },
                { x: 80.774, y: 122.631 },
                { x: 82.737, y: 123.285 },
                { x: 85.355, y: 125.249 },
                { x: 88.628, y: 129.831 },
                { x: 89.283, y: 133.104 },
                { x: 89.937, y: 137.031 },
                { x: 90.592, y: 140.958 },
                { x: 89.937, y: 142.267 },
                { x: 86.665, y: 141.613 },
                { x: 85.355, y: 140.304 },
                { x: 84.701, y: 138.34 },
                { x: 84.701, y: 137.685 },
                { x: 85.355, y: 137.031 },
                { x: 87.974, y: 135.722 },
                { x: 90.592, y: 136.376 },
                { x: 92.555, y: 137.031 },
                { x: 96.483, y: 139.649 },
                { x: 98.446, y: 140.958 },
                { x: 101.719, y: 142.922 },
                { x: 103.028, y: 142.922 },
                { x: 100.41, y: 138.34 },
                { x: 99.756, y: 134.413 },
                { x: 99.101, y: 131.14 },
                { x: 99.101, y: 128.522 },
                { x: 99.756, y: 127.213 },
                { x: 101.065, y: 125.904 },
                { x: 102.374, y: 123.94 },
                { x: 103.683, y: 123.94 },
                { x: 107.61, y: 125.904 },
                { x: 110.228, y: 129.831 },
                { x: 114.156, y: 135.067 },
                { x: 117.428, y: 140.304 },
                { x: 119.392, y: 143.576 },
                { x: 121.356, y: 144.231 },
                { x: 122.665, y: 144.231 },
                { x: 123.974, y: 142.267 },
                { x: 126.592, y: 139.649 },
                { x: 127.247, y: 140.304 },
                { x: 126.592, y: 142.922 },
                { x: 124.628, y: 143.576 },
                { x: 122.01, y: 142.922 },
                { x: 118.083, y: 141.613 },
                { x: 114.81, y: 136.376 },
                { x: 114.81, y: 131.14 },
                { x: 113.501, y: 127.213 },
                { x: 114.156, y: 125.904 },
                { x: 118.083, y: 125.904 },
                { x: 120.701, y: 126.558 },
                { x: 123.319, y: 130.485 },
                { x: 125.283, y: 136.376 },
                { x: 125.937, y: 140.304 },
                { x: 125.937, y: 142.922 },
                { x: 126.592, y: 143.576 },
                { x: 125.937, y: 135.722 },
                { x: 125.937, y: 131.794 },
                { x: 125.937, y: 131.14 },
                { x: 127.247, y: 129.176 },
                { x: 129.21, y: 127.213 },
                { x: 131.828, y: 127.213 },
                { x: 134.447, y: 128.522 },
                { x: 136.41, y: 136.376 },
                { x: 139.028, y: 150.122 },
                { x: 141.647, y: 162.558 },
                { x: 140.992, y: 163.213 },
                { x: 138.374, y: 160.595 },
                { x: 135.756, y: 153.395 },
                { x: 135.101, y: 148.158 },
                { x: 134.447, y: 140.304 },
                { x: 134.447, y: 130.485 },
                { x: 133.792, y: 124.594 },
                { x: 133.792, y: 115.431 },
                { x: 133.792, y: 110.194 },
                { x: 133.792, y: 105.612 },
                { x: 134.447, y: 105.612 },
                { x: 137.065, y: 110.194 },
                { x: 137.719, y: 116.74 },
                { x: 139.028, y: 120.013 },
                { x: 139.028, y: 123.94 },
                { x: 137.719, y: 127.213 },
                { x: 135.756, y: 130.485 },
                { x: 134.447, y: 130.485 },
                { x: 133.792, y: 130.485 },
                { x: 137.719, y: 131.794 },
                { x: 141.647, y: 135.722 },
                { x: 146.883, y: 142.922 },
                { x: 152.774, y: 153.395 },
                { x: 153.428, y: 159.286 },
                { x: 150.156, y: 159.94 },
                { x: 147.537, y: 156.667 },
                { x: 146.883, y: 148.813 },
                { x: 146.883, y: 140.958 },
                { x: 146.883, y: 134.413 },
                { x: 146.883, y: 125.904 },
                { x: 145.574, y: 118.703 },
                { x: 145.574, y: 114.776 },
                { x: 145.574, y: 112.158 },
                { x: 146.228, y: 111.503 },
                { x: 147.537, y: 111.503 },
                { x: 148.192, y: 112.158 },
                { x: 150.156, y: 112.812 },
                { x: 150.81, y: 113.467 },
                { x: 152.119, y: 114.776 },
                { x: 154.083, y: 117.394 },
                { x: 155.392, y: 119.358 },
                { x: 156.701, y: 120.667 },
                { x: 157.356, y: 121.976 },
                { x: 156.701, y: 121.322 },
                { x: 156.047, y: 120.013 },
                { x: 155.392, y: 119.358 },
                { x: 154.083, y: 117.394 },
                { x: 154.083, y: 116.74 },
                { x: 152.774, y: 114.776 },
                { x: 152.119, y: 114.121 },
                { x: 150.81, y: 113.467 },
                { x: 149.501, y: 113.467 },
                { x: 147.537, y: 112.158 },
                { x: 146.883, y: 112.158 },
                { x: 145.574, y: 111.503 },
                { x: 144.919, y: 112.158 },
                { x: 144.265, y: 114.121 },
                { x: 144.265, y: 115.431 },
                { x: 144.265, y: 116.74 },
                { x: 144.265, y: 117.394 },
                { x: 144.265, y: 118.049 },
                { x: 144.919, y: 118.703 },
                { x: 145.574, y: 120.667 },
                { x: 146.228, y: 122.631 },
                { x: 147.537, y: 123.285 },
                { x: 147.537, y: 124.594 },
                { x: 148.192, y: 125.904 },
                { x: 147.537, y: 128.522 },
                { x: 147.537, y: 129.176 },
                { x: 147.537, y: 130.485 },
                { x: 147.537, y: 132.449 },
                { x: 147.537, y: 134.413 },
                { x: 147.537, y: 136.376 },
                { x: 147.537, y: 138.34 },
                { x: 147.537, y: 138.994 },
                { x: 145.574, y: 138.994 },
                { x: 142.956, y: 138.252 }
            ];
            const inkAnnotation: PdfInkAnnotation = new PdfInkAnnotation({ x: 30, y: 580, width: 300, height: 400 }, linePoints as any);
            inkAnnotation.color = { r: 255, g: 0, b: 0 };
            page.graphics.drawString('Ink Annotation', font, { x: 30, y: 610, width: 100, height: 30 }, brush as any);
            inkAnnotation.flags = PdfAnnotationFlag.print;
            page.annotations.add(inkAnnotation);

            // Start a second page to demonstrate additional annotation types
            // (text markups, popups, measurement, rotated free text, clouds, stamps, redaction)
            const secondPage = pdfDoc.addPage();

            const string1 = 'This is TextMarkup annotation!!!';
            secondPage.graphics.drawString(string1, font, { x: 30, y: 70, width: 250, height: 30 }, brush as any);
            const textannot: PdfTextMarkupAnnotation = new PdfTextMarkupAnnotation('Strikeout', { x: 30, y: 70, width: 140, height: 11 }, {
                author: 'Annotation', opacity: 1, subject: 'pdftextmarkupannotation', textMarkUpColor: { r: 255, g: 255, b: 0 }, textMarkupType: PdfTextMarkupAnnotationType.strikeOut,
                innerColor: { r: 255, g: 0, b: 0 }
            });
            textannot.modifiedDate = new Date(2015, 1, 18);
            textannot.color = { r: 255, g: 255, b: 0 };
            secondPage.graphics.drawString('TextMarkup Annotation', font, { x: 30, y: 40, width: 250, height: 30 }, brush as any);
            textannot.flags = PdfAnnotationFlag.print;
            secondPage.annotations.add(textannot);

            // Popup annotation: a note-like annotation that can be shown/hidden
            // Here we set border radii, opacity and explicit bounds before adding
            const popupRect: Rectangle = { x: 430, y: 70, width: 30, height: 30 };
            const popupAnnotation = new PdfPopupAnnotation({ color: { r: 0, g: 128, b: 0 }, open: true });
            popupAnnotation.border.width = 4;
            popupAnnotation.border.hRadius = 20;
            popupAnnotation.border.vRadius = 30;
            popupAnnotation.opacity = 1;
            popupAnnotation.text = 'Popup Annotation';
            popupAnnotation.bounds = popupRect;
            // Generate appearance stream for the popup so viewers render it correctly
            popupAnnotation.setAppearance(true);
            secondPage.graphics.drawString('Popup Annotation', font, { x: 400, y: 40, width: 100, height: 30 }, brush as any);
            popupAnnotation.flags = PdfAnnotationFlag.print;
            secondPage.annotations.add(popupAnnotation);

            // Line measurement annotation: demonstrates measurement unit and appearance
            // When `measure` is true the annotation can display real-world units (inches here)
            const border: PdfAnnotationBorder = new PdfAnnotationBorder({ width: 2 });
            const lineMeasureAnnot: PdfLineAnnotation = new PdfLineAnnotation({ x: 400, y: 630 }, { x: 550, y: 630 }, {
                author: 'Syncfusion', subject: 'LineAnnotation', measurementUnit: PdfMeasurementUnit.inch, color: { r: 255, g: 0, b: 0 }, border: border
            });
            lineMeasureAnnot.modifiedDate = new Date(2015, 1, 18);
            lineMeasureAnnot.measure = true;
            // Create the visual appearance for consistency across PDF viewers
            lineMeasureAnnot.setAppearance(true);
            secondPage.graphics.drawString('Line Measurement Annotation', font, { x: 370, y: 130, width: 250, height: 50 }, brush as any);
            lineMeasureAnnot.flags = PdfAnnotationFlag.print;
            secondPage.annotations.add(lineMeasureAnnot);

            // Rotated free text annotation: demonstrates rotation and callout lines
            // `rotationAngle` affects how annotation content is rendered.
            const freeText0: PdfFreeTextAnnotation = new PdfFreeTextAnnotation({ x: 80, y: 160, width: 100, height: 50 }, {
                textMarkUpColor: { r: 0, g: 128, b: 0 }, font: new PdfStandardFont(PdfFontFamily.helvetica, 7), text: 'Free Text with Callouts', borderColor: { r: 0, g: 0, b: 255 },
                border: new PdfAnnotationBorder({ width: 0.5 }), calloutLines: [{ x: 45, y: 220 }, { x: 60, y: 175 }, { x: 80, y: 175 }]
            });
            freeText0.flags = PdfAnnotationFlag.print;
            freeText0.rotationAngle = PdfRotationAngle.angle90;
            freeText0.color = { r: 255, g: 255, b: 0 };
            freeText0.setAppearance(true);
            secondPage.graphics.drawString('Rotated FreeText Annotation', font, { x: 40, y: 130, width: 150, height: 30 }, brush as any);
            secondPage.annotations.add(freeText0);

            // Cloud-style rectangle: demonstrates border effects (cloudy edges)
            const cloudannotation: PdfRectangleAnnotation = new PdfRectangleAnnotation({ x: 30, y: 300, width: 100, height: 50 }, {
                text: 'Rectangle Cloud Annotation', color: { r: 255, g: 0, b: 0 }, innerColor: { r: 0, g: 0, b: 255 }, border: new PdfAnnotationBorder({ width: 1 })
            });
            let bordereffect = new PdfBorderEffect();
            bordereffect.intensity = 2;
            bordereffect.style = PdfBorderEffectStyle.cloudy;
            cloudannotation.borderEffect = bordereffect;
            cloudannotation.border.width = 1;
            cloudannotation.setAppearance(true);
            secondPage.graphics.drawString('Rectangle Cloud Annotation', font, { x: 40, y: 260, width: 300, height: 50 }, brush as any);
            cloudannotation.flags = PdfAnnotationFlag.print;
            secondPage.annotations.add(cloudannotation);

            // Rubber stamp annotation: used to visually mark a page with a stamp-like graphic
            const rubberStampAnnotation: PdfRubberStampAnnotation = new PdfRubberStampAnnotation({ x: 355, y: 310, width: 150, height: 50 }, {
                text: 'Rubber Stamp Annotation', author: 'Syncfusion', color: { r: 255, g: 0, b: 0 }
            });
            rubberStampAnnotation.modifiedDate = new Date(2015, 1, 18);
            rubberStampAnnotation.flags = PdfAnnotationFlag.print;
            secondPage.graphics.drawString('Rubber Stamp Annotation', font, { x: 350, y: 260, width: 200, height: 30 }, brush as any);
            secondPage.annotations.add(rubberStampAnnotation);

            const cloudpolypoints = [{ x: 436, y: 254 }, { x: 491, y: 324 }, { x: 461, y: 374 }, { x: 411, y: 344 }, { x: 391, y: 294 }, { x: 431, y: 264 }, { x: 436, y: 254 }];
            // Polygon cloud annotation: polygon with cloudy border effect
            const polygonCloud = new PdfPolygonAnnotation(cloudpolypoints, {
                text: 'Polygon Cloud Annotation', color: { r: 255, g: 0, b: 0 }, innerColor: { r: 0, g: 0, b: 255 }, border: new PdfAnnotationBorder({ width: 1 })
            });
            polygonCloud.flags = PdfAnnotationFlag.print;
            bordereffect.intensity = 2;
            bordereffect.style = PdfBorderEffectStyle.cloudy;
            polygonCloud.borderEffect = bordereffect;
            polygonCloud.setAppearance(true);
            secondPage.graphics.drawString('Polygon Cloud Annotation', font, { x: 350, y: 390, width: 150, height: 30 }, brush as any);
            secondPage.annotations.add(polygonCloud);

            // Redaction annotation: shows how to mark content as redacted and overlay text
            // `overlayText` with `repeatText` simulates stamping the redaction area
            const redactionAnnotation2 = new PdfRedactionAnnotation({ x: 40, y: 430, width: 100, height: 50 }, {
                borderColor: { r: 255, g: 0, b: 0 }, innerColor: { r: 255, g: 165, b: 0 }, textColor: { r: 0, g: 128, b: 0 }, text: 'Redaction Annotation', font: new PdfStandardFont(PdfFontFamily.helvetica, 13), overlayText: 'REDACTED', repeatText: true, textAlignment: PdfTextAlignment.left
            });
            redactionAnnotation2.setAppearance(true);
            secondPage.graphics.drawString('Redaction Annotation', font, { x: 40, y: 390, width: 100, height: 50 }, brush as any);
            redactionAnnotation2.flags = PdfAnnotationFlag.print;
            secondPage.annotations.add(redactionAnnotation2);

            // Finalize and save the document. If the UI checkbox requests flattening,
            // set `flatten` and re-load the saved bytes into a new PdfDocument to
            // ensure annotations become part of page content (appearance streams baked in).
            if (this.getFlattenCheckboxChecked()) {
                const data = pdfDoc.save();
                // Reload and save again to produce a flattened output file
                let loadedDocument = new PdfDocument(data);
                loadedDocument.flatten = true;
                loadedDocument.save('AnnotationFlatten.pdf');
                loadedDocument.destroy();
            } else {
                // Save as a normal PDF that still contains live annotations
                pdfDoc.save('Annotation.pdf');
                pdfDoc.destroy();
            }
        } catch (err: any) {
            this.showNote(err?.message || 'Error while creating annotations PDF.');
        }
    }

    // Flattens an uploaded PDF file (reads the file from the file input state)
    async flattenUploadedPdf(): Promise<void> {
        this.hideNote();
        try {
            // If user already selected file and we have bytes, use them; otherwise try to read from the DOM
            let bytes = this.fileBytes;
            if (!bytes) {
                const fileEl = document.getElementById('file') as HTMLInputElement | null;
                if (!fileEl || !fileEl.files || fileEl.files.length === 0) {
                    this.showNote('Please select a PDF file to flatten.');
                    return;
                }
                const file = fileEl.files[0];
                const buf = await file.arrayBuffer();
                bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
            }
            const pdfDoc = new PdfDocument(bytes as any);
            pdfDoc.flatten = true;
            pdfDoc.save('AnnotationFlatten.pdf');
            pdfDoc.destroy();
        } catch (err: any) {
            this.showNote(err?.message || 'Error while flattening PDF.');
        }
    }
}
