import { Component, ElementRef, Inject, ViewChild, OnInit } from '@angular/core';
import { SpreadsheetAllModule, SheetModel, AIAssistSettingsModel, PromptRequestEventArgs, AIAssistService, SpreadsheetComponent } from '@syncfusion/ej2-angular-spreadsheet';
import { grossPay } from './spreadsheetData';

@Component({
    selector: 'app-smart-spreadsheet',
    standalone: true,
    imports: [SpreadsheetAllModule],
    providers: [AIAssistService], // Add the AI Assist Service into the providers for enabling AI features.
    templateUrl: './ai-smart-spreadsheet.component.html'
})
export class SmartSpreadsheetComponent implements OnInit {
        constructor(@Inject('sourceFiles') private sourceFiles: any) {
        this.sourceFiles.files = [
          'ai-smart-spreadsheet.component.html'
        ];
    }
    @ViewChild('spreadsheet', { static: false }) spreadsheet!: SpreadsheetComponent;    
    /* custom code start */
    public visitorId: string | null = null;
    /* custom code end */
    public aiAssistSettings: AIAssistSettingsModel | {};

    public sheet: SheetModel[] = [
        {
            ranges: [{
                dataSource: grossPay,
                startCell: 'A3'
            },
            ],
            name: 'Gross Pay',
            rows: [{
                cells: [{
                    value: 'Gross Pay Calculation',
                    style: {
                        fontSize: '20pt', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#B3FFB3',
                        verticalAlign: 'middle'
                    }
                }]
            },
            {
                index: 13,
                cells: [{
                    index: 7, value: 'Total Gross',
                    style: { border: '1px solid #A6A6A6', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }
                },
                {
                    index: 8, formula: '=Sum(I4:I13)', format: '$#,##0.00',
                    style: { border: '1px solid #A6A6A6', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }
                }]
            }
            ],
            columns: [
                { width: 88, }, { width: 120 }, { width: 106 }, { width: 98 }, { width: 110 },
                { width: 110 }, { width: 110 }, { width: 98 }, { width: 130 }
            ]
        }];

    public height: string = "708px";
    public openUrl = 'https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/open';
    public saveUrl = 'https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/save';


    async ngOnInit(): Promise<void> {
        /* custom code start */
        const generateId = async () => {
            this.visitorId = await this.fingerPrint();
        };
        await generateId();
        /* custom code end */

        let requestUrl: string = 'Enter your AI SERVICE URL' + '/api/AIAssist/Chat';
        /* custom code start */
        requestUrl = 'https://document.syncfusion.com/web-services/ej2-documents-ai-service/api/AIAssist/Chat';
        /* custom code end */
        this.aiAssistSettings = {
            requestUrl: requestUrl,
            placeholder: 'Ask the AI about this sheet.',
            promptSuggestions: [
                'Analyze this dataset and summarize',
                'Highlight important values in this sheet',
                'Format this sheet for better readability'
            ]
        };
    }

    public onCreate(): void {
        if (!this.spreadsheet) {
            return;
        }
        this.spreadsheet.merge('A1:I2');
        this.spreadsheet.setBorder({ border: '1px solid #A6A6A6' }, 'A1:I13');
        this.spreadsheet.cellFormat({ textAlign: 'center', verticalAlign: 'middle' }, 'A3:I13');
        this.spreadsheet.cellFormat({ backgroundColor: '#B3FFB3', fontWeight: 'bold' }, 'A3:I3');
        this.spreadsheet.numberFormat('$#,##0.00', 'H4:I13');
        this.spreadsheet.wrap('H3:I3');
        this.spreadsheet.addDataValidation({ type: 'Time', operator: 'LessThan', value1: '9:00:00 AM', ignoreBlank: false }, 'E4:E13');
        this.spreadsheet.addDataValidation({ type: 'Time', operator: 'LessThan', value1: '6:00:00 PM', ignoreBlank: false }, 'F4:F13');
        this.spreadsheet.addDataValidation({ type: 'WholeNumber', operator: 'LessThan', value1: '10', ignoreBlank: false }, 'G4:G13');
        this.spreadsheet.addDataValidation({ type: 'WholeNumber', operator: 'LessThan', value1: '250', ignoreBlank: false }, 'H4:H13');
        this.spreadsheet.addDataValidation({ type: 'WholeNumber', operator: 'LessThan', value1: '300', ignoreBlank: false }, 'I4:I13');
    }

