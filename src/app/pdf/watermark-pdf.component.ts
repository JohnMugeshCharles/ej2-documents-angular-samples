import { Component, OnInit } from '@angular/core';
import { Button } from '@syncfusion/ej2-buttons';
import { TextBox } from '@syncfusion/ej2-inputs';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { PdfDocument, PdfFontFamily, PdfFontStyle, PdfBrush, PdfBitmap } from '@syncfusion/ej2-pdf';

/**
 * Watermark PDF component
 * Converted from the sample script: creates text/image watermarks on an
 * existing PDF and triggers a download of the watermarked file.
 */
@Component({
    selector: 'app-watermark-pdf',
    templateUrl: './watermark-pdf.html',
    standalone: true,
})
export class PdfWatermarkComponent implements OnInit {
    // Default names and resource URLs used by the sample
    private readonly defaultPdfName = 'http-succinctly.pdf';
    private readonly input1 = 'https://cdn.syncfusion.com/content/pdf-resources/http-succintly.pdf';
    private readonly defaultStampText = 'Created using Syncfusion PDF library';
    private readonly defaultTransparency = 0.25;

    constructor() { }

    ngOnInit(): void {
        // Expose and initialize the sample on component mount. The original
        // sample exposes a global `default` function; keep compatibility.
        (window as any).default = this.initialize.bind(this);
        this.initialize();
    }

    /** Initialize UI widgets and wire up DOM handlers. */
    initialize(): void {

        // Create Syncfusion widgets used in the sample
        const watermarkBtn = new Button({}, '#watermarkBtn');
        new TextBox({ placeholder: this.defaultStampText, width: '420px', showClearButton: true }, '#stampText');

        // Setup transparency dropdown depending on whether options exist in DOM
        const transparencyEl = document.getElementById('transparency') as HTMLSelectElement | null;
        const transparencyOpts = transparencyEl ? Array.from(transparencyEl.options).map(o => o.value) : [];
        if (transparencyOpts.length) {
            new DropDownList({ value: (transparencyEl as HTMLSelectElement)?.value || '25', width: '120px' }, '#transparency');
        } else {
            new DropDownList({
                dataSource: [
                    { text: '25', value: '25' },
                    { text: '50', value: '50' },
                    { text: '75', value: '75' },
                    { text: '100', value: '100' }
                ],
                fields: { text: 'text', value: 'value' },
                placeholder: 'Select',
                width: '120px'
            }, '#transparency');
        }

        // Wire the watermark button click handler
        watermarkBtn.element.onclick = () => this.onClickWatermarkBtn();
        (window as any).onClickWatermarkBtn = this.onClickWatermarkBtn.bind(this);

        // Wire file input UI helpers for name display and image row visibility
        this.setupFileUiHandlers();
    }

    /** Setup file input change handlers to update file name displays. */
    private setupFileUiHandlers(): void {
        const pdfFileEl = document.getElementById('pdfFile') as HTMLInputElement | null;
        const pdfNameEl = document.getElementById('pdfFileName') as HTMLSpanElement | null;
        const useImageEl = document.getElementById('useImage') as HTMLInputElement | null;
        const imageRow = document.getElementById('imageRow') as HTMLDivElement | null;
        const imgFileEl = document.getElementById('imgFile') as HTMLInputElement | null;
        const imgNameEl = document.getElementById('imgFileName') as HTMLSpanElement | null;

        if (pdfNameEl) {
            pdfNameEl.textContent = this.defaultPdfName;
        }
        if (imgNameEl) {
            imgNameEl.textContent = 'No file chosen';
        }
        if (pdfFileEl && pdfNameEl) {
            pdfFileEl.addEventListener('change', () => {
                const f = pdfFileEl.files?.[0];
                pdfNameEl.textContent = f ? f.name : this.defaultPdfName;
            });
        }
        if (useImageEl && imageRow) {
            useImageEl.addEventListener('change', () => {
                imageRow.style.display = useImageEl.checked ? 'flex' : 'none';
            });
        }
        if (imgFileEl && imgNameEl) {
            imgFileEl.addEventListener('change', () => {
                const f = imgFileEl.files?.[0];
                imgNameEl.textContent = f ? f.name : 'No file chosen';
            });
        }
    }

    /** Read UI values (files, text, transparency, checkbox) from DOM.
     * This mirrors the original sample's approach and returns an object
     * containing the parsed values.
     */
    private readUIValues() {
        const pdfFileEl = document.getElementById('pdfFile') as HTMLInputElement | null;
        const imgFileEl = document.getElementById('imgFile') as HTMLInputElement | null;
        const stampTextEl = document.getElementById('stampText') as HTMLElement | null;
        const transparencyEl = document.getElementById('transparency') as HTMLElement | null;
        const useImageEl = document.getElementById('useImage') as HTMLInputElement | null;

        function controlValue(el: HTMLElement | null, fallback: string) {
            if (!el) return fallback;
            const inst = (el as any).ej2_instances && (el as any).ej2_instances[0];
            if (inst && typeof inst.value !== 'undefined') return String(inst.value || fallback);
            return ((el as HTMLInputElement).value || fallback);
        }

        const stampText = controlValue(stampTextEl, this.defaultStampText).trim();
        const transparencyRaw = parseFloat(controlValue(transparencyEl, '')) || (this.defaultTransparency * 100);
        const transparency = (transparencyRaw / 100) || this.defaultTransparency;
        const useImage = !!useImageEl?.checked;
        const userPdf = pdfFileEl?.files?.[0] || null;
        const userImg = imgFileEl?.files?.[0] || null;
        return { userPdf, userImg, stampText, transparency, useImage };
    }

