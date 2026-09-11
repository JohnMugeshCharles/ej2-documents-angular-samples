import { Component, ViewEncapsulation, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {
    PdfViewerComponent, LinkAnnotationService, BookmarkViewService, MagnificationService,
    ToolbarService, NavigationService, TextSelectionService, PrintService, AnnotationService,
    PdfViewerModule, LoadEventArgs, UnloadEventArgs, RectangleSettings
} from '@syncfusion/ej2-angular-pdfviewer';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { MultiSelectComponent, MultiSelectModule, CheckBoxSelectionService, DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { SplitButtonComponent, SplitButtonModule, ItemModel } from '@syncfusion/ej2-angular-splitbuttons';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { SBDescriptionComponent } from '../common/dp.component';
import { SBActionDescriptionComponent } from '../common/adp.component';
import { Browser } from '@syncfusion/ej2-base';

@Component({
    selector: 'control-content',
    templateUrl: 'pdf-text-extractor.html',
    encapsulation: ViewEncapsulation.None,
    providers: [
        LinkAnnotationService, BookmarkViewService, MagnificationService, ToolbarService,
        NavigationService, TextSelectionService, PrintService, AnnotationService,
        CheckBoxSelectionService
    ],
    styleUrls: ['pdfviewer.component.css'],
    standalone: true,
    imports: [
        ToolbarModule,
        PdfViewerModule,
        DialogModule,
        DropDownListModule,
        MultiSelectModule,
        ButtonModule,
        SplitButtonModule,
        SBActionDescriptionComponent,
        SBDescriptionComponent
    ],
})
export class PdfTextExtractorComponent implements OnInit, AfterViewInit {
    @ViewChild('pdfviewer') public pdfviewerControl!: PdfViewerComponent;
    @ViewChild('pageSelector') public pageSelector!: MultiSelectComponent;
    @ViewChild('desktopSelectAreaBtn') public desktopSelectAreaBtn!: SplitButtonComponent;
    @ViewChild('mobileSelectAreaBtn') public mobileSelectAreaBtn!: SplitButtonComponent;

    public document: string = 'https://cdn.syncfusion.com/content/pdf/pdf-succinctly.pdf';
    public resource: string = 'https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib';
    public contextMenuOption: string = 'None';
    public rectangleSettings: RectangleSettings = {
        author: 'Guest', fillColor: 'transparent', strokeColor: '#0078D4', thickness: 2, opacity: 1
    } as RectangleSettings;
    public pageFields: object = { text: 'text', value: 'value' };
    public pageOptions: any[] = [];
    public dialogButtons: any[] = [
        { click: this.closeDialog.bind(this), buttonModel: { content: 'Cancel', cssClass: 'e-outline' } },
        { click: this.handleExtractClick.bind(this), buttonModel: { content: 'Extract', isPrimary: true } }
    ];
    public selectAreaItems: ItemModel[] = [{ text: 'Extract Selected Text', id: 'extractSelectedText' }];

    private extractionMode: string = 'direct';
    private pageTexts: { page: number; text: string }[] = [];
    private totalPages: number = 0;
    private isLoading: boolean = false;
    private runtimeRectangles: any[] = [];
    private selectedArea: any = null;
    private isMobile: boolean = Browser.isDevice || window.innerWidth <= 768;

    // UI strings (mirrors JS sample UI strings)
    private uiStrings = {
        selectArea: 'Select Area',
        extractSelectedText: 'Extract selected text',
        extractText: 'Extract Text',
        previousPage: 'Previous Page',
        nextPage: 'Next Page',
        zoomIn: 'Zoom In',
        zoomOut: 'Zoom Out',
        textSelection: 'Text Selection',
        pan: 'Pan',
        print: 'Print',
        cancel: 'Cancel',
        extract: 'Extract',
        copy: 'Copy to clipboard',
        copied: 'Copied!',
        currentPage: 'Current page',
        noPage: 'No page',
        allPages: 'All pages',
        noPageSelected: 'No page selected',
        noTextSelected: 'No text selected'
    };

    ngOnInit(): void {
        const fileInput = document.getElementById('fileUpload');
        if (fileInput) {
            fileInput.addEventListener('change', (e: any) => this.readFile(e));
        }
    }

ngAfterViewInit(): void {
        this.updateToolbarVisibility();
        window.addEventListener('resize', () => this.updateToolbarVisibility());
        this.attachCopyButtonListener();
        this.refreshPageOptions();
    }

    private attachCopyButtonListener(): void {
        const copyBtn = document.getElementById('dialogClipboardCopyBtn');
        if (copyBtn && !(copyBtn as any).__bound) {
            copyBtn.addEventListener('click', () => this.handleCopyClick());
            (copyBtn as any).__bound = true;
        }
    }

    private handleContainerClick = (event: Event): void => {
        const target = event.target as HTMLElement | null;
        if (target && target.closest('#dialogClipboardCopyBtn')) {
            this.handleCopyClick();
        }
    };
    // File open/save
    private readFile(e: any): void {
        const file = e.target.files && e.target.files[0];
        if (!file || !this.pdfviewerControl) { return; }
        const reader = new FileReader();
        reader.onload = (ev: any) => {
            this.runtimeRectangles = [];
            this.selectedArea = null;
            this.pdfviewerControl.documentPath = ev.currentTarget.result;
            this.pdfviewerControl.fileName = file.name;
            this.pdfviewerControl.downloadFileName = file.name;
        };
        reader.readAsDataURL(file);
    }

    // Per-item toolbar click handlers
    public onFileOpenClick(_e?: any): void {
        const fu = document.getElementById('fileUpload') as HTMLInputElement | null;
        if (fu) { fu.click(); }
    }

    public onSaveClick(_e?: any): void {
        if (this.pdfviewerControl) { this.pdfviewerControl.download(); }
    }

    public onPrintClick(_e?: any): void {
        if (this.pdfviewerControl && this.pdfviewerControl.print) { this.pdfviewerControl.print.print(); }
    }

    public onPrevPageClick(_e?: any): void {
        if (this.pdfviewerControl && this.pdfviewerControl.navigation) {
            this.pdfviewerControl.navigation.goToPreviousPage();
        }
    }

    public onNextPageClick(_e?: any): void {
        if (this.pdfviewerControl && this.pdfviewerControl.navigation) {
            this.pdfviewerControl.navigation.goToNextPage();
        }
    }

    public onZoomInClick(_e?: any): void {
        if (this.pdfviewerControl && this.pdfviewerControl.magnification) {
            this.pdfviewerControl.magnification.zoomIn();
        }
    }

    public onZoomOutClick(_e?: any): void {
        if (this.pdfviewerControl && this.pdfviewerControl.magnification) {
            this.pdfviewerControl.magnification.zoomOut();
        }
    }

    public onTextSelectionClick(_e?: any): void {
        if (this.pdfviewerControl) { this.pdfviewerControl.interactionMode = 'TextSelection'; }
        const selectEl = document.getElementById('text_selection_tool');
        const panEl = document.getElementById('pan_tool');
        if (selectEl) { selectEl.classList.add('e-pv-tbar-btn', 'e-pv-select'); }
        if (panEl) { panEl.classList.remove('e-pv-select'); }
    }

    public onPanClick(_e?: any): void {
        if (this.pdfviewerControl) { this.pdfviewerControl.interactionMode = 'Pan'; }
        const panEl = document.getElementById('pan_tool');
        const selectEl = document.getElementById('text_selection_tool');
        if (panEl) { panEl.classList.add('e-pv-tbar-btn', 'e-pv-select'); }
        if (selectEl) { selectEl.classList.remove('e-pv-select'); }
    }

    public onExtractTextClick(_e?: any): void {
        this.onExtractPageText();
    }

    // Toolbar (clicked) fallback handlers
    public onDesktopToolbarClick(args: any): void {
        const id = args && args.item && args.item.id;
        if (!id) { return; }
        const map: { [key: string]: (() => void) | undefined } = {
            file_Open: () => this.onFileOpenClick(),
            save: () => this.onSaveClick(),
            previous_page: () => this.onPrevPageClick(),
            next_page: () => this.onNextPageClick(),
            zoom_in: () => this.onZoomInClick(),
            zoom_out: () => this.onZoomOutClick(),
            extractText: () => this.onExtractTextClick(),
            print: () => this.onPrintClick()
        };
        const fn = map[id];
        if (fn) { fn(); }
        if (id === 'text_selection_tool') {
            const selectedItem = document.getElementById(args.item && args.item.id || '');
            const panTool = document.getElementById('pan_tool');
            if (selectedItem) { selectedItem.classList.add('e-pv-tbar-btn', 'e-pv-select'); }
            if (panTool) { panTool.classList.remove('e-pv-select'); }
        } else if (id === 'pan_tool') {
            const selectedItem = document.getElementById(args.item && args.item.id || '');
            const selectTool = document.getElementById('text_selection_tool');
            if (selectedItem) { selectedItem.classList.add('e-pv-tbar-btn', 'e-pv-select'); }
            if (selectTool) { selectTool.classList.remove('e-pv-select'); }
        }
    }

    public onMobileToolbarClick(args: any): void {
        const id = args && args.item && args.item.id;
        if (!id) { return; }
        const map: { [key: string]: (() => void) | undefined } = {
            mobilePreviousPage: () => this.onPrevPageClick(),
            mobileNextPage: () => this.onNextPageClick(),
            mobileZoomIn: () => this.onZoomInClick(),
            mobileZoomOut: () => this.onZoomOutClick(),
            mobileSelection: () => this.onTextSelectionClick(),
            mobilePan: () => this.onPanClick(),
            mobileExtractText: () => this.onExtractTextClick(),
            mobilePrint: () => this.onPrintClick()
        };
        const fn = map[id];
        if (fn) { fn(); }
    }

    // Select Area (SplitButton) wiring
    public onSelectAreaItemSelect(args: any): void {
        if (args && args.item && args.item.id === 'extractSelectedText') {
            const hasRectangleAnnotation = this.pdfviewerControl && (this.pdfviewerControl as any).annotationCollection
                ? (this.pdfviewerControl as any).annotationCollection.some((annotation: any) =>
                    annotation.shapeAnnotationType === 'Square' ||
                    annotation.shapeAnnotationType === 'Rectangle')
                : false;
            if (!hasRectangleAnnotation) { return; }
            this.onExtractSelectedAreaText();
        }
    }

 public handleSelectArea(): void {
    
    this.pdfviewerControl.annotation.setAnnotationMode('Rectangle');
}
    // Annotation/Document lifecycle
    public onAnnotationAdd(args: any): void {
        if (args.annotationType === 'Rectangle') {
            this.runtimeRectangles.push({
                pageIndex: args.pageIndex,
                bounds: args.bounds || args.annotationBound,
                annotation: args.annotation
            });
            if (args.annotationSettings) {
                args.annotationSettings.strokeColor = '#0078D4';
                args.annotationSettings.fillColor = 'transparent';
                args.annotationSettings.thickness = 2;
            }
            if (args.annotation) {
                args.annotation.strokeColor = '#0078D4';
                args.annotation.fillColor = 'transparent';
                args.annotation.thickness = 2;
            }
            const bounds = this.getBounds(args.annotationBound || args.bounds);
            if (bounds) {
                this.selectedArea = bounds;
                this.pdfviewerControl.annotation.setAnnotationMode('None');
            }
        }
    }

    public onDocumentLoad(e: LoadEventArgs): void {
        this.totalPages = (e && e.documentName && this.pdfviewerControl)
            ? this.pdfviewerControl.pageCount || 0
            : 0;
        const selectTool = document.getElementById('text_selection_tool');
        if (selectTool) {
            selectTool.classList.add('e-pv-tbar-btn', 'e-pv-select');
        }
        const panTool = document.getElementById('pan_tool');
        if (panTool) {
            panTool.classList.remove('e-pv-select');
        }
        this.refreshPageOptions();
        this.runtimeRectangles = [];
        this.selectedArea = null;
    }

    public onDocumentUnload(_e: UnloadEventArgs): void {
        this.runtimeRectangles = [];
        this.selectedArea = null;
        this.refreshPageOptions();
    }

    public onPageChange(_e: any): void {
        this.refreshPageOptions();
    }

    // Direct (page) extraction
    public onExtractPageText(): void {
        this.extractionMode = 'direct';
        this.totalPages = this.pdfviewerControl ? this.pdfviewerControl.pageCount || 0 : 0;
        this.refreshPageOptions();
        this.performExtraction(new Set<number>([0]));
        // Show the dialog after a microtask so the panel can refresh.
        setTimeout(() => {
            const dialog = (document.getElementById('extractTextDialog') as any).ej2_instances[0];
            if (dialog) { dialog.show(); }
            setTimeout(() => {
                if (this.pageSelector) {
                    this.pageSelector.value = ['current'];
                    (this.pageSelector as any).dataBind();
                }
            }, 100);
        }, 50);
    }

    private performExtraction(pagesToExtract: Set<number>): void {
        this.isLoading = true;
        this.pageTexts = [];
        this.renderDialogBody();

        let pagesToProcess: number[] = Array.from(pagesToExtract).sort((a, b) => a - b);
        if (pagesToProcess.indexOf(0) !== -1) {
            const seen = new Set<number>();
            const current = (this.pdfviewerControl && this.pdfviewerControl.currentPageNumber) || 1;
            seen.add(current);
            pagesToProcess.forEach((p) => { if (p !== 0) { seen.add(p); } });
            pagesToProcess = Array.from(seen).sort((a, b) => a - b);
        }

        const collected: { page: number; text: string }[] = [];
        (async () => {
            for (const pageNum of pagesToProcess) {
                const pageIndex = pageNum - 1;
                try {
                    const extractedText: string = await this.extractPageText(pageIndex);
                    collected.push({ page: pageNum, text: extractedText.trim() || '[No text found]' });
                } catch {
                    collected.push({ page: pageNum, text: '[Error extracting page]' });
                }
                this.pageTexts = collected.slice();
                this.renderDialogBody();
            }
            this.pageTexts = collected;
            this.isLoading = false;
            this.renderDialogBody();
        })();
    }

    private async extractPageText(pageIndex: number): Promise<string> {
        // The Angular wrapper exposes extractText as a string-returning method.
        // For typed/structured text + bounds we use the extractText overload
        // pattern that ships on the viewer instance payload.
        const pv: any = this.pdfviewerControl;
        if (!pv) { return ''; }

        // First try the (startIndex, endIndex, ExtractTextOption.TextAndBounds) overload
        // to get bounds-aware data – fall back to the simple bounds API otherwise.
        try {
            const ej = (window as any).ej;
            const ExtractTextOption = ej && ej.pdfviewer && ej.pdfviewer.ExtractTextOption;
            if (ExtractTextOption !== undefined) {
                const result = await pv.extractText(pageIndex, pageIndex, ExtractTextOption.TextOnly);
                return this.getPageText(result);
            }
        } catch { /* fall through */ }

        try {
            const result = await pv.extractText(pageIndex, pageIndex);
            return this.getPageText(result);
        } catch { return ''; }
    }

    // Bounded extraction (over rectangles)
    public onExtractSelectedAreaText(): void {
        this.extractionMode = 'bounded';
        this.isLoading = true;
        this.renderDialogBody();
        setTimeout(() => {
            const dialog = (document.getElementById('extractTextDialog') as any).ej2_instances[0];
            if (dialog) { dialog.show(); }
        }, 10);

        const rectangles: any[] = (this.pdfviewerControl && (this.pdfviewerControl as any).annotationCollection)
            ? (this.pdfviewerControl as any).annotationCollection.filter((annotation: any) =>
                annotation.shapeAnnotationType === 'Square' || annotation.subject === 'Rectangle')
            : [];

        if (!rectangles.length) {
            this.pageTexts = [];
            this.isLoading = false;
            this.renderDialogBody();
            return;
        }

        (async () => {
            const collected: { page: number; text: string }[] = [];
            try {
                for (let i = 0; i < rectangles.length; i++) {
                    const rect = rectangles[i];
                    const annotationBounds = rect.bounds ||
                        (rect.annotation && rect.annotation.bounds) ||
                        (rect.annotation && rect.annotation.wrapper && rect.annotation.wrapper.bounds);
                    const b = this.getBounds(annotationBounds);
                    const pageIndex = typeof rect.pageIndex === 'number'
                        ? rect.pageIndex
                        : typeof rect.pageNumber === 'number' ? rect.pageNumber - 1 : 0;

                    try {
                        const ej = (window as any).ej;
                        const ExtractTextOption = ej && ej.pdfviewer && ej.pdfviewer.ExtractTextOption;
                        const pv: any = this.pdfviewerControl;
                        const result = ExtractTextOption !== undefined
                            ? await pv.extractText(rect.pageNumber, rect.pageNumber, ExtractTextOption.TextAndBounds)
                            : await pv.extractText(rect.pageNumber, rect.pageNumber);
                        const items: any[] = (result && (result.textData as any[])) || [];

                        const bx = b.x;
                        const by = b.y;
                        const bw = b.width;
                        const bh = b.height;

                        const selectedItems = items.filter((item: any) => {
                            const text: string = item.text != null ? item.text : (item.Text != null ? item.Text : '');
                            if (text === '\r' || text === '\n' || text === '\r\n') { return false; }
                            const ib = this.getBounds(item.bounds || item.Bounds);
                            const centerX = ib.x + ib.width / 2;
                            const centerY = ib.y + ib.height / 2;
                            return centerX >= bx && centerX <= bx + bw &&
                                centerY >= by && centerY <= by + bh;
                        });

                        const spaceItems = selectedItems.filter((item: any) => {
                            const text: string = item.text != null ? item.text : (item.Text != null ? item.Text : '');
                            return text === ' ';
                        });

                        const filteredItems = selectedItems
                            .filter((item: any) => {
                                const text: string = item.text != null ? item.text : (item.Text != null ? item.Text : '');
                                return (text || '').trim() !== '';
                            })
                            .sort((a: any, c: any) => {
                                const A = this.getBounds(a.bounds || a.Bounds);
                                const C = this.getBounds(c.bounds || c.Bounds);
                                const tolerance = Math.max(A.height, C.height) * 0.45;
                                return Math.abs(A.y - C.y) > tolerance ? A.y - C.y : A.x - C.x;
                            });

                        const rectText = this.buildTextFromBounds(filteredItems, spaceItems)
                            .replace(/\n/g, ' ')
                            .replace(/\s+/g, ' ')
                            .replace(/[.,]/g, '')
                            .replace(/\s+([.,;:!?])/g, '$1')
                            .trim();
                        if (rectText) { collected.push({ page: pageIndex + 1, text: rectText }); }
                    } catch (e) {
                        // ignore individual rectangle failure
                    }
                    this.pageTexts = collected.slice();
                    this.renderDialogBody();
                }
                this.pageTexts = collected;
                this.renderDialogBody();
            } finally {
                this.isLoading = false;
                this.renderDialogBody();
            }
        })();
    }

    // Page selector
    public onPageSelectionChange(args: any): void {
        const values: any[] = (args.value || []).map((value: any) => String(value));
        if (!values.length) {
            this.pageTexts = [];
            this.renderDialogBody();
            return;
        }
        if (values.indexOf('current') !== -1 && values.length === 1) {
            this.performExtraction(new Set<number>([0]));
            return;
        }
        const selectedSet = new Set<number>();
        values.forEach((v) => {
            if (v === 'current') { selectedSet.add(0); return; }
            const p = parseInt(v, 10);
            if (!isNaN(p)) { selectedSet.add(p); }
        });
        if (selectedSet.size === 0) {
            this.pageTexts = [];
            this.renderDialogBody();
            return;
        }
        this.performExtraction(selectedSet);
    }

    private getStatusLine(): string {
        const sv = (this.pageSelector && (this.pageSelector as any).value) || [];
        if (!sv.length) { return this.uiStrings.noPageSelected; }
        if ((sv as any[]).includes('current') && sv.length === 1) { return 'Current page selected'; }
        const numericPages: number = (sv as any[]).filter((x: string) => x !== 'current').length;
        const selectedPageCount: number = numericPages + ((sv as any[]).indexOf('current') !== -1 ? 1 : 0);
        if (selectedPageCount === this.totalPages) { return 'All pages selected'; }
        return selectedPageCount + ' of ' + this.totalPages + ' pages selected';
    }

    // Dialog body + extraction button wiring
    public onDialogOpen(_e: any): void {
        this.renderDialogBody();
        // Use event delegation so the copy button works no matter when
        // the dialog content is rendered (the dialog body initializes lazily).
        const content = document.getElementById('dialogCardContentArea');
        const header = document.querySelector('.extract-card-header');
        const dialogContent = header || content;
        if (dialogContent && !(dialogContent as any).__copyDelegated) {
            dialogContent.addEventListener('click', this.handleContainerClick);
            (dialogContent as any).__copyDelegated = true;
        }
        // Direct attach as well, in case the button is in the DOM by now.
        this.attachCopyButtonListener();
    }

    public onDialogClose(e: any): void {
        // Only reset on real closes (X icon / Cancel button)
        if (e && (e as any).closedBy !== 'Cancel' && (e as any).closedBy !== 'Close Icon') { return; }
        this.closeDialog();
    }

    private closeDialog(): void {
        try {
            const dialog = (document.getElementById('extractTextDialog') as any).ej2_instances[0];
            if (dialog) { dialog.hide(); }
        } catch { /* noop */ }
        this.pageTexts = [];
        this.extractionMode = 'direct';
        if (this.pageSelector) {
            this.pageSelector.value = ['current'];
            (this.pageSelector as any).dataBind();
        }
    }

    private handleExtractClick(): void {
        const text = this.buildAllPagesText();
        if (text && text.trim() && text.indexOf('[No text found]') === -1) {
            try {
                const el = document.createElement('a');
                el.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
                el.download = 'extracted-text-' + Date.now() + '.txt';
                document.body.appendChild(el);
                el.click();
                document.body.removeChild(el);
                URL.revokeObjectURL(el.href);
            } catch { /* ignore download errors silently */ }
        }
        this.closeDialog();
    }

    private handleCopyClick(): void {
        const text = this.buildAllPagesText();
        if (text && text.trim()) { this.copyToClipboard(text); }
    }

    // Rendering
    private renderDialogBody(): void {
        const headerTitle = document.getElementById('cardHeaderTitle');
        const contentArea = document.getElementById('dialogCardContentArea');
        if (!headerTitle || !contentArea) { return; }

        if (this.extractionMode === 'bounded') {
            headerTitle.textContent = this.uiStrings.selectArea;
        } else if (this.pageTexts.length === 0) {
            headerTitle.textContent = this.uiStrings.noPage;
        } else {
            const sv: string[] = ((this.pageSelector && (this.pageSelector as any).value) || [])
                .map((value: any) => String(value));
            if ((sv as any[]).indexOf('current') !== -1 && sv.length === 1) {
                headerTitle.textContent = this.uiStrings.currentPage;
            } else if (sv.length === this.totalPages) {
                headerTitle.textContent = this.totalPages + ' ' + this.uiStrings.allPages;
            } else if (sv.length === 1) {
                headerTitle.textContent = 'Page ' + sv[0];
            } else {
                headerTitle.textContent = sv.length + ' ' + this.uiStrings.allPages;
            }
        }

        const statusEl = document.getElementById('extractionStatusText');
        if (statusEl && this.extractionMode === 'direct') { statusEl.textContent = this.getStatusLine(); }
        const directOptions = document.getElementById('directExtractionOptions');
        if (directOptions) {
            directOptions.style.display = this.extractionMode === 'direct' ? '' : 'none';
        }

        if (this.isLoading && this.pageTexts.length === 0) {
            contentArea.innerHTML = '<span style="color:#aaa;font-style:italic;opacity:0.7;">' + this.uiStrings.extractText + '…</span>';
        } else if (!this.isLoading && this.pageTexts.length === 0) {
            contentArea.innerHTML = '<span style="color:#aaa;font-style:italic;opacity:0.7;">' +
                (this.extractionMode === 'bounded' ? this.uiStrings.noTextSelected : this.uiStrings.noPageSelected) + '</span>';
        } else if (this.extractionMode === 'direct') {
            contentArea.innerHTML = this.pageTexts.map((pt) =>
                '<div style="margin-bottom:18px;"><div style="font-weight:700;margin-bottom:6px;">Page ' +
                pt.page + '</div><div>' + this.escapeHtml(pt.text) + '</div></div>'
            ).join('');
        } else {
            contentArea.textContent = this.buildAllPagesText();
        }

        const hasText = this.pageTexts.some((item) => item.text && item.text.trim().length > 0);
        const extractBtn = document.querySelector('#extractTextDialog .e-footer-content button:last-child') as HTMLButtonElement | null;
        if (extractBtn) {
            if (!hasText || this.isLoading) {
                extractBtn.classList.add('extract-disabled');
                extractBtn.disabled = true;
            } else {
                extractBtn.classList.remove('extract-disabled');
                extractBtn.disabled = false;
            }
        }
    }

    // Helpers
    private refreshPageOptions(): void {
        const opts: any[] = [{ text: this.uiStrings.currentPage, value: 'current' }];
        const currentPage = this.pdfviewerControl && this.pdfviewerControl.currentPageNumber
            ? this.pdfviewerControl.currentPageNumber
            : 0;
        for (let i = 0; i < this.totalPages; i++) {
            const pageNumber: number = i + 1;
            if (pageNumber === currentPage) { continue; }
            opts.push({ text: String(pageNumber), value: String(pageNumber) });
        }
        this.pageOptions = opts;
        if (this.pageSelector) {
            (this.pageSelector as any).dataSource = opts;
            (this.pageSelector as any).dataBind();
        }
    }

    private updateToolbarVisibility(): void {
        this.isMobile = Browser.isDevice || window.innerWidth <= 768;
        const desktopEl = document.getElementById('desktopToolbarContainer');
        const mobileEl = document.getElementById('mobileToolbarContainer');
        if (desktopEl) { desktopEl.style.display = this.isMobile ? 'none' : ''; }
        if (mobileEl) { mobileEl.style.display = this.isMobile ? '' : 'none'; }
        const container = document.getElementById('pdfViewerContainer');
        if (container) { container.style.height = this.isMobile ? '500px' : '640px'; }
        const dialogInst = document.getElementById('extractTextDialog') as any;
        if (dialogInst && dialogInst.ej2_instances && dialogInst.ej2_instances[0]) {
            dialogInst.ej2_instances[0].width = this.isMobile ? '95%' : '560px';
            dialogInst.ej2_instances[0].dataBind();
        }
    }

    private getBounds(b: any): { x: number; y: number; width: number; height: number } {
        if (!b) { return { x: 0, y: 0, width: 0, height: 0 }; }
        return {
            x: (b.x != null ? b.x : b.X != null ? b.X : b.left != null ? b.left : b.Left) || 0,
            y: (b.y != null ? b.y : b.Y != null ? b.Y : b.top != null ? b.top : b.Top) || 0,
            width: (b.width != null ? b.width : b.Width) || 0,
            height: (b.height != null ? b.height : b.Height) || 0
        };
    }

    private getPageText(result: any): string {
        if (!result) { return ''; }
        if (result.pageText) { return result.pageText; }
        if (Array.isArray(result.textData)) {
            return result.textData.map((item: any) => item.text || '').join('\n');
        }
        if (typeof result === 'string') { return result; }
        return '';
    }

    private buildTextFromBounds(items: any[], spaceItems: any[] = []): string {
        const lines: string[] = [];
        let currentLine = '';
        let previousY: number | null = null;
        let previousHeight: number | null = null;
        let previousBounds: { x: number; y: number; width: number; height: number } | null = null;

        const punctuationRegex = /^[.,;:!?)\]}]/;

        const hasExplicitSpaceBetween = (
            previousCharacterBounds: { x: number; y: number; width: number; height: number },
            currentCharacterBounds: { x: number; y: number; width: number; height: number }
        ): boolean => {
            const previousRight = previousCharacterBounds.x + previousCharacterBounds.width;
            const currentLeft = currentCharacterBounds.x;
            return spaceItems.some((spaceItem: any) => {
                const spaceBounds = this.getBounds(spaceItem.bounds || spaceItem.Bounds);
                const spaceLeft = spaceBounds.x;
                const spaceRight = spaceBounds.x + spaceBounds.width;
                const previousBottom = previousCharacterBounds.y + previousCharacterBounds.height;
                const currentBottom = currentCharacterBounds.y + currentCharacterBounds.height;
                const lineBottom = (previousBottom + currentBottom) / 2;
                const verticalTolerance = Math.max(
                    previousCharacterBounds.height,
                    currentCharacterBounds.height,
                    4
                ) * 0.5;
                const belongsToSameLine = Math.abs(spaceBounds.y - lineBottom) <= verticalTolerance;
                const liesBetweenCharacters = spaceLeft >= previousRight - 1 && spaceRight <= currentLeft + 1;
                return belongsToSameLine && liesBetweenCharacters;
            });
        };

        items.forEach((item: any) => {
            const text: string = item.text != null ? item.text : (item.Text != null ? item.Text : '');
            const itemBounds = this.getBounds(item.bounds || item.Bounds);
            if (!(text || '').trim()) { return; }

            const lineTolerance = Math.max(itemBounds.height, previousHeight != null ? previousHeight : itemBounds.height) * 0.45;
            const isNewLine = previousY !== null && Math.abs(itemBounds.y - previousY) > lineTolerance;

            if (isNewLine) {
                if (currentLine.trim()) { lines.push(currentLine.trim()); }
                currentLine = '';
                previousBounds = null;
            }

            if (previousBounds && currentLine) {
                const previousRight = previousBounds.x + previousBounds.width;
                const gap = itemBounds.x - previousRight;
                const explicitSpace = hasExplicitSpaceBetween(previousBounds, itemBounds);
                if (explicitSpace && !punctuationRegex.test(text) && !currentLine.endsWith(' ')) {
                    currentLine += ' ';
                } else if (!explicitSpace) {
                    const averageHeight = (previousBounds.height + itemBounds.height) / 2;
                    const fallbackWordGap = averageHeight * 0.55;
                    if (gap > fallbackWordGap && !punctuationRegex.test(text) && !currentLine.endsWith(' ')) {
                        currentLine += ' ';
                    }
                }
            }

            currentLine += (text || '').trim();
            previousBounds = itemBounds;
            previousY = itemBounds.y;
            previousHeight = itemBounds.height;
        });
        if (currentLine.trim()) { lines.push(currentLine.trim()); }
        return lines.join('\n').replace(/\s+([.,;:!?])/g, '$1').trim();
    }

    private buildAllPagesText(): string {
        if (!this.pageTexts || !this.pageTexts.length) { return ''; }
        return this.pageTexts.map((p) => (p.text || '').trim()).filter(Boolean).join('\n');
    }

    private compareBounds(a: any, c: any): number {
        const A = this.getBounds(a.bounds || a.Bounds);
        const C = this.getBounds(c.bounds || c.Bounds);
        if (Math.abs(A.y - C.y) > 5) { return A.y - C.y; }
        return A.x - C.x;
    }

    private escapeHtml(str: string): string {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    private copyToClipboard(text: string): void {
        if (!text || !text.trim()) { return; }
        if (navigator.clipboard && (window as any).isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                this.setCopySuccess(true);
                setTimeout(() => this.setCopySuccess(false), 2000);
            }).catch(() => this.fallbackCopyToClipboard(text));
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    private fallbackCopyToClipboard(text: string): void {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.top = '-9999px';
            textArea.style.left = '-9999px';
            textArea.style.opacity = '0';
            textArea.style.pointerEvents = 'none';
            textArea.style.zIndex = '-1';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.setCopySuccess(true);
            setTimeout(() => this.setCopySuccess(false), 2000);
        } catch { /* ignore clipboard errors silently */ }
    }

    private setCopySuccess(flag: boolean): void {
        const btn = document.getElementById('dialogClipboardCopyBtn');
        if (!btn) { return; }
        btn.title = flag ? this.uiStrings.copied : this.uiStrings.copy;
        const icon = btn.querySelector('.e-icons');
        if (icon) {
            if (flag) {
                icon.classList.remove('e-copy');
                icon.classList.add('e-check');
            } else {
                icon.classList.remove('e-check');
                icon.classList.add('e-copy');
            }
        }
    }
}