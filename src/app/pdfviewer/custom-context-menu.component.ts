import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import {
    ButtonModule,
    CheckBoxComponent,
    CheckBoxModule,
    SwitchModule
} from '@syncfusion/ej2-angular-buttons';
import {
    CheckBoxSelectionService,
    MultiSelectComponent,
    MultiSelectModule
} from '@syncfusion/ej2-angular-dropdowns';
import { MenuItemModel, MenuModule } from '@syncfusion/ej2-angular-navigations';
import { SBDescriptionComponent } from '../common/dp.component';
import { SBActionDescriptionComponent } from '../common/adp.component';

/**
 * Custom Context Menu PDF Viewer controller.
 * Includes the React sample's menu customization, text-selection rectangle,
 * annotation locking, and form-field read-only features.
 */
@Component({
    selector: 'control-content',
    templateUrl: 'custom-context-menu.html',
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
        PageOrganizerService,
        CheckBoxSelectionService
    ],
    styleUrls: ['pdfviewer.component.css'],
    standalone: true,
    imports: [
        SBActionDescriptionComponent,
        SBDescriptionComponent,
        SwitchModule,
        PdfViewerModule,
        MenuModule,
        CheckBoxModule,
        ButtonModule,
        MultiSelectModule
    ]
})
export class CustomContextMenuComponent implements OnInit {
    @ViewChild('pdfviewer') public pdfviewerControl!: PdfViewerComponent;
    @ViewChild('hide') public hideObj!: CheckBoxComponent;
    @ViewChild('toolbar') public toolbarObj!: CheckBoxComponent;
    @ViewChild('annotationSelect') public annotationSelectObj!: MultiSelectComponent;
    @ViewChild('textSelectionSelect') public textSelectionSelectObj!: MultiSelectComponent;
    @ViewChild('formFieldsSelect') public formFieldsSelectObj!: MultiSelectComponent;

    public document = 'https://cdn.syncfusion.com/content/pdf/pdf-succinctly.pdf';
    public resource = 'https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib';

    public isInitialRender = true;
    public showCategorySelects = false;
    public readonly multiSelectFields = { text: 'text', value: 'id' };

    public selectedMenuIds: string[] = [
        'search_in_google',
        'add_rectangle',
        'lock_annotation',
        'unlock_annotation'
    ];

    public annotationSelectedIds: string[] = ['lock_annotation', 'unlock_annotation'];
    public textSelectionSelectedIds: string[] = ['search_in_google', 'add_rectangle'];
    public formFieldsSelectedIds: string[] = ['read_only_true', 'read_only_false'];

    public lastTextSelectionBounds: any[] = [];
    public lastTextSelectionPageNumber = 1;

    public readonly annotationData: Array<{ id: string; text: string }> = [
        { id: 'lock_annotation', text: 'Lock Annotation' },
        { id: 'unlock_annotation', text: 'Unlock Annotation' }
    ];

    public readonly textSelectionData: Array<{ id: string; text: string }> = [
        { id: 'search_in_google', text: 'Search In Google' },
        { id: 'add_rectangle', text: 'Add Rectangle' }
    ];

    public readonly formFieldsData: Array<{ id: string; text: string }> = [
        { id: 'read_only_true', text: 'Set Read Only' },
        { id: 'read_only_false', text: 'Remove Read Only' }
    ];

    public readonly menuItems: MenuItemModel[] = [
        {
            text: 'Search In Google',
            id: 'search_in_google',
            iconCss: 'e-icons e-de-ctnr-find'
        },
        {
            text: 'Lock Annotation',
            id: 'lock_annotation',
            iconCss: 'e-icons e-lock'
        },
        {
            text: 'Unlock Annotation',
            id: 'unlock_annotation',
            iconCss: 'e-icons e-unlock'
        },
        {
            text: 'Add Rectangle',
            id: 'add_rectangle',
            iconCss: 'e-icons e-rectangle'
        }
    ];

