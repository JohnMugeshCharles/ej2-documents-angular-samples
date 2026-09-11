import {
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    AfterViewInit
} from '@angular/core';
import {
    AnnotationService,
    BookmarkViewService,
    FormDesignerService,
    FormFieldsService,
    LinkAnnotationService,
    MagnificationService,
    NavigationService,
    PageOrganizerService,
    PdfViewerComponent,
    PdfViewerModule,
    PrintService,
    TextSearchService,
    TextSelectionService,
    ThumbnailViewService,
    ToolbarService
} from '@syncfusion/ej2-angular-pdfviewer';
import { ButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { PdfBitmap, PdfDocument } from '@syncfusion/ej2-pdf';
import { SBActionDescriptionComponent } from '../common/adp.component';
import { SBDescriptionComponent } from '../common/dp.component';

/**
 * Primary Toolbar Customization PDF Viewer controller.
 */
@Component({
    selector: 'control-content',
    templateUrl: 'primary-toolbar-customization.html',
    encapsulation: ViewEncapsulation.None,
    providers: [
        LinkAnnotationService,
        BookmarkViewService,
        MagnificationService,
        ThumbnailViewService,
        ToolbarService,
        NavigationService,
        TextSearchService,
        TextSelectionService,
        PrintService,
        AnnotationService,
        FormFieldsService,
        FormDesignerService,
        PageOrganizerService
    ],
    styleUrls: ['pdfviewer.component.css'],
    standalone: true,
    imports: [
        SBActionDescriptionComponent,
        SBDescriptionComponent,
        SwitchModule,
        ButtonModule,
        PdfViewerModule
    ]
})
export class PrimaryToolbarCustomizationComponent implements OnInit, AfterViewInit {
    @ViewChild('pdfviewer')
    public pdfviewerControl!: PdfViewerComponent;

    public document = 'https://cdn.syncfusion.com/content/pdf/pdf-succinctly.pdf';
    public resource = 'https://cdn.syncfusion.com/ej2/24.1.41/dist/ej2-pdfviewer-lib';

    public readonly defaultSelectedToolbarItems: string[] = [
        'OpenOption',
        'PageNavigationTool',
        'MagnificationTool',
        'AnnotationEditTool',
        'SearchOption',
        'PrintOption',
        'DownloadOption'
    ];

    public toolbarSettings: any = {
        showTooltip: true,
        toolbarItems: this.defaultSelectedToolbarItems.slice()
    };

    public readonly availableIcons: string[] = [
        'e-export-pdf',
        'e-header',
        'e-protect-sheet',
        'e-paste-text-only',
        'e-show-hide-panel',
        'e-filter-clear',
        'e-edit',
        'e-comment-show',
        'e-print-layout',
        'e-link-remove',
        'e-break-page',
        'e-bookmark',
        'e-password',
        'e-timeline-today',
        'e-text-alternative',
        'e-more-vertical-1'
    ];

    public customToolItems: any[] = [];
    public customButtonMappings: { [key: string]: string } = {};
    public pendingButton: any = null;
    public pendingApi: string | null = null;
    public pendingItemType: string = '';
    public selectedIcon: string = 'e-edit';

    public ngOnInit(): void {
        // Initialization is performed in ngAfterViewInit so that DOM lookups
        // for the property-panel controls succeed.
    }

    public ngAfterViewInit(): void {
        this.initializeSample();
    }

    public toolbarClick(args: ClickEventArgs): void {
        this.executeMappedApi(args);
    }

    private initializeSample(): void {
        this.setDefaultSelections();
        this.wireToolbarDropdown();
        this.updateSelectionSummary();
        this.populateIconGrid();
        this.wireCustomItemTypeDropdown();
        this.wirePreviewListeners();
        this.wireModal();
        this.wireApiDropdown();

        const customizeBtn = document.getElementById('customizeToolbar');
        if (customizeBtn) {
            customizeBtn.addEventListener('click', () => this.updateToolbar());
        }

        const fileUpload = document.getElementById('fileUpload');
        if (fileUpload) {
            fileUpload.addEventListener('change', (e: Event) => this.onFileChange(e), false);
        }

        const addBtn = document.getElementById('addToolbarButton');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addToolbarButton());
        }
    }

    private getSelectedToolbarItems(): string[] {
        const selectedValues: string[] = [];
        const checkedItems: NodeListOf<HTMLInputElement> = document.querySelectorAll(
            '#toolbarItems input[type="checkbox"]:checked'
        );
        checkedItems.forEach((item) => {
            selectedValues.push(item.value);
        });
        return selectedValues;
    }

    private setDefaultSelections(): void {
        const checkboxes: NodeListOf<HTMLInputElement> =
            document.querySelectorAll('#toolbarItems input[type="checkbox"]');
        checkboxes.forEach((cb) => {
            cb.checked = this.defaultSelectedToolbarItems.indexOf(cb.value) !== -1;
        });
    }

    private wireToolbarDropdown(): void {
        const dropdownWrapper = document.querySelector('.toolbar-dropdown');
        const dropdownButton = document.getElementById('toolbarDropdownButton');
        if (!dropdownWrapper || !dropdownButton) {
            return;
        }

        dropdownButton.addEventListener('click', (event: Event) => {
            event.stopPropagation();
            const isOpen = dropdownWrapper.classList.toggle('open');
            dropdownButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        document.addEventListener('click', (event: Event) => {
            const target = event.target as Node;
            if (!dropdownWrapper.contains(target)) {
                dropdownWrapper.classList.remove('open');
                dropdownButton.setAttribute('aria-expanded', 'false');
            }
        });

        const checkboxes: NodeListOf<HTMLInputElement> =
            document.querySelectorAll('#toolbarItems input[type="checkbox"]');
        checkboxes.forEach((cb) => {
            cb.addEventListener('change', () => this.updateSelectionSummary());
        });
    }

    private updateSelectionSummary(): void {
        const selectedCount = this.getSelectedToolbarItems().length;
        const summary = document.getElementById('toolbarDropdownText');
        if (summary) {
            summary.textContent = selectedCount + ' selected';
        }
    }

    private wireCustomItemTypeDropdown(): void {
        const customItemType = document.getElementById('customItemType') as HTMLSelectElement | null;
        const textSection = document.getElementById('textSection');
        const iconSection = document.getElementById('iconSection');
        if (!customItemType || !textSection || !iconSection) {
            return;
        }

        customItemType.addEventListener('change', () => {
            const value = customItemType.value;
            textSection.style.display = (value === 'text') ? '' : 'none';
            iconSection.style.display = (value === 'icon') ? '' : 'none';
            if (value !== this.pendingItemType) {
                this.pendingButton = null;
                this.updateTextSummary();
                this.updateIconSummary();
            }
            this.pendingItemType = value;
        });
    }

    private wirePreviewListeners(): void {
        const watchedInputs: string[] = [
            'buttonLabelInput',
            'fontSizeInput',
            'fontColorInput',
            'backgroundColorInput'
        ];
        watchedInputs.forEach((id) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.updateButtonPreview());
                el.addEventListener('change', () => this.updateButtonPreview());
            }
        });
    }

    private wireApiDropdown(): void {
        const apiDropdown = document.getElementById('apiDropdown') as HTMLSelectElement | null;
        if (!apiDropdown) {
            return;
        }
        apiDropdown.addEventListener('change', () => {
            this.pendingApi = apiDropdown.value || null;
        });
    }

    private wireModal(): void {
        const modal = document.getElementById('textButtonModal');
        const open = document.getElementById('createTextButtonBtn');
        const cancel = document.getElementById('popupCancelButton');
        const create = document.getElementById('popupCreateButton');
        if (!modal || !open || !cancel || !create) {
            return;
        }

        open.addEventListener('click', () => {
            this.resetPopupState();
            modal.style.display = 'flex';
        });
        cancel.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        create.addEventListener('click', () => this.createPendingTextButton());
    }

    private setInputValue(id: string, val: string): void {
        const el = document.getElementById(id) as HTMLInputElement | null;
        if (el) {
            el.value = val;
        }
    }

    private resetPopupState(): void {
        this.setInputValue('buttonLabelInput', '');
        this.setInputValue('tooltipTextInput', '');
        this.setInputValue('fontSizeInput', '14');
        this.setInputValue('fontColorInput', '#ffffff');
        this.setInputValue('backgroundColorInput', '#0d6efd');
        this.setInputValue('borderColorInput', '#000000');

        this.updateButtonPreview();

        const err = document.getElementById('popupError');
        if (err) {
            err.classList.remove('visible');
            err.textContent = '';
        }
    }

    private updateToolbar(): void {
        if (!this.pdfviewerControl) {
            return;
        }
        const selectedBuiltInItems = this.getSelectedToolbarItems();
        this.pdfviewerControl.toolbarSettings = {
            showTooltip: true,
            toolbarItems: this.customToolItems.concat(selectedBuiltInItems)
        };
        this.pdfviewerControl.dataBind();
    }

    private generateUniqueId(prefix: string): string {
        return prefix + '_' + (this.customToolItems.length + 1) + '_' + Date.now();
    }

    private addToolbarButton(): void {
        const customItemType = document.getElementById('customItemType') as HTMLSelectElement | null;
        const apiDropdown = document.getElementById('apiDropdown') as HTMLSelectElement | null;
        const type = customItemType ? customItemType.value : '';

        if (type === 'icon' && (!this.pendingButton || this.pendingButton.type !== 'icon')) {
            this.pendingButton = { type: 'icon', icon: this.selectedIcon };
        } else if (type === 'icon' && this.pendingButton.type === 'icon') {
            this.pendingButton.icon = this.selectedIcon;
        }

        const noButton = !this.pendingButton;
        const noIconChoice = type === 'icon' && (!this.pendingButton || !this.pendingButton.icon);
        const noTextBuild = type === 'text' && (!this.pendingButton || !this.pendingButton.text);
        const noApi = !this.pendingApi;

        if (noButton && noApi) {
            this.pdfviewerControl.showNotificationPopup(
                'Please complete the following:\n\n\u2022 Create or Select a Button\n\u2022 Select an API Action'
            );
            return;
        }
        if (noButton) {
            this.pdfviewerControl.showNotificationPopup('Please create a button before adding.');
            return;
        }
        if (noIconChoice) {
            this.pdfviewerControl.showNotificationPopup('Please select an icon.');
            return;
        }
        if (noTextBuild) {
            this.pdfviewerControl.showNotificationPopup('Please create a text button.');
            return;
        }
        if (noApi) {
            this.pdfviewerControl.showNotificationPopup('Please select an API Action.');
            return;
        }

        let uniqueId: string;
        let item: any;

        if (this.pendingButton.type === 'text') {
            uniqueId = this.generateUniqueId('customButton');
            const styles = this.pendingButton.styles || {};
            item = {
                id: uniqueId,
                type: 'text',
                text: this.pendingButton.text,
                tooltipText: this.pendingButton.tooltipText || this.pendingButton.text,
                cssClass: uniqueId,
                align: 'right'
            };
            this.customToolItems.push(item);

            const css = '.' + uniqueId + '{' +
                'background:' + (styles.backgroundColor || '#0d6efd') + ';' +
                'color:' + (styles.fontColor || '#ffffff') + ';' +
                'font-size:' + (styles.fontSize || 14) + 'px;' +
                'border:1px solid ' + (styles.borderColor || '#000000') + ';' +
                '}';
            const styleTag = document.createElement('style');
            styleTag.innerHTML = css;
            document.head.appendChild(styleTag);
        } else {
            uniqueId = this.generateUniqueId('iconButton');
            const iconClass = this.pendingButton.icon || '';
            const prefixIcon = iconClass.indexOf('e-icons ') === 0 ? iconClass : 'e-icons ' + iconClass;
            item = {
                id: uniqueId,
                prefixIcon: prefixIcon,
                tooltipText: iconClass.replace('e-', ''),
                align: 'right'
            };
            this.customToolItems.push(item);
        }

        this.customButtonMappings[uniqueId] = this.pendingApi as string;
        this.updateToolbar();

        this.pendingButton = null;
        this.pendingApi = null;
        if (apiDropdown) {
            apiDropdown.value = '';
        }
        this.updateTextSummary();

        if (type === 'text') {
            this.setInputValue('buttonLabelInput', '');
            this.setInputValue('tooltipTextInput', '');
        }

        this.pdfviewerControl.showNotificationPopup('Custom toolbar button added successfully.');
    }

    private getInputValue(id: string, fallback: string = ''): string {
        const el = document.getElementById(id) as HTMLInputElement | null;
        return el ? el.value : fallback;
    }

    private createPendingTextButton(): void {
        const label = this.getInputValue('buttonLabelInput').trim();
        const err = this.ensurePopupErrorNode();
        if (!label) {
            err.textContent = 'Please enter Button Name.';
            err.classList.add('visible');
            return;
        }
        err.classList.remove('visible');
        err.textContent = '';

        const tooltip = this.getInputValue('tooltipTextInput').trim() || label;

        this.pendingButton = {
            type: 'text',
            text: label,
            tooltipText: tooltip,
            styles: {
                fontSize: this.getInputValue('fontSizeInput', '14'),
                fontColor: this.getInputValue('fontColorInput', '#ffffff'),
                backgroundColor: this.getInputValue('backgroundColorInput', '#0d6efd'),
                borderColor: this.getInputValue('borderColorInput', '#000000')
            }
        };

        this.updateTextSummary();
        const modal = document.getElementById('textButtonModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    private ensurePopupErrorNode(): HTMLDivElement {
        const existing = document.getElementById('popupError');
        if (existing) {
            return existing as HTMLDivElement;
        }
        const err = document.createElement('div');
        err.id = 'popupError';
        err.className = 'ptc-field-error';
        const labelInput = document.getElementById('buttonLabelInput');
        if (labelInput && labelInput.parentNode) {
            labelInput.parentNode.appendChild(err);
        }
        return err;
    }

    private updateTextSummary(): void {
        const wrap = document.getElementById('textSelectedSummary');
        const name = document.getElementById('textSelectedName');
        if (!wrap || !name) {
            return;
        }
        if (this.pendingButton && this.pendingButton.type === 'text') {
            name.textContent = this.pendingButton.text;
            wrap.style.display = '';
        } else {
            wrap.style.display = 'none';
            name.textContent = '';
        }
    }

    private updateIconSummary(): void {
        const display = document.getElementById('selectedIconDisplay');
        if (display) {
            display.innerHTML = '<span class="e-icons ' + this.selectedIcon + '"></span>';
        }
    }

    private executeMappedApi(args: ClickEventArgs): void {
        if (!args || !args.item || !(args.item as any).id) {
            return;
        }
        const mapped = this.customButtonMappings[(args.item as any).id];
        if (mapped && typeof this.apiMap[mapped] === 'function') {
            try {
                this.apiMap[mapped]();
            } catch {
                // Silently fail to prevent unmapped items from breaking the viewer.
            }
        }
    }

    private populateIconGrid(): void {
        const iconGrid = document.getElementById('iconGrid');
        if (!iconGrid) {
            return;
        }
        iconGrid.innerHTML = '';
        this.availableIcons.forEach((iconClass) => {
            const iconItem = document.createElement('div');
            iconItem.className = 'icon-grid-item';
            if (iconClass === this.selectedIcon) {
                iconItem.classList.add('selected');
            }
            iconItem.innerHTML = '<span class="e-icons ' + iconClass + '"></span>';
            iconItem.title = iconClass;
            iconItem.dataset['icon'] = iconClass;
            iconItem.addEventListener('click', (e: Event) => {
                const target = e.currentTarget as HTMLElement;
                const icon = target.dataset['icon'];
                if (icon) {
                    this.selectIcon(icon);
                }
            });
            iconGrid.appendChild(iconItem);
        });
    }

    private selectIcon(iconClass: string): void {
        this.selectedIcon = iconClass;
        this.populateIconGrid();
        this.pendingButton = { type: 'icon', icon: iconClass };
        this.updateIconSummary();
    }

    private updateButtonPreview(): void {
        const preview = document.getElementById('buttonPreview');
        if (!preview) {
            return;
        }

        preview.innerHTML = this.getInputValue('buttonLabelInput', 'Custom Button');
        preview.style.fontSize = this.getInputValue('fontSizeInput', '14') + 'px';
        preview.style.color = this.getInputValue('fontColorInput', '#ffffff');
        preview.style.backgroundColor = this.getInputValue('backgroundColorInput', '#0d6efd');
        preview.style.borderRadius = '4px';
    }

    private onFileChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        const uploadedFiles = target.files;
        if (uploadedFiles && uploadedFiles[0]) {
            const uploadedFile = uploadedFiles[0];
            const reader = new FileReader();
            reader.readAsDataURL(uploadedFile);
            reader.onload = (e: ProgressEvent<FileReader>) => {
                if (!e.target || !e.target.result) {
                    return;
                }
                this.pdfviewerControl.load(e.target.result as string, null);
                this.pdfviewerControl.downloadFileName = uploadedFile.name;
            };
        }
    }

    public apiMap: { [key: string]: () => void } = {
        lockPdf: () => {
            const viewer = this.pdfviewerControl;
            if (!viewer) {
                return;
            }
            (viewer as any).annotationSettings = {
                isLock: true,
                allowedInteractions: ['None']
            };
            const annotations = (viewer as any).annotationCollection;
            if (annotations && typeof annotations.forEach === 'function') {
                annotations.forEach((annotation: any) => {
                    annotation.annotationSettings = { isLock: true };
                    if (viewer.annotation && typeof viewer.annotation.editAnnotation === 'function') {
                        viewer.annotation.editAnnotation(annotation);
                    }
                });
            }
            const formFields = (viewer as any).formFieldCollections;
            if (formFields && typeof formFields.forEach === 'function') {
                formFields.forEach((field: any) => {
                    if (
                        (viewer as any).formDesignerModule &&
                        typeof (viewer as any).formDesignerModule.updateFormField === 'function'
                    ) {
                        (viewer as any).formDesignerModule.updateFormField(field, { isReadOnly: true });
                    }
                });
            }
            (viewer as any).isFormDesignerToolbarVisible = false;
            if ((viewer as any).toolbarModule && typeof (viewer as any).toolbarModule.showAnnotationToolbar === 'function') {
                (viewer as any).toolbarModule.showAnnotationToolbar(false);
            }
        },
        flattenPdf: () => {
            const viewer = this.pdfviewerControl;
            if (!viewer) {
                return;
            }
            const viewerWithSave: any = viewer;
            if (typeof viewerWithSave.saveAsBlob !== 'function') {
                return;
            }
            viewerWithSave.saveAsBlob().then((value: any) => {
                const data: any = value;
                const reader = new FileReader();
                reader.readAsDataURL(data);
                reader.onload = () => {
                    const base64data: string = reader.result as string;
                    const docAny: any = new (PdfDocument as any)(base64data.split(',')[1]);
                    // Flatten PDF annotations and form fields.
                    docAny.flatten = true;
                    // Save the document.
                    const flattened = docAny.save();
                    // Destroy the document.
                    docAny.destroy();
                    viewerWithSave.load(flattened);
                };
            });
        },
        addWatermark: () => {
            const viewer = this.pdfviewerControl;
            if (!viewer) {
                return;
            }
            const viewerWithSave: any = viewer;
            if (typeof viewerWithSave.saveAsBlob !== 'function') {
                return;
            }
            viewerWithSave.saveAsBlob().then((value: any) => {
                const reader = new FileReader();
                reader.readAsDataURL(value);
                reader.onload = () => {
                    try {
                        const base64data: string = reader.result as string;
                        const loadedDocument: any = new (PdfDocument as any)(base64data.split(',')[1]);
                        const fileName = viewerWithSave.fileName;
                        const watermarkLabel =
                            (fileName ? fileName.replace(/\.pdf$/i, '') : '') || 'CONFIDENTIAL';

                        const firstPage = loadedDocument.getPage(0);
                        if (!firstPage || !firstPage.size) {
                            return;
                        }
                        const imageDataUrl = this.createTileImageDataUrl(watermarkLabel, {
                            width: firstPage.size.width,
                            height: firstPage.size.height
                        });
                        const base64Image = imageDataUrl.split(',')[1];
                        if (!base64Image) {
                            return;
                        }
                        const bitmap: any = new (PdfBitmap as any)(base64Image);
                        for (let i = 0; i < loadedDocument.pageCount; i++) {
                            const page = loadedDocument.getPage(i);
                            const pageGraphics = page.graphics;
                            const state = pageGraphics.save();
                            pageGraphics.setTransparency(0.3);
                            pageGraphics.drawImage(bitmap, {
                                x: 0,
                                y: 0,
                                width: page.size.width,
                                height: page.size.height
                            });
                            pageGraphics.restore(state);
                        }
                        const watermarked = loadedDocument.save();
                        loadedDocument.destroy();
                        viewerWithSave.load(watermarked);
                    } catch {
                        // Fail silently if page size/graphics API issues occur.
                    }
                };
            });
        }
    };

    private createTileImageDataUrl(label: string, pageSize: { width: number; height: number }): string {
        const canvas = document.createElement('canvas');
        canvas.width = pageSize.width;
        canvas.height = pageSize.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return canvas.toDataURL();
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const text = label || 'CONFIDENTIAL';
        const fontSize = Math.min(canvas.width, canvas.height) * 0.06;
        ctx.font = 'bold ' + fontSize + 'px Arial';
        ctx.fillStyle = 'rgba(255, 0, 0, 1)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.3;
        const textWidth = ctx.measureText(text).width;
        const textHeight = fontSize;
        const padding = Math.min(canvas.width, canvas.height) * 0.1;
        const spacingX = textWidth + padding;
        const spacingY = textHeight + padding;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 4);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        for (let y = -canvas.height; y < canvas.height * 2; y += spacingY) {
            for (let x = -canvas.width; x < canvas.width * 2; x += spacingX) {
                ctx.fillText(text, x, y);
            }
        }
        return canvas.toDataURL();
    }
}
