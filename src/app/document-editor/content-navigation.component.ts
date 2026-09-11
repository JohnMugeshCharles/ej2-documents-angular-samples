import { Component, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentEditorContainerComponent, DocumentEditorContainerModule, RibbonService, ToolbarService } from '@syncfusion/ej2-angular-documenteditor';
import { ButtonModule, ChangeEventArgs, SwitchComponent, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { TitleBar } from './title-bar';
import { weblayout } from './data';
import { SBDescriptionComponent } from '../common/dp.component';
import { SBActionDescriptionComponent } from '../common/adp.component';
import { createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-angular-popups';

/**
 * Represents an item displayed in the findings panel.
 */
interface Finding {
    bookmark: string;
    pageNumber: number;
    preview: string;
    color: string;
}

/**
 * Represents predefined content that must be located inside the document.
 */
interface ParagraphDefinition {
    bookmark: string;
    text: string;
    color: string;
}

/**
 * Paragraphs that will be searched, highlighted,
 * bookmarked, and displayed in the findings panel.
 */
const PARAGRAPHS: ParagraphDefinition[] = [
    {
        bookmark: 'Para_Bookmark_1',
        text:
            'The giant panda, which only lives in China outside of captivity, has captured the hearts of people of all ages across the globe.',
        color: '#ec4899'
    },
    {
        bookmark: 'Para_Bookmark_2',
        text:
            "DNA analysis has put one mystery to rest. It has revealed that while the red panda is a distant relation, the giant panda's closest relative is the spectacled bear from South America.",
        color: '#3b82f6'
    },
    {
        bookmark: 'Para_Bookmark_3',
        text:
            'Researchers have recently discovered that the gene responsible for tasting savory or umami flavors, such as meat, is inactive in giant pandas.',
        color: '#22c55e'
    }
];

/**
 * Document Editor Content Navigation component.
 */
@Component({
    selector: 'control-content',
    templateUrl: 'content-navigation.html',
    encapsulation: ViewEncapsulation.None,
    providers: [ ToolbarService, RibbonService ],
    standalone: true,
    imports: [ CommonModule, DocumentEditorContainerModule, SwitchModule, ButtonModule, SBActionDescriptionComponent, SBDescriptionComponent ]
})
export class ContentNavigationComponent implements OnDestroy {
    @ViewChild('documenteditor_default')
    public container!: DocumentEditorContainerComponent;
    @ViewChild('switch')
    public switch: SwitchComponent;
    public hostUrl: string = 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/';
    public culture: string = 'en-US';
    public titleBar!: TitleBar;

    public findings: Finding[] = [];
    public activeIndex: number = -1;
    private bookmarksCreated: boolean = false;
    private createBookmarksTimer: ReturnType<typeof setTimeout> | undefined;

    public fileMenuItems: any = [
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

    /**
     * Toolbar items for Toolbar mode.
     */
    public toolbarItems: any = [
        'Undo',
        'Redo',
        'Separator',
        'Image',
        'Table',
        'Hyperlink',
        'Bookmark',
        'TableOfContents',
        'Separator',
        'Header',
        'Footer',
        'PageSetup',
        'PageNumber',
        'Break',
        'Separator',
        'Find',
        'Separator',
        'Comments',
        'TrackChanges',
        'Separator',
        'LocalClipboard',
        'Separator',
        'FormFields',
        'UpdateFields'
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

    public onCreate(): void {
        if (!this.container || !this.container.documentEditor) {
            return;
        }

        if (this.switch) {
            this.switch.checked = true;
        }

        const titleBarElement: HTMLElement | null = document.getElementById('content_navigation_title_bar');

        if (titleBarElement) {
            this.titleBar = new TitleBar(titleBarElement, this.container.documentEditor,true);
        }

        const editor = this.container.documentEditor;
        editor.open(JSON.stringify(weblayout));
        this.container.documentEditor.documentName = 'Content Navigation';
        editor.documentName = 'Content Navigation';
        editor.documentEditorSettings.showRuler = true;
        editor.documentEditorSettings.showNavigationPane = false;
        editor.pageOutline = '#E0E0E0';
        editor.acceptTab = true;

        if (!isNullOrUndefined(this.titleBar)) {
            this.titleBar.updateDocumentTitle();
            this.titleBar.showButtons(false);
        }
        editor.resize();
    }

    /**
     * Executes whenever the document is opened or changed.
     */
    public onDocumentChange(): void {
        if (!this.container || !this.container.documentEditor) {
            return;
        }

        if (!isNullOrUndefined(this.titleBar)) {
            this.titleBar.updateDocumentTitle();
        }

        this.container.documentEditor.focusIn();
        if (!this.bookmarksCreated) {
            if (this.createBookmarksTimer) {
                clearTimeout(this.createBookmarksTimer);
            }

            this.createBookmarksTimer = setTimeout((): void => {
                this.createBookmarks();
            }, 500);
        }
    }

    /**
     * Switches between Ribbon and Toolbar UI.
     */
    public change(args: ChangeEventArgs): void {
        if (!this.container) {
            return;
        }

        this.container.toolbarMode = args.checked ? 'Ribbon' : 'Toolbar';
        if (!isNullOrUndefined(this.titleBar)) {
            this.titleBar.showButtons(this.container.toolbarMode !== 'Ribbon');
        }
        setTimeout((): void => {
            this.container.documentEditor.resize();
        });
    }

    /**
     * Finds the predefined paragraphs, highlights them,
     * creates bookmarks, and populates the findings panel.
     */
    private createBookmarks(): void {
        const editor = this.container?.documentEditor;
        if (!editor || this.bookmarksCreated) {
            return;
        }
        const results: Finding[] = [];
        editor.isReadOnly = false;

        PARAGRAPHS.forEach(
            (paragraph: ParagraphDefinition): void => {
                editor.search.findAll(paragraph.text);
                const searchResults = editor.search.searchResults;
                if (searchResults.length > 0) {
                    searchResults.index = 0;
                    const pageNumber: number = editor.selection.startPage;
                    editor.selection.characterFormat.highlightColor = 'Yellow';
                    editor.editor.insertBookmark(paragraph.bookmark);
                    results.push({ 
                        bookmark: paragraph.bookmark, pageNumber, preview: this.getPreview(paragraph.text), color: paragraph.color
                    });
                }
                searchResults.clear();
            }
        );

        editor.selection.moveToDocumentStart();
        editor.isReadOnly = true;

        this.findings = results;
        this.activeIndex = results.length > 0 ? 0 : -1;
        this.bookmarksCreated = true;
        setTimeout((): void => {
            editor.resize();
        });
    }

    /**
     * Navigates to a bookmark selected from the findings panel.
     */
    public navigateToBookmark( bookmark: string, index: number): void {
        const editor = this.container?.documentEditor;
        if (!editor) {
            return;
        }
        editor.selection.selectBookmark(bookmark);
        editor.focusIn();
        this.activeIndex = index;
    }

    /**
     * Navigates to the next highlighted finding.
     */
    public nextHighlight(): void {
        if (this.findings.length === 0) {
            return;
        }
        const nextIndex: number = (this.activeIndex + 1) % this.findings.length;
        const nextFinding: Finding = this.findings[nextIndex];
        this.navigateToBookmark(nextFinding.bookmark, nextIndex);
    }

    /**
     * Creates the shortened text displayed in the findings panel.
     */
    private getPreview(text: string): string {
        const words: string[] = text.trim().split(/\s+/);
        const preview: string = words.slice(0, 8).join(' ');
        return words.length > 8 ? `${preview}...` : preview;
    }

    /**
     * TrackBy callback for findings.
     */
    public trackByBookmark( _index: number, finding: Finding): string {
        return finding.bookmark;
    }

    public ngOnDestroy(): void {
        if (this.createBookmarksTimer) {
            clearTimeout(this.createBookmarksTimer);
        }
    }
}
