import { Component, ViewEncapsulation, Inject, ViewChild } from '@angular/core';
import { notesData } from './data';
import { SpreadsheetComponent, SpreadsheetModule } from '@syncfusion/ej2-angular-spreadsheet';
import { SBDescriptionComponent } from '../common/dp.component';
import { SBActionDescriptionComponent } from '../common/adp.component';
/**
 * Notes Spreadsheet Controller
 */
@Component({
    selector: 'control-content',
    templateUrl: 'notes.html',
    styleUrls: ['spreadsheet.css'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [SBActionDescriptionComponent, SpreadsheetModule, SBDescriptionComponent]
})

export class NotesController {
    constructor(@Inject('sourceFiles') private sourceFiles: any) {
        sourceFiles.files = ['spreadsheet.css'];
    }
    @ViewChild('default')
    public spreadsheetObj: SpreadsheetComponent;
    public data: Object[] = notesData();
    public openUrl = 'https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/open';
    public saveUrl = 'https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/save';
    created() {
        this.spreadsheetObj.hideRibbonTabs(['Home', 'Insert', 'Formulas', 'Data', 'View'], true);
        this.spreadsheetObj.numberFormat('$#,##0.00', 'F4:F13');
        this.spreadsheetObj.numberFormat('$###', 'E4:E12');
        this.spreadsheetObj.freezePanes(3, 0);
    }
}