    /** Show an alert message in the sample's alert area. */
    private showAlert(msg: string) {
        const alertArea = document.getElementById('alertArea') as HTMLDivElement | null;
        if (!alertArea) {
            return;
        }
        alertArea.textContent = msg;
        alertArea.style.display = 'block';
    }

    /** Clear any existing alert message. */
    private clearAlert() {
        const alertArea = document.getElementById('alertArea') as HTMLDivElement | null;
        if (!alertArea) return;
        alertArea.textContent = '';
        alertArea.style.display = 'none';
    }

    /** Handler called when the watermark button is clicked. */
    onClickWatermarkBtn(): void {
        this.clearAlert();
        const { useImage, userImg, stampText } = this.readUIValues();
        if (useImage && !userImg) {
            this.showAlert('Please select a valid image file to add an image watermark.');
            return;
        }
        if (!useImage && (!stampText || !stampText.trim())) {
            this.showAlert('Please enter stamping text or enable image watermark.');
            return;
        }
        this.createWatermarkedPdf().catch((err) => {
            console.error(err);
            this.showAlert('Failed to process the PDF. See console for details.');
        });
    }

    /** Create a watermarked PDF using the current UI values. */
    private async createWatermarkedPdf(): Promise<void> {
        const { userPdf, userImg, stampText, transparency, useImage } = this.readUIValues();
        const pdfNameEl = document.getElementById('pdfFileName') as HTMLSpanElement | null;
        if (pdfNameEl) {
            pdfNameEl.textContent = userPdf ? userPdf.name : this.defaultPdfName;
        }

        const pdfBytes = await this.getPdfBytesOrDefault(userPdf);
        const imageBytes = useImage && userImg ? await this.getImageBytes(userImg) : null;

        // Load the existing PDF into the PdfDocument API
        const pdf = new PdfDocument(pdfBytes);

        // Choose a font size that fits within max width by measuring and
        // reducing the font size until it fits.
        const maxWidth = 600;
        let font = pdf.embedFont(PdfFontFamily.helvetica, 36, PdfFontStyle.regular);
        let textSize = font.measureString(stampText);
        while (textSize.width > maxWidth && font.size > 6) {
            font = pdf.embedFont(PdfFontFamily.helvetica, font.size - 1, PdfFontStyle.regular);
            textSize = font.measureString(stampText);
        }

        const pageCount = pdf.pageCount || 0;

        // Draw text watermark across all pages if provided
        if (stampText && stampText.trim()) {
            for (let i = 0; i < pageCount; i++) {
                const page = pdf.getPage(i);
                const g = page.graphics;
                g.save();
                g.setTransparency(transparency);
                const width = g.clientSize.width;
                const height = g.clientSize.height;
                g.translateTransform({ x: width / 2, y: height / 2 });
                g.rotateTransform(-45);
                const brush = new PdfBrush({ r: 255, g: 0, b: 0 });
                g.drawString(
                    stampText,
                    font,
                    { x: -(textSize.width / 2), y: -(textSize.height / 2), width, height },
                    brush
                );
                g.restore();
            }
        }

        // Draw image watermark across all pages if requested
        if (useImage && imageBytes) {
            const bmp = new PdfBitmap(imageBytes);
            for (let i = 0; i < pageCount; i++) {
                const page = pdf.getPage(i);
                const g = page.graphics;
                g.setTransparency(transparency);
                const width = g.clientSize.width;
                const height = g.clientSize.height;
                g.drawImage(bmp, { x: 0, y: 0, width, height });
            }
        }

        // Save and trigger download of the watermarked PDF
        pdf.save('Watermarked.pdf');
        pdf.destroy();
    }

    /** Read the user-supplied PDF or fetch the default sample PDF. */
    private async getPdfBytesOrDefault(userPdf: File | null): Promise<Uint8Array> {
        if (userPdf) {
            const buf = await userPdf.arrayBuffer();
            const bytes = new Uint8Array(buf);
            const head = new TextDecoder('ascii').decode(bytes.slice(0, 5));
            if (head !== '%PDF-') throw new Error('Selected file is not a valid PDF.');
            return bytes;
        } else {
            const res = await fetch(this.input1);
            if (!res.ok) throw new Error(`Failed to fetch default PDF: ${res.status} ${res.statusText}`);
            const buf = await res.arrayBuffer();
            const bytes = new Uint8Array(buf);
            const head = new TextDecoder('ascii').decode(bytes.slice(0, 5));
            if (head !== '%PDF-') throw new Error('Default PDF is not valid.');
            return bytes;
        }
    }

    /** Read raw bytes from an image file. */
    private async getImageBytes(userImg: File): Promise<Uint8Array> {
        const buf = await userImg.arrayBuffer();
        return new Uint8Array(buf);
    }
}