import { Component, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { ToolbarService, DocumentEditorContainerComponent,DocumentEditorContainerModule } from '@syncfusion/ej2-angular-documenteditor';
import { CommonModule } from '@angular/common';
import { DialogComponent,DialogModule  } from '@syncfusion/ej2-angular-popups';
import { TitleBar } from './title-bar';
import { defaultDocument, characterFormat, paragraphFormat, styles, weblayout, WEB_API_ACTION } from './data';
import { SBDescriptionComponent } from '../common/dp.component';
import { SBActionDescriptionComponent } from '../common/adp.component';
import { isNullOrUndefined } from '@syncfusion/ej2-base';

/**
 * Document Editor Component
 */
@Component({
    selector: 'control-content',
    templateUrl: 'document-list.html',
    encapsulation: ViewEncapsulation.None,
    providers: [ToolbarService],
    standalone: true,
    imports: [CommonModule, DocumentEditorContainerModule, SBActionDescriptionComponent, SBDescriptionComponent ,DialogModule ]
})
export class DocumentListComponent implements OnInit {
    public hostUrl: string = 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/';
    @ViewChild('documenteditor_default')
    public container: DocumentEditorContainerComponent;
    @ViewChild('Dialog')
    public dialog: DialogComponent;
 
    public data: any = [];
    public culture: string = 'en-US';
    public position: any = { X: 'center', Y: 'center' };
    titleBar: TitleBar;
    private mode: 'View' | 'Edit' = 'View';

    ngOnInit(): void {
        // ngOnInit function
        this.data = [{
            'FileName': 'Getting Started.docx',
            'Author': 'Ryan Hodson'
        },
        {
            'FileName': 'Character Formatting.docx',
            'Author': 'Elton Stoneman',
        },
        {
            'FileName': 'Paragraph Formatting.docx',
            'Author': 'Peter Shaw',
        },
        {
            'FileName': 'Styles.docx',
            'Author': 'Cody Lindley',
        },
        {
            'FileName': 'Web layout.docx',
            'Author': 'Scott Allen',
        }];
    }

    onDialogCreate(): void {
        let dialogElement: HTMLElement = document.getElementById('component-dialog');
    }

    onCreate(): void {
        let titleBarElement: HTMLElement = document.getElementById('default_title_bar');
        this.titleBar = new TitleBar(titleBarElement, this.container.documentEditor, true, false, this.dialog);
    }

    onDocumentChange(): void {
        if (!isNullOrUndefined(this.titleBar)) {
            this.titleBar.updateDocumentTitle();
        }
        this.container.documentEditor.focusIn();
    }

    public onActionClick(mode: 'View' | 'Edit', rowData: { FileName: string }): void {
        this.mode = mode;
        let currentDocument = rowData.FileName;
        this.container.documentEditor.documentName = currentDocument.replace(".docx", "");
        this.titleBar.updateDocumentTitle();
        switch (currentDocument) {
            case "Getting Started.docx":
            this.container.documentEditor.open(JSON.stringify((<any>defaultDocument))); break;
            case "Character Formatting.docx":
            this.container.documentEditor.open(JSON.stringify((<any>characterFormat))); break;
            case "Paragraph Formatting.docx":
            this.container.documentEditor.open(JSON.stringify((<any>paragraphFormat))); break;
            case "Styles.docx":
            this.container.documentEditor.open(JSON.stringify((<any>styles))); break;
            case "Web layout.docx":
            this.container.documentEditor.open(JSON.stringify((<any>weblayout))); break;
        }
        if(mode === 'View'){
            this.container.documentEditor.isReadOnly = true;
            this.container.documentEditor.enableContextMenu = false;
            this.container.showPropertiesPane = false;
            document.getElementById('documenteditor-share').style.display ='none';
            this.container.toolbarItems = ['Open', 'Separator', 'Find'];
        } else {
            this.container.documentEditor.isReadOnly = false;
            this.container.documentEditor.enableContextMenu = true;
            this.container.showPropertiesPane = true;
            this.container.documentEditorSettings.showRuler = true;
            document.getElementById('documenteditor-share').style.display ='block';
            this.container.toolbarItems = ['New', 'Open', 'Separator', 'Undo', 'Redo', 'Separator', 'Image', 'Table', 'Hyperlink', 'Bookmark', 'TableOfContents', 'Separator', 'Header', 'Footer', 'PageSetup', 'PageNumber', 'Break', 'InsertFootnote', 'InsertEndnote', 'Separator', 'Find', 'Separator', 'Comments', 'TrackChanges', 'Separator', 'LocalClipboard', 'RestrictEditing', 'Separator', 'FormFields', 'UpdateFields'];
        }
        this.dialog.show();
    }
}