import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DocumentEditorSampleModule } from '../document-editor/document-editor.module';
import { PdfViewerSampleModule } from '../pdfviewer/pdfviewer.module';
import { SpreadsheetSampleModule } from '../spreadsheet/spreadsheet.module';
import { PdfSampleModule } from "../pdf/pdf.module";


const appRoutes: any = [
    { path: 'spreadsheet', loadChildren: import('../spreadsheet/spreadsheet.module').then(m=>m.SpreadsheetSampleModule) },
    { path: ':theme/spreadsheet/:sample', redirectTo: 'material/spreadsheet/default' },
    { path: 'pdfviewer', loadChildren: import('../pdfviewer/pdfviewer.module').then(m=>m.PdfViewerSampleModule) },
    { path: ':theme/pdfviewer/:sample', redirectTo: 'material/pdfviewer/default' },
    { path: 'document-editor', loadChildren: import('../document-editor/document-editor.module').then(m=>m.DocumentEditorSampleModule) },
    { path: ':theme/document-editor/:sample', redirectTo: 'material/document-editor/default' },
    { path: 'pdf', loadChildren: import('../pdf/pdf.module').then(m=>m.PdfSampleModule) },
    { path: ':theme/pdf/:sample', redirectTo: 'material/pdf/default' }
];

@NgModule({
    imports: [
        SpreadsheetSampleModule,
        PdfViewerSampleModule,
        DocumentEditorSampleModule,
        PdfSampleModule,
        RouterModule.forRoot(appRoutes)
    ],

    declarations: [
    ],

    exports: [
        RouterModule,
    ]
})
export class SBRoutingModule { }
