import { Component, ViewEncapsulation, Inject, ViewChild } from '@angular/core';
import { SpreadsheetComponent, SpreadsheetModule } from '@syncfusion/ej2-angular-spreadsheet';
import { shipmentDetails } from './data';
import { SBDescriptionComponent } from '../common/dp.component';
import { SBActionDescriptionComponent } from '../common/adp.component';
/**
 * Comment Spreadsheet Controller
 */
@Component({
    selector: 'control-content',
    templateUrl: 'comment.html',
    styleUrls: ['spreadsheet.css'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [SBActionDescriptionComponent, SpreadsheetModule, SBDescriptionComponent]
})

export class CommentController {
    constructor(@Inject('sourceFiles') private sourceFiles: any) {
        sourceFiles.files = ['spreadsheet.css'];
    }
    @ViewChild('comment')
    public spreadsheetObj: SpreadsheetComponent;
    public data: Object[] = shipmentDetails();
    public openUrl = 'https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/open';
    public saveUrl = 'https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/save';
    created() {
        this.spreadsheetObj.cellFormat({ fontWeight: 'bold', textAlign: 'center' }, 'Shipment Details!A1:F1');
        this.spreadsheetObj.hideRibbonTabs(['Home', 'Insert', 'Formulas', 'Data', 'View'], true);
        // Added comments using the updateCell method.
        this.spreadsheetObj.updateCell({
            comment: {
                author: 'Cristi Espinos', text: 'Validate customer name for Order 10249.', createdTime: 'November 18, 2025 at 4:00 PM',
                isResolved: false, replies: [{ author: 'Julius Gorner', text: 'Confirmed as Karin Josephs', createdTime: 'November 18, 2025 at 4:30 PM' },
                { author: 'Cristi Espinos', text: 'Perfect, noted.', createdTime: 'November 18, 2025 at 5:30 PM' }]
            }
        }, 'Shipment Details!B3');
        this.spreadsheetObj.updateCell({
            comment: {
                author: 'Cristi Espinos', text: 'Verify address details for delivery.', createdTime: 'November 18, 2025 at 4:00 PM',
                isResolved: true, replies: [{ author: 'Julius Gorner', text: 'Address confirmed as Boulevard Tirou, 255.', createdTime: 'November 18, 2025 at 4:30 PM' }]
            }
        }, 'Shipment Details!C6');
        this.spreadsheetObj.updateCell({
            comment: {
                author: 'Cristi Espinos', text: 'Confirm country for Order 10255 delivery.', createdTime: 'November 18, 2025 at 4:00 PM',
                isResolved: false, replies: [{ author: 'Julius Gorner', text: 'Country verified as Switzerland.', createdTime: 'November 18, 2025 at 4:30 PM' },
                { author: 'Cristi Espinos', text: 'Acknowledged.', createdTime: 'November 18, 2025 at 5:30 PM' }]
            }
        }, 'Shipment Details!D9');
    }
}