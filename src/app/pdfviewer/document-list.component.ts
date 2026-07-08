import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerComponent, LoadEventArgs, LinkAnnotationService, BookmarkViewService, MagnificationService, ThumbnailViewService, ToolbarService, NavigationService, TextSearchService, TextSelectionService, PrintService, AnnotationService, FormFieldsService, FormDesignerService, PageOrganizerService, PdfViewerModule } from '@syncfusion/ej2-angular-pdfviewer';
import { SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { pdfdata } from './grid-datasource';
import { DialogComponent, DialogModule } from '@syncfusion/ej2-angular-popups';
import { SBDescriptionComponent } from '../common/dp.component';
import { SBActionDescriptionComponent } from '../common/adp.component';
 
@Component({
    selector: 'document-list',
    templateUrl: 'document-list.html',
    encapsulation: ViewEncapsulation.None,
    // tslint:disable-next-line:max-line-length
    providers: [LinkAnnotationService, BookmarkViewService, MagnificationService, ThumbnailViewService, ToolbarService, NavigationService,
        TextSearchService, TextSelectionService, PrintService, AnnotationService, FormFieldsService, FormDesignerService, PageOrganizerService],
    styleUrls: ['pdfviewer.component.css'],
    standalone: true,
    imports: [
        SBActionDescriptionComponent,
        SwitchModule,
        DialogModule,
        PdfViewerModule,
        SBDescriptionComponent,
        CommonModule,
    ],
})
 
export class DocumentListComponent implements OnInit {
    @ViewChild('pdfviewer')
    public pdfviewerControl: PdfViewerComponent;
    @ViewChild('Dialog')
    public dialog: DialogComponent;
 
    public data: any = [];
    public isModal: boolean = true;
    public currentDocumentUrl: any = null;
   
    public document: string = '';
    public resource: string = "https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib";
    public mode: any;
    public toolbarSettings: object = { 
        showTooltip: true,
        toolbarItems: [
            "OpenOption",
            "UndoRedoTool",
            "PageNavigationTool",
            "MagnificationTool",
            "PanTool",
            "SelectionTool",
            "CommentTool",
            "SubmitForm",
            "AnnotationEditTool",
            "FormDesignerEditTool",
            "SearchOption",
            "PrintOption",
            "DownloadOption"
        ],
        annotationToolbarItems: ['HighlightTool', 'UnderlineTool', 'StrikethroughTool', 'SquigglyTool',
            'ColorEditTool', 'OpacityEditTool', 'AnnotationDeleteTool', 'StampAnnotationTool',
            'HandWrittenSignatureTool', 'InkAnnotationTool', 'InkEraserTool', 'ShapeTool', 'CalibrateTool',
            'StrokeColorEditTool', 'ThicknessEditTool', 'FreeTextAnnotationTool', 'FontFamilyAnnotationTool',
            'FontSizeAnnotationTool', 'FontStylesAnnotationTool', 'FontAlignAnnotationTool',
            'FontColorAnnotationTool', 'CommentPanelTool'],
        formDesignerToolbarItems: ['TextboxTool', 'PasswordTool', 'CheckBoxTool',
            'RadioButtonTool', 'DropdownTool', 'ListboxTool', 'DrawSignatureTool', 'DeleteTool']
    }

    ngOnInit(): void {
        this.data = pdfdata;
    }

    public documentLoaded(e: LoadEventArgs): void {
        if (this.mode === 'View') {
            this.pdfviewerControl.enablePageOrganizer = false;
        }
        else {
            this.pdfviewerControl.enablePageOrganizer = true;
        }
    }

    public onActionClick(mode: string, rowData: any): void {
        this.mode = mode;
        this.dialog.header = rowData['FileName'];
        if (this.mode === 'View') {
            this.pdfviewerControl.enableStickyNotesAnnotation = false;
            this.pdfviewerControl.enableAnnotationToolbar = false;
            this.pdfviewerControl.isAnnotationToolbarVisible = false;
            this.pdfviewerControl.toolbarSettings = { showTooltip: true, toolbarItems: ['OpenOption', 'PageNavigationTool', 'MagnificationTool', 'PanTool', 'PrintOption'] };
            this.pdfviewerControl.annotationSettings = {
                isLock: true, author: 'Guest',
            };
            this.pdfviewerControl.textFieldSettings = {
                isReadOnly: true,
            };
            this.pdfviewerControl.radioButtonFieldSettings = {
                isReadOnly: true,
            };
            this.pdfviewerControl.DropdownFieldSettings = {
                isReadOnly: true,
            }
            this.pdfviewerControl.checkBoxFieldSettings = {
                isReadOnly: true,
            };
            this.pdfviewerControl.signatureFieldSettings = {
                isReadOnly: true,
            };
            this.pdfviewerControl.initialFieldSettings = {
                isReadOnly: true,
            };
            this.pdfviewerControl.listBoxFieldSettings = {
                isReadOnly: true,
            };
            this.pdfviewerControl.passwordFieldSettings = {
                isReadOnly: true,
            };
            this.pdfviewerControl.contextMenuOption = 'None';
        } else {
            this.pdfviewerControl.enableStickyNotesAnnotation = true;
            this.pdfviewerControl.enableAnnotationToolbar = true;
            this.pdfviewerControl.toolbarSettings = this.toolbarSettings;
            this.pdfviewerControl.annotationSettings = {
                isLock: false, author: 'Guest',
            };
            this.pdfviewerControl.textFieldSettings = {
                isReadOnly: false,
            };
            this.pdfviewerControl.radioButtonFieldSettings = {
                isReadOnly: false,
            };
            this.pdfviewerControl.DropdownFieldSettings = {
                isReadOnly: false,
            }
            this.pdfviewerControl.checkBoxFieldSettings = {
                isReadOnly: false,
            };
            this.pdfviewerControl.signatureFieldSettings = {
                isReadOnly: false,
            };
            this.pdfviewerControl.initialFieldSettings = {
                isReadOnly: false,
            };
            this.pdfviewerControl.listBoxFieldSettings = {
                isReadOnly: false,
            };
            this.pdfviewerControl.passwordFieldSettings = {
                isReadOnly: false,
            };
            this.pdfviewerControl.contextMenuOption ='RightClick';
        }
        // Store document info for loading after dialog opens
        this.currentDocumentUrl = rowData['Document'];
        this.dialog.show();
    }

    public onDialogOpen(): void {
        // Load PDF viewer only after dialog finishes rendering and layout is complete
        if (this.currentDocumentUrl) {
            this.pdfviewerControl.load(this.currentDocumentUrl, null);
            this.pdfviewerControl.dataBind();
            this.currentDocumentUrl = null;
        }
    }

    public onDialogClose(): void {
        this.pdfviewerControl.unload();
    }
}