    public ngOnInit(): void {
        // No work is required before the PDF Viewer is initialized.
    }

    public documentLoaded(_event: any): void {

        if (!this.isInitialRender) {
            return;
        }

        this.isInitialRender = false;

        if (!this.toolbarObj?.checked) {
            return;
        }

        const selectedItems = this.buildSelectedMenuItems([
            ...this.selectedMenuIds,
            ...this.formFieldsSelectedIds
        ]);

        this.pdfviewerControl.addCustomMenu(
            selectedItems,
            !!this.hideObj?.checked,
            true
        );
    }

    public customContextMenuSelect(event: any): void {
        switch (event.id) {
            case 'search_in_google':
                this.searchSelectedText();
                break;
            case 'add_rectangle':
                this.addRectangleFromSelection();
                break;
            case 'lock_annotation':
                this.setAnnotationLock(true, event);
                break;
            case 'unlock_annotation':
                this.setAnnotationLock(false, event);
                break;
            case 'read_only_true':
                this.setSelectedFormFieldsReadOnly(true, event);
                break;
            case 'read_only_false':
                this.setSelectedFormFieldsReadOnly(false, event);
                break;
            default:
                break;
        }
    }

    public customContextMenuBeforeOpen(event: any): void {

        const hideDefaultChecked = !!this.hideObj?.checked;
        const showCustomBottomChecked = !!this.toolbarObj?.checked;

        // Default Syncfusion menu only
        if (!hideDefaultChecked && !showCustomBottomChecked) {
            return;
        }

        if (hideDefaultChecked && !showCustomBottomChecked) {

            this.pdfviewerControl.contextMenuOption = 'None';

            event.cancel = true;
            return;
        }

        const isTextSelected = this.hasTextSelection();
        const hasAnnotations = this.selectedAnnotations.length > 0;
        const hasFormFields = this.selectedFormFields.length > 0;

        const customMenuIds = new Set<string>([
            'search_in_google',
            'add_rectangle',
            'lock_annotation',
            'unlock_annotation',
            'read_only_true',
            'read_only_false'
        ]);

        for (const id of event.ids as string[]) {

            const element = document.getElementById(id);

            if (!element) {
                continue;
            }

            element.style.display = 'none';

            // Hide default items when custom-only mode is enabled
            if (
                hideDefaultChecked &&
                showCustomBottomChecked &&
                !customMenuIds.has(id)
            ) {
                continue;
            }

            // TEXT SELECTION MODE
            if (isTextSelected) {

                if (
                    (id === 'search_in_google' &&
                        this.textSelectionSelectedIds.includes('search_in_google')) ||
                    (id === 'add_rectangle' &&
                        this.textSelectionSelectedIds.includes('add_rectangle'))
                ) {
                    element.style.display = 'block';
                    continue;
                }

                // hide every other custom item
                if (customMenuIds.has(id)) {
                    continue;
                }
            }

            // ANNOTATION MODE
            else if (hasAnnotations) {

                if (
                    (id === 'lock_annotation' ||
                        id === 'unlock_annotation') &&
                    this.annotationSelectedIds.includes(id) &&
                    this.shouldShowAnnotationAction(id)
                ) {
                    element.style.display = 'block';
                    continue;
                }

                if (customMenuIds.has(id)) {
                    continue;
                }
            }

            // FORM FIELD MODE
            else if (hasFormFields) {

                if (
                    (id === 'read_only_true' ||
                        id === 'read_only_false') &&
                    this.formFieldsSelectedIds.includes(id) &&
                    this.shouldShowReadOnlyAction(id)
                ) {
                    element.style.display = 'block';
                    continue;
                }

                if (id === 'formfield properties') {
                    element.style.display = 'block';
                    continue;
                }

                if (customMenuIds.has(id)) {
                    continue;
                }
            }
            else {
                // No selection
                if (customMenuIds.has(id)) {
                    continue;
                }
            }

            // Show normal menu items only if defaults are enabled
            if (!hideDefaultChecked) {
                element.style.display = 'block';
            }
        }
    }

