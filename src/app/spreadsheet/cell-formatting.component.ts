import { Component, ViewEncapsulation, Inject, ViewChild } from '@angular/core';
import { SpreadsheetComponent, SpreadsheetModule } from '@syncfusion/ej2-angular-spreadsheet';
import { SheetModel, ColumnModel, RowModel, CellRenderEventArgs } from '@syncfusion/ej2-angular-spreadsheet';
import { orderDetails } from './data';
import { SBDescriptionComponent } from '../common/dp.component';
import { SBActionDescriptionComponent } from '../common/adp.component';
/**
 * Cell Formatting Spreadsheet Controller
 */
@Component({
    selector: 'control-content',
    templateUrl: 'cell-formatting.html',
    styleUrls: ['spreadsheet.css'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [SpreadsheetModule, SBActionDescriptionComponent, SBDescriptionComponent]
})

export class CellFormatController {
    constructor(@Inject('sourceFiles') private sourceFiles: any) {
        sourceFiles.files = ['spreadsheet.css'];
    }
    @ViewChild('cellFormat')
    public spreadsheetObj: SpreadsheetComponent;
    public data: Object[] = orderDetails();
    public columns: ColumnModel[] = [{ width: 80 }, { width: 130 }, { width: 180 }, { width: 90 }, { width: 160 }, { width: 80 },
            { width: 100 }, { width: 130 }, { width: 80 }];
    public rows: RowModel[] = [
        {
            height: 36,
            // Applying cell formatting through cell binding
            cells: [{ style: { textAlign: 'right' } }, { style: { textIndent: '2pt' } }, { style: { textAlign: 'center' }}, { style: { textAlign: 'right' } },
                { style: { textIndent: '2pt' } }, { index: 6, style: { textAlign: 'right' } },
                { index: 8, style: { textAlign: 'center' } }, { index: 9, style: { textAlign: 'right' } }]
        }, { height: 42 }, { height: 42 }, { height: 42 }, { height: 42 }, { height: 42 },
        { height: 42 }, { height: 42 }, { height: 42 }, { height: 42 }, { height: 42 }, { height: 42 }, { height: 42 }, { height: 42 },
        { height: 42 }, { height: 42 }];

    public sheets: SheetModel[] = [{
        name: 'Order Details',
        ranges: [{ dataSource: this.data }],
        columns: this.columns,
        rows: this.rows,
        showGridLines: false
    }];
    created() {
        // Temporarily suspends UI rendering to batch model updates for better performance.
        this.spreadsheetObj.suspendRefresh();
        //Applying cell formatting dynamically using cellFormat method.
        this.spreadsheetObj.cellFormat({ fontWeight: 'bold', backgroundColor: '#4b5366', color: '#ffffff', fontSize: '12pt' }, 'A1:J1');
        this.spreadsheetObj.cellFormat({ fontWeight: 'bold', textIndent: '2pt' }, 'B2:B16');
        this.spreadsheetObj.cellFormat({ fontStyle: 'italic', textIndent: '2pt' }, 'E2:E16');
        this.spreadsheetObj.cellFormat({ textIndent: '2pt' }, 'F1:F16');
        this.spreadsheetObj.cellFormat({ textIndent: '2pt' }, 'G1:G16');
        this.spreadsheetObj.cellFormat({ textAlign: 'center', fontWeight: 'bold' }, 'I2:I16');
        this.spreadsheetObj.cellFormat({ fontFamily: 'Helvetica New', verticalAlign: 'middle' }, 'A1:J16');
        //Applying border to a range
        this.spreadsheetObj.setBorder({ border: '1px solid #e0e0e0' }, 'A1:J16', 'Outer');
        this.spreadsheetObj.setBorder({ border: '1px solid #e0e0e0' }, 'A2:J15', 'Horizontal');
        // Applying a short date format to a range.
        this.spreadsheetObj.numberFormat('m/d/yyyy', 'D2:D16');
        // Applying currency format to a range.
        this.spreadsheetObj.numberFormat('$#,##0.00', 'J2:J16');
        // Applying subscript and superscript format.
        this.spreadsheetObj.updateCell({ richText: [
                { text: 'Mineral Water H' },
                { text: '2', style: { verticalAlign: 'sub' } },
                { text: 'O' }
            ] }, 'C2');
        this.spreadsheetObj.updateCell({ richText: [
                { text: 'Energy Supplement C' },
                { text: '6', style: { verticalAlign: 'sub' } },
                { text: 'H' },
                { text: '12', style: { verticalAlign: 'sub' } },
                { text: 'O' },
                { text: '6', style: { verticalAlign: 'sub' } }
            ] }, 'C4');
        this.spreadsheetObj.updateCell({ richText: [
                { text: 'Refrigerant Gas CO' },
                { text: '2', style: { verticalAlign: 'sub' } }
            ] }, 'C6');
        this.spreadsheetObj.updateCell({ richText: [
                { text: 'Water Purifier H' },
                { text: '2', style: { verticalAlign: 'sub' } },
                { text: 'O System' }
            ] }, 'C10');
        this.spreadsheetObj.updateCell({ richText: [
                { text: 'n' },
                { text: 'o', style: { verticalAlign: 'super' } },
                { text: ' 59 rue de l Abbaye' }
            ] }, 'E2');
        this.spreadsheetObj.updateCell({ richText: [
                { text: '2' },
                { text: 'e', style: { verticalAlign: 'super' } },
                { text: ' rue du Commerce' }
            ] }, 'E5');
        this.spreadsheetObj.updateCell({ richText: [
                { text: '22' },
                { text: 'nd', style: { verticalAlign: 'super' } },
                { text: ' Carrera con Ave. Carlos Soublette' }
            ] }, 'E11');
        this.spreadsheetObj.updateCell({ richText: [
                { text: '6' },
                { text: 'th', style: { verticalAlign: 'super' } },
                { text: ' street, Kirchgasse' }
            ] }, 'E12');
        this.spreadsheetObj.updateCell({ richText: [
                { text: '101 4' },
                { text: 'th', style: { verticalAlign: 'super' } },
                { text: ' Street, San Francisco' }
            ] }, 'E16');
        // Resumes rendering and applies all queued UI updates at once.
        this.spreadsheetObj.resumeRefresh();
    }
    beforeCellRender(args: CellRenderEventArgs) {
        if (!this.spreadsheetObj.isOpen && this.spreadsheetObj.sheets[this.spreadsheetObj.activeSheetIndex].name === 'Order Details') {
            if (args.cell && args.cell.value) {
                // Applying cell formatting before rendering the particular cell
                switch (args.cell.value) {
                    case 'Delivered':
                        this.spreadsheetObj.cellFormat({ color: '#10c469', textDecoration: 'line-through' }, args.address);
                        break;
                    case 'Shipped':
                        this.spreadsheetObj.cellFormat({ color: '#62c9e8' }, args.address);
                        break;
                    case 'Pending':
                        this.spreadsheetObj.cellFormat({ color: '#FFC107', textDecoration: 'underline' }, args.address);
                        break;
                    case 'Cancelled':
                        this.spreadsheetObj.cellFormat({ color: '#ff5b5b' }, args.address);
                        break;
                }
            }
        }
    }
}