    /* custom code start */
    public async fingerPrint(): Promise<string | null> {
        try {
            const canvas: HTMLCanvasElement = document.createElement('canvas');
            canvas.width = 600;
            canvas.height = 300;
            canvas.style.display = 'none';
            document.body.appendChild(canvas);
            const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Canvas context not available');
            }
            const size: number = 24;
            const diamondSize: number = 28;
            const gap: number = 4;
            const startX: number = 30;
            const startY: number = 30;
            const blue: string = '#1A3276';
            const orange: string = '#F28C00';
            const colorMap: string[][] = [
                ['blue', 'blue', 'diamond'],
                ['blue', 'orange', 'blue'],
                ['blue', 'blue', 'blue']
            ];
            const drawSquare: (x: number, y: number, color: string) => void = (x: number, y: number, color: string): void => {
                ctx!.fillStyle = color;
                ctx!.fillRect(x, y, size, size);
            };
            const drawDiamond: (centerX: number, centerY: number, size: number, color: string) => void =
                (centerX: number, centerY: number, size: number, color: string): void => {
                    ctx!.fillStyle = color;
                    ctx!.beginPath();
                    ctx!.moveTo(centerX, centerY - size / 2);
                    ctx!.lineTo(centerX + size / 2, centerY);
                    ctx!.lineTo(centerX, centerY + size / 2);
                    ctx!.lineTo(centerX - size / 2, centerY);
                    ctx!.closePath();
                    ctx!.fill();
                };
            for (let row: number = 0; row < 3; row++) {
                for (let col: number = 0; col < 3; col++) {
                    const type: string = colorMap[row as number][col as number];
                    const x: number = startX + col * (size + gap);
                    const y: number = startY + row * (size + gap);
                    if (type === 'blue') {
                        drawSquare(x, y, blue);
                    } else if (type === 'orange') {
                        drawSquare(x, y, orange);
                    } else if (type === 'diamond') {
                        drawDiamond(x + size / 2, y + size / 2, diamondSize, orange);
                    }
                }
            }
            ctx.font = '20px Arial';
            ctx.fillStyle = blue;
            ctx.textBaseline = 'middle';
            ctx.fillText('Syncfusion', startX + 3 * (size + gap) + 20, startY + size + gap);
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'rgb(255,0,255)';
            ctx.beginPath(); ctx.arc(50, 200, 50, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgb(0,255,255)';
            ctx.beginPath(); ctx.arc(100, 200, 50, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgb(255,255,0)';
            ctx.beginPath(); ctx.arc(75, 250, 50, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgb(255,0,255)';
            ctx.beginPath();
            ctx.arc(200, 200, 75, 0, Math.PI * 2, true);
            ctx.arc(200, 200, 25, 0, Math.PI * 2, true);
            ctx.fill('evenodd');
            const sha256: (str: string) => Promise<string> = async (str: string): Promise<string> => {
                const encoder: TextEncoder = new TextEncoder();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data: any = encoder.encode(str);
                const hashBuffer: ArrayBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray: number[] = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map((b: number) => ('0' + b.toString(16)).slice(-2)).join('');
            };
            const visitorID: string = await sha256(canvas.toDataURL());
            document.body.removeChild(canvas);
            return visitorID;
        } catch (error) {
            return null;
        }
    }
    /* custom code end */

    public onPromptRequestHandler(args: PromptRequestEventArgs): void {
        // You can handle custom logic, such as adding headers or modifying request data, here.
        /* custom code start */
        if (args.requestData) {
            if (this.visitorId) {
                (args.requestData as any).body.visitorId = this.visitorId;
            }
        }
        /* custom code end */
    }
}