    public contextmenuHelper(_event?: any): void {
        this.showCategorySelects = !!this.toolbarObj?.checked;

        if (!this.pdfviewerControl) {
            return;
        }

        if (!this.toolbarObj?.checked) {
            this.pdfviewerControl.addCustomMenu([], false, true);

            this.pdfviewerControl.contextMenuOption =
                this.hideObj?.checked ? 'None' : 'RightClick';

            return;
        }

        // Important: restore right-click handling before adding custom items.
        this.pdfviewerControl.contextMenuOption = 'RightClick';

        const activeIds = this.selectedMenuIds.length
            ? this.selectedMenuIds
            : [
                'search_in_google',
                'add_rectangle',
                'lock_annotation',
                'unlock_annotation'
            ];

        const menuIds = [
            ...new Set([
                ...activeIds,
                ...this.formFieldsSelectedIds
            ])
        ];

        this.pdfviewerControl.addCustomMenu(
            this.buildSelectedMenuItems(menuIds),
            !!this.hideObj?.checked,
            true
        );
    }

    public handleCategoryChange(): void {
        if (this.annotationSelectObj) {
            this.annotationSelectedIds = (this.annotationSelectObj.value || []) as string[];
        }
        if (this.textSelectionSelectObj) {
            this.textSelectionSelectedIds = (this.textSelectionSelectObj.value || []) as string[];
        }
        if (this.formFieldsSelectObj) {
            this.formFieldsSelectedIds = (this.formFieldsSelectObj.value || []) as string[];
        }
    }

    public applyContextMenu(): void {
        this.handleCategoryChange();

        if (!this.toolbarObj?.checked) {
            this.pdfviewerControl.addCustomMenu([], false, true);

            this.pdfviewerControl.contextMenuOption =
                this.hideObj?.checked ? 'None' : 'RightClick';

            return;
        }

        // Important: custom context menus require right-click handling.
        this.pdfviewerControl.contextMenuOption = 'RightClick';

        this.selectedMenuIds = [
            ...this.annotationSelectedIds,
            ...this.textSelectionSelectedIds,
            ...this.formFieldsSelectedIds
        ];

        this.pdfviewerControl.addCustomMenu(
            this.buildSelectedMenuItems(this.selectedMenuIds),
            !!this.hideObj?.checked,
            true
        );
    }

    public textSelectionEnd(event: any): void {
        this.lastTextSelectionPageNumber =
            event.pageNumber || this.pdfviewerControl.currentPageNumber;
        this.lastTextSelectionBounds = event.textBounds || [];
    }

    public addRectangleFromSelection(): void {
        if (!this.lastTextSelectionBounds.length) {
            return;
        }

        const firstBound = this.lastTextSelectionBounds[0];
        const lastBound = this.lastTextSelectionBounds[this.lastTextSelectionBounds.length - 1];

        const left = Number(firstBound.left ?? firstBound.x ?? 0);
        const top = Number(firstBound.top ?? firstBound.y ?? 0);
        const right = Number(
            lastBound.right ??
            ((lastBound.left ?? lastBound.x ?? 0) + (lastBound.width ?? 0))
        );
        const bottom = Number(
            lastBound.bottom ??
            ((lastBound.top ?? lastBound.y ?? 0) + (lastBound.height ?? 0))
        );

        this.pdfviewerControl.annotation.addAnnotation('Rectangle', {
            offset: { x: left, y: top },
            pageNumber:
                this.lastTextSelectionPageNumber || this.pdfviewerControl.currentPageNumber,
            width: Math.max(1, right - left),
            height: Math.max(1, bottom - top)
        } as any);
    }

