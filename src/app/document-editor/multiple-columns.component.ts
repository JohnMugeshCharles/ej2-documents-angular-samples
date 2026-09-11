import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToolbarService, RibbonService, DocumentEditorContainerComponent, DocumentEditorContainerModule } from '@syncfusion/ej2-angular-documenteditor';
import { TitleBar } from './title-bar';
import { multiplecolumns, WEB_API_ACTION } from './data';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { SBDescriptionComponent } from '../common/dp.component';

import { SBActionDescriptionComponent } from '../common/adp.component';
import { ButtonModule, SwitchModule, SwitchComponent } from '@syncfusion/ej2-angular-buttons';
import { createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-angular-popups';
/**
 * Document Editor Component
 */
@Component({
    selector: 'control-content',
    templateUrl: 'multiple-columns.html',
    encapsulation: ViewEncapsulation.None,
    providers: [ToolbarService, RibbonService],
    standalone: true,
    imports: [DocumentEditorContainerModule, SwitchModule, SBActionDescriptionComponent, SBDescriptionComponent]
})
export class MultipleColumnsComponent {
    public hostUrl: string = 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/';
    @ViewChild('documenteditor_default')
    public container: DocumentEditorContainerComponent;
    @ViewChild('switch')
    public switch: SwitchComponent;
    public culture: string = 'en-US';
    titleBar: TitleBar;

    public fileMenuItems: any = [
        'New',
        'Open',
        {
            text: 'Export',
            id: 'custom_item',
            iconCss: 'e-icons e-export',
            items: [
                { id: 'sfdt', text: 'Syncfusion Document Text (*.sfdt)' },
                { id: 'docx', text: 'Word Document (*.docx)' },
                { id: 'dotx', text: 'Word Template (*.dotx)' },
                { id: 'text', text: 'Plain Text (*.txt)' },
                { id: 'pdf', text: 'PDF (*.pdf)' },
                { id: 'html', text: 'HyperText Markup Language (*.html)' },
                { id: 'rtf', text: 'Rich Text Format (*.rtf)' },
                { id: 'md', text: 'Markdown (*.md)' },
                { id: 'odt', text: 'OpenDocument Text (*.odt)' },
                { id: 'wordml', text: 'Word XML Document (*.xml)' }
            ],
        },
        'Print',
    ];

    public fileMenuItemClick(args: any): void {
        if (args.item.id) {
            let value: string = args.item.id;
            switch (value) {
                case 'docx':
                this.container.documentEditor.save('Sample', 'Docx');
                break;
                case 'sfdt':
                this.container.documentEditor.save('Sample', 'Sfdt');
                break;
                case 'text':
                this.container.documentEditor.save('Sample', 'Txt');
                break;
                case 'dotx':
                this.container.documentEditor.save('Sample', 'Dotx');
                break;
                case 'pdf':
                this.formatSave('Pdf');
                break;
                case 'html':
                this.formatSave('Html');
                break;
                case 'odt':
                this.formatSave('Odt');
                break;
                case 'md':
                this.formatSave('Md');
                break;
                case 'rtf':
                this.formatSave('Rtf');
                break;
                case 'wordml':
                this.formatSave('Xml');
                break;
            }
        }
    }

    public formatSave(type: string): void {
        createSpinner({
            target: document.getElementById('container'),
        });
        showSpinner(document.getElementById('container'));
        let format: string = type;
        let url = this.container.documentEditor.serviceUrl + 'Export';
        let http = new XMLHttpRequest();
        http.open('POST', url);
        http.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        http.responseType = 'blob'; // Set the responseType to 'blob' to handle binary data

        // Prepare data to send
        let sfdt = {
            Content: this.container.documentEditor.serialize(),
            Filename: this.container.documentEditor.documentName,
            Format: '.' + format,
        };

        // Set up event listener for the response
        http.onload = () => {
            if (http.status === 200) {
                // Handle the response blob here
                let responseData = http.response;

                // Create a Blob URL for the response data
                let blobUrl = URL.createObjectURL(responseData);

                // Create a link element and trigger the download
                let downloadLink = document.createElement('a');
                downloadLink.href = blobUrl;
                downloadLink.download = this.container.documentEditor.documentName + '.' + format.toLowerCase();
                document.body.appendChild(downloadLink);
                hideSpinner(document.getElementById('container'));
                downloadLink.click();

                // Cleanup: Remove the link and revoke the Blob URL
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(blobUrl);
            } else {
                // Handle errors
                console.error('Request failed with status:', http.status);
                hideSpinner(document.getElementById('container'));
            }
        };

        // Send the request with JSON.stringify(sfdt) as the request body
        http.send(JSON.stringify(sfdt));
    }

    onCreate(): void {
        this.switch.checked = true;
        let titleBarElement: HTMLElement = document.getElementById('default_title_bar');
        this.titleBar = new TitleBar(titleBarElement, this.container.documentEditor, true);
        this.container.documentEditor.open(JSON.stringify(multiplecolumns));
        this.container.documentEditor.documentName = 'Multiple Columns';
        this.container.documentEditorSettings.showRuler = true;
        this.titleBar.updateDocumentTitle();
        this.titleBar.showButtons(false);
    }

    onDocumentChange(): void {
        if (!isNullOrUndefined(this.titleBar)) {
            this.titleBar.updateDocumentTitle();
        }
        this.container.documentEditor.focusIn();
    }
    public change(e: any): void {
        if (e.checked) {
            this.container.toolbarMode = "Ribbon";
        }
        else {
            this.container.toolbarMode = "Toolbar";
        }
        this.titleBar.showButtons(this.container.toolbarMode != "Ribbon");
    }
}