import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '@syncfusion/ej2-buttons';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import {
    PdfDocument,
    PdfPageSettings,
    PdfMargins,
    PdfPen,
    PdfBrush,
    PdfFontFamily,
    PdfFontStyle,
    PdfPageOrientation,
    PdfRotationAngle
} from '@syncfusion/ej2-pdf';
import { Input, TextBoxModule } from '@syncfusion/ej2-angular-inputs';

@Component({
    selector: 'control-content',
    standalone: true,
    imports: [CommonModule, FormsModule, TextBoxModule],
    templateUrl: './page-settings.html'
})
export class PdfPageSettingsComponent implements AfterViewInit {
    ngAfterViewInit(): void {
        // Initialize Syncfusion buttons
        try {
            new Button({}, '#normalbtn');
            new Button({}, '#addPage');
        } catch (e) {
            // ignore if buttons already initialized in demo environment
        }

        function optionsFromSelect(id: string): string[] {
            const el = document.getElementById(id) as HTMLSelectElement | null;
            if (!el) return [];
            const opts: string[] = [];
            for (let i = 0; i < el.options.length; i++) opts.push(el.options[i].text);
            return opts;
        }

        const psOptions = optionsFromSelect('ps');
        const poOptions = optionsFromSelect('po');
        const pmOptions = optionsFromSelect('pm');
        const prOptions = optionsFromSelect('pr');

        const psConfig: any = { value: (document.getElementById('ps') as HTMLSelectElement)?.value || 'A4', width: '220px' };
        if (!psOptions.length) psConfig.dataSource = ['Letter', 'Legal', 'A3', 'A4', 'A5', 'B4', 'B5'];
        new DropDownList(psConfig, '#ps');

        const poConfig: any = { value: (document.getElementById('po') as HTMLSelectElement)?.value || 'Portrait', width: '220px' };
        if (!poOptions.length) poConfig.dataSource = ['Portrait', 'Landscape'];
        new DropDownList(poConfig, '#po');

        const pmConfig: any = { value: (document.getElementById('pm') as HTMLSelectElement)?.value || 'No margin', width: '220px' };
        if (!pmOptions.length) pmConfig.dataSource = ['No margin', 'Large', 'Small'];
        new DropDownList(pmConfig, '#pm');

        const prConfig: any = { value: (document.getElementById('pr') as HTMLSelectElement)?.value || '0', width: '220px' };
        if (!prOptions.length) prConfig.dataSource = ['0', '90', '180', '270'];
        new DropDownList(prConfig, '#pr');

        const addButton = document.getElementById('addPage') as HTMLButtonElement | null;
        const pageCountEl = document.getElementById('pageCount') as HTMLInputElement | null;
        Input.createInput ({
            element: pageCountEl
        });
        if (addButton && pageCountEl) {
            addButton.addEventListener('click', () => {
                const current = parseInt(pageCountEl.value || '1', 10);
                pageCountEl.value = String(Math.max(1, current + 1));
            });
        }

        // expose createPdf to global window so onclick handler in template can use it
        (window as any).createPdf = this.createPdf.bind(this);
    }

    private createPdf(): void {
        const { ps, po, pm, pr, pageCount } = this.readUI();
        const settings = new PdfPageSettings();
        const size = this.getPageSize(ps);
        settings.size = size;
        settings.orientation = (po === 'Portrait' ? PdfPageOrientation.portrait : PdfPageOrientation.landscape);
        settings.rotation = this.getRotationAngle(String(pr));
        settings.margins = new PdfMargins(this.getMargin(pm));

        const pdf = new PdfDocument();

        const pen = new PdfPen({ r: 0, g: 0, b: 0 }, 6);
        const lightGreenBrush = new PdfBrush({ r: 144, g: 238, b: 144 });
        const textBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const footerFont = pdf.embedFont(PdfFontFamily.helvetica, 16, PdfFontStyle.regular);

        for (let i = 0; i < pageCount; i++) {
            let page: any;
            if ((pdf as any).addSection) {
                const section = (pdf as any).addSection(settings);
                if (section.pageSettings && section.pageSettings.transition) {
                    section.pageSettings.transition.pageDuration = 1;
                    section.pageSettings.transition.duration = 1;
                    if ((pdf as any).PdfTransitionStyle && typeof (pdf as any).PdfTransitionStyle.box !== 'undefined') {
                        section.pageSettings.transition.style = (pdf as any).PdfTransitionStyle.box;
                    } else {
                        section.pageSettings.transition.style = 'Box';
                    }
                }
                page = section.addPage();
            } else {
                page = pdf.addPage(settings);
            }
            const g = page.graphics;
            const client = g.clientSize;
            g.drawRectangle({ x: 0, y: 0, width: client.width, height: client.height }, lightGreenBrush);
            g.drawLine(pen, { x: 0, y: 100 }, { x: Math.min(300, client.width), y: 100 });
            const footerText = `Page ${i + 1} of ${pageCount}`;
            g.drawString(footerText, footerFont, { x: client.width - 150, y: client.height - 40, width: 140, height: 30 }, textBrush);
        }

        pdf.save('PageSettings.pdf');
        pdf.destroy();
    }

    private getPageSize(name: string) {
        const PAGE_SIZES: Record<string, { width: number; height: number }> = {
            Letter: { width: 612, height: 792 },
            Legal: { width: 612, height: 1008 },
            A3: { width: 842, height: 1191 },
            A4: { width: 595, height: 842 },
            A5: { width: 420, height: 595 },
            B4: { width: 729, height: 1032 },
            B5: { width: 516, height: 729 }
        };
        const key = (name || '').trim();
        return PAGE_SIZES[key] ?? PAGE_SIZES.A4;
    }

    private getMargin(name: string): number {
        const key = (name || '').trim();
        if (key === 'Small') return 20;
        if (key === 'Large') return 40;
        return 0;
    }

    private getRotationAngle(deg: string): PdfRotationAngle {
        switch ((deg || '').trim()) {
            case '90': return PdfRotationAngle.angle90;
            case '180': return PdfRotationAngle.angle180;
            case '270': return PdfRotationAngle.angle270;
            default: return PdfRotationAngle.angle0;
        }
    }

    private readUI() {
        const controlValue = (id: string, fallback: string) => {
            const el = document.getElementById(id) as HTMLElement | null;
            if (!el) return fallback;
            const inst = (el as any).ej2_instances && (el as any).ej2_instances[0];
            if (inst && typeof inst.value !== 'undefined') return String(inst.value || fallback);
            return ((el as HTMLInputElement).value || fallback);
        };

        const ps = controlValue('ps', 'A4');
        const po = controlValue('po', 'Portrait');
        const pm = controlValue('pm', 'No margin');
        const pr = controlValue('pr', '0');
        const pageCount = parseInt((document.getElementById('pageCount') as HTMLInputElement)?.value ?? '1', 10);
        return { ps, po, pm, pr, pageCount: Math.max(1, pageCount || 1) };
    }
}