    private buildSelectedMenuItems(selectedIds: string[]): MenuItemModel[] {
        const selected = new Set(selectedIds);
        const items: MenuItemModel[] = this.menuItems
            .filter((item: MenuItemModel) => !!item.id && selected.has(item.id))
            .map((item: MenuItemModel) => ({ ...item }));

        if (selected.has('read_only_true')) {
            items.push({
                text: 'Set Read Only',
                id: 'read_only_true',
                iconCss: 'e-icons e-lock'
            });
        }

        if (selected.has('read_only_false')) {
            items.push({
                text: 'Remove Read Only',
                id: 'read_only_false',
                iconCss: 'e-icons e-unlock'
            });
        }

        return items;
    }

    private searchSelectedText(): void {
        const textSelectionModule = this.pdfviewerControl.textSelectionModule;

        if (!textSelectionModule?.isTextSelection ||
            !textSelectionModule.selectionRangeArray) {
            return;
        }

        const selectedText = textSelectionModule.selectionRangeArray
            .map((range: any) => range.textContent || '')
            .filter((text: string) => /\S/.test(text))
            .join(' ')
            .trim();

        if (!selectedText) {
            return;
        }

        window.open(
            `https://www.google.com/search?q=${encodeURIComponent(selectedText)}`,
            '_blank',
            'noopener,noreferrer'
        );
    }
    private hasTextSelection(): boolean {
        return !!this.pdfviewerControl.textSelectionModule?.isTextSelection;
    }

    private get selectedAnnotations(): any[] {
        return this.pdfviewerControl.selectedItems?.annotations || [];
    }

    private get selectedFormFields(): any[] {
        return this.pdfviewerControl.selectedItems?.formFields || [];
    }

    private shouldShowAnnotationAction(id: string): boolean {
        if (!this.selectedAnnotations.length) {
            return false;
        }

        const isLockOption = id === 'lock_annotation';
        const signatureTypes = new Set<string>([
            'HandWrittenSignature',
            'SignatureText',
            'SignatureImage'
        ]);

        return this.selectedAnnotations.some((annotation: any) => {
            if (!annotation?.annotationSettings) {
                return false;
            }

            if (isLockOption && signatureTypes.has(annotation.shapeAnnotationType)) {
                return false;
            }

            const isLocked = !!annotation.annotationSettings.isLock;
            return isLockOption ? !isLocked : isLocked;
        });
    }

    private shouldShowReadOnlyAction(id: string): boolean {
        if (!this.selectedFormFields.length) {
            return false;
        }

        const setReadOnly = id === 'read_only_true';
        return this.selectedFormFields.some((formField: any) => {
            const isReadOnly = !!(formField.isReadonly ?? formField.isReadOnly);
            return setReadOnly ? !isReadOnly : isReadOnly;
        });
    }

    private setAnnotationLock(isLocked: boolean, event: any): void {

        const selectedAnnotationIds = new Set<string>(
            this.selectedAnnotations.map(
                (annotation: any) => annotation.id || annotation.uniqueKey
            )
        );

        if (!selectedAnnotationIds.size) {
            return;
        }

        for (const annotation of this.pdfviewerControl.annotationCollection || []) {

            const annotationId =
                annotation.id || annotation.uniqueKey;

            if (!selectedAnnotationIds.has(annotationId)) {
                continue;
            }

            annotation.annotationSettings =
                annotation.annotationSettings || {};

            annotation.annotationSettings.isLock = isLocked;
            annotation.isCommentLock = isLocked;

            this.pdfviewerControl.annotation.editAnnotation(annotation);
        }

        event.cancel = false;
    }

    private setSelectedFormFieldsReadOnly(isReadOnly: boolean, event: any): void {
        for (const selectedFormField of this.selectedFormFields) {
            this.pdfviewerControl.formDesignerModule.updateFormField(
                selectedFormField,
                { isReadOnly } as any
            );
        }

        event.cancel = false;
    }
}
