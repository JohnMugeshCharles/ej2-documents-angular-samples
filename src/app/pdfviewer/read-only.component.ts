import { Component, ViewEncapsulation, OnInit,ViewChild} from '@angular/core';
import { PdfViewerComponent, LinkAnnotationService, BookmarkViewService, MagnificationService, ThumbnailViewService, ToolbarService, NavigationService, TextSearchService, TextSelectionService, PrintService, AnnotationService, FormFieldsService, FormDesignerService, LoadEventArgs, PdfViewerModule, PageOrganizerService } from '@syncfusion/ej2-angular-pdfviewer';
import { SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { ClickEventArgs } from '@syncfusion/ej2-buttons';
import { SBDescriptionComponent } from '../common/dp.component';
import { SBActionDescriptionComponent } from '../common/adp.component';

@Component({
    selector: 'control-content',
    templateUrl: 'read-only.html',
    encapsulation: ViewEncapsulation.None,
    // tslint:disable-next-line:max-line-length
    providers: [LinkAnnotationService, BookmarkViewService, MagnificationService, ThumbnailViewService, ToolbarService, NavigationService,
        TextSearchService, TextSelectionService, PrintService, AnnotationService, FormFieldsService, FormDesignerService, PageOrganizerService],
    styleUrls: ['pdfviewer.component.css'],
    standalone: true,
    imports: [
        SBActionDescriptionComponent,
        SwitchModule,
        PdfViewerModule,
        SBDescriptionComponent,
    ],
})

export class ReadOnlyComponent implements OnInit {
    @ViewChild('pdfviewer')
    public pdfviewerControl: PdfViewerComponent;

    public annotation={
        isLock: true,
    };    

    public document: string = 'https://cdn.syncfusion.com/content/pdf/restricted-formfield.pdf';
    public resource:string = "https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib";
    public toolbarSettings = { showTooltip: true, toolbarItems: ['OpenOption', 'PageNavigationTool', 'MagnificationTool', 'PanTool', 'PrintOption'] }
    ngOnInit(): void {
        // ngOnInit function
    };

    Created(e: any): void {
        this.pdfviewerControl.contextMenuOption ='None';
        this.pdfviewerControl.dataBind();
    }

    documentLoaded(e: any): void {
        let viewer = (document.getElementById('pdfViewer') as any).ej2_instances[0];
        var formField = viewer.retrieveFormFields();
        for (var x = 0; x < formField.length; x++) {
            viewer.formDesignerModule.updateFormField(viewer.formFieldCollections[x], {
                isReadOnly: true,
            });
        }
    } 
}






