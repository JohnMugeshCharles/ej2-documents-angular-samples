import { Component, ViewEncapsulation, OnInit, ViewChild, ChangeDetectorRef, TemplateRef } from '@angular/core';
import {
    PdfViewerComponent,
    LinkAnnotationService,
    BookmarkViewService,
    MagnificationService,
    ToolbarService,
    NavigationService,
    TextSelectionService,
    PrintService,
    PageChangeEventArgs,
    LoadEventArgs,
    AnnotationService,
    FormDesignerService,
    FormFieldsService,
    PageOrganizerService,
    TextSearchService,
    PdfViewerModule,
    ZoomChangeEventArgs,
} from '@syncfusion/ej2-angular-pdfviewer';
import {
    ToolbarComponent,
    ToolbarModule,
    MenuItemModel,
    MenuModule,
    ClickEventArgs,
} from '@syncfusion/ej2-angular-navigations';
import { ListViewComponent, ListViewModule } from '@syncfusion/ej2-angular-lists';
import { CommonModule } from '@angular/common';
import { SBDescriptionComponent } from '../common/dp.component';
import { SBActionDescriptionComponent } from '../common/adp.component';

interface BookmarkItem {
    id: string;
    title: string;
    pageIndex: number;
    y: number;
    depth: number;
}

interface BookmarkRow {
    rowId: string;
    pageIndex: number;
    bookmark: BookmarkItem;
    displayDepth: number;
}

@Component({
    selector: 'control-content',
    templateUrl: 'pdf-navigation.html',
    encapsulation: ViewEncapsulation.None,
    providers: [
        LinkAnnotationService,
        BookmarkViewService,
        TextSearchService,
        TextSelectionService,
        MagnificationService,
        ToolbarService,
        NavigationService,
        PrintService,
        AnnotationService,
        FormFieldsService,
        FormDesignerService,
        PageOrganizerService,
    ],
    styleUrls: ['pdfviewer.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        ToolbarModule,
        MenuModule,
        ListViewModule,
        PdfViewerModule,
        SBActionDescriptionComponent,
        SBDescriptionComponent,
    ],
})
export class PdfNavigationComponent implements OnInit {
    @ViewChild('pdfviewer') pdfviewerControl: PdfViewerComponent;
    @ViewChild('customToolbar') customToolbar: ToolbarComponent;
    @ViewChild('bookmarkListView') bookmarkListView: ListViewComponent;
    @ViewChild('bookmarkItemTemplate') bookmarkItemTemplate: TemplateRef<any>;

    public bookmarks: BookmarkItem[] = [];
    public bookmarkRows: BookmarkRow[] = [];
    public document: string = 'https://cdn.syncfusion.com/content/pdf/pdf-succinctly.pdf';
    public resource: string = 'https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib';

    private currentPageNumber: string = '1';
    private totalPageCount: number = 0;
    private bookmarkScrollPosition: number = 0;
    private matchCase: boolean = false;
    private searchInputHandlerAttached: boolean = false;

    constructor(private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        // Initialize
        const fileUploadElement = document.getElementById('pdfFileUpload');
        if (fileUploadElement) {
            fileUploadElement.addEventListener('change', this.readFile.bind(this));
        }
    }

    /**
     * Normalize bookmark result from different property naming conventions
     */
    normalizeBookmarkResult(result: any): BookmarkItem[] {
        if (!result) return [];
        const typedResult = result as any;
        const bookmarkRoot = typedResult.bookmarks ?? typedResult.Bookmarks;
        const roots =
            bookmarkRoot?.bookMark ??
            bookmarkRoot?.bookmark ??
            bookmarkRoot?.BookMark ??
            bookmarkRoot ??
            (Array.isArray(result) ? result : []);
        const destinationRoot =
            typedResult.bookmarksDestination ?? typedResult.BookmarksDestination ?? {};
        const destinations =
            destinationRoot.bookMarkDestination ??
            destinationRoot.bookmarkDestination ??
            destinationRoot.BookMarkDestination ??
            destinationRoot;

        const flattened: BookmarkItem[] = [];

        const visit = (nodes: any, depth: number = 0): void => {
            if (!Array.isArray(nodes)) return;
            nodes.forEach((node: any, index: number) => {
                const typedNode = node as any;
                const id = typedNode.Id ?? typedNode.id ?? typedNode.BookmarkId ?? index;
                const destination =
                    destinations?.[Number(id)] ??
                    destinations?.[id] ??
                    typedNode.destination ??
                    typedNode.Destination ??
                    {};
                const destinationTyped = destination as any;
                const pageIndex =
                    destinationTyped.PageIndex ??
                    destinationTyped.pageIndex ??
                    typedNode.PageIndex ??
                    typedNode.pageIndex;
                const y =
                    destinationTyped.Y ??
                    destinationTyped.y ??
                    typedNode.Y ??
                    typedNode.y ??
                    0;

                flattened.push({
                    id: `${depth}-${id}-${flattened.length}`,
                    title:
                        typedNode.Title ??
                        typedNode.title ??
                        typedNode.Text ??
                        typedNode.text ??
                        `Bookmark ${flattened.length + 1}`,
                    pageIndex: Number(pageIndex),
                    y: Number(y),
                    depth,
                });

                visit(
                    typedNode.Child ??
                    typedNode.child ??
                    typedNode.Children ??
                    typedNode.children,
                    depth + 1
                );
            });
        };

        visit(roots);

        const validBookmarks = flattened.filter((bookmark) => Number.isFinite(bookmark.pageIndex));
        validBookmarks.sort((first, second) => {
            const pageDifference = first.pageIndex - second.pageIndex;
            if (pageDifference !== 0) return pageDifference;

            const yDifference = second.y - first.y;
            return yDifference !== 0 ? yDifference : flattened.indexOf(first) - flattened.indexOf(second);
        });
        return validBookmarks;
    }

    /**
     * Create display rows with a fresh hierarchy for each page.
     */
    buildBookmarkRows(bookmarks: BookmarkItem[]): BookmarkRow[] {
        const rows: BookmarkRow[] = [];
        let startIndex = 0;

        while (startIndex < bookmarks.length) {
            const pageIndex = bookmarks[startIndex].pageIndex;
            let endIndex = startIndex;
            let minimumDepth = Number.POSITIVE_INFINITY;

            while (endIndex < bookmarks.length && bookmarks[endIndex].pageIndex === pageIndex) {
                minimumDepth = Math.min(minimumDepth, bookmarks[endIndex].depth);
                endIndex++;
            }

            for (let index = startIndex; index < endIndex; index++) {
                const bookmark = bookmarks[index];
                rows.push({
                    rowId: `bm-${bookmark.id}`,
                    pageIndex: bookmark.pageIndex,
                    bookmark,
                    displayDepth: Math.max(0, bookmark.depth - minimumDepth),
                });
            }
            startIndex = endIndex;
        }

        return rows;
    }

    /**
     * Retrieve bookmarks from PDF
     */
    retrieveBookmarks(): void {
        const viewerInstance = this.pdfviewerControl;
        if (!viewerInstance) return;

        try {
            const result = viewerInstance.bookmark?.getBookmarks();
            const items = this.normalizeBookmarkResult(result);
            this.bookmarks = items;
            this.bookmarkRows = this.buildBookmarkRows(items);
            this.changeDetectorRef.detectChanges();
        } catch (error) {
            console.error('Error retrieving bookmarks:', error);
            this.bookmarks = [];
            this.bookmarkRows = [];
        }
    }

    /**
     * Navigate to the bookmark destination from the rendered row.
     */
    onBookmarkClick(row: BookmarkRow): void {
        const viewerInstance = this.pdfviewerControl;
        if (!viewerInstance || !row?.bookmark) return;

        // Save current scroll position
        const bookmarkContainer = document.querySelector(
            '#bookmark_listview'
        )?.parentElement;
        if (bookmarkContainer) {
            this.bookmarkScrollPosition = bookmarkContainer.scrollTop;
        }

        viewerInstance.bookmark?.goToBookmark(row.bookmark.pageIndex, row.bookmark.y);

        // Restore scroll position after navigation
        setTimeout(() => {
            const bookmarkContainer = document.querySelector(
                '#bookmark_listview'
            )?.parentElement;
            if (bookmarkContainer) {
                bookmarkContainer.scrollTop = this.bookmarkScrollPosition;
            }
        }, 100);
    }

    /**
     * Handle toolbar click events
     */
    onToolbarClick(args: ClickEventArgs): void {
        const viewerInstance = this.pdfviewerControl;
        if (!viewerInstance) return;

        switch (args.item?.id) {
            case 'first_page':
                viewerInstance.navigation.goToFirstPage();
                break;
            case 'previous_page':
                viewerInstance.navigation.goToPreviousPage();
                break;
            case 'next_page':
                viewerInstance.navigation.goToNextPage();
                break;
            case 'last_page':
                viewerInstance.navigation.goToLastPage();
                break;
            case 'open_option':
                this.handleFileOpen();
                break;
            case 'pan_tool':
                this.handlePanTool(args);
                break;
            case 'selection_tool':
                this.handleSelectionTool(args);
                break;
            case 'text_search':
                this.handleTextSearch();
                break;
            case 'zoom_in':
                viewerInstance.magnification.zoomIn();
                break;
            case 'zoom_out':
                viewerInstance.magnification.zoomOut();
                break;
            case 'fit_page':
                viewerInstance.magnification.fitToPage();
                break;
        }
    }

    /**
     * Handle file open
     */
    private handleFileOpen(): void {
        let fileUpload = document.getElementById('pdfFileUpload') as HTMLInputElement | null;
        if (!fileUpload) {
            const input = document.createElement('input') as HTMLInputElement;
            input.id = 'pdfFileUpload';
            input.type = 'file';
            input.accept = '.pdf';
            input.style.display = 'none';
            input.onchange = (e: Event) => {
                const target = e.target as HTMLInputElement;
                const files = target.files;
                if (files && files[0]) {
                    const file = files[0];
                    const reader = new FileReader();
                    reader.onload = (event: ProgressEvent<FileReader>) => {
                        if (event.target?.result) {
                            this.pdfviewerControl.documentPath = event.target.result as string;
                        }
                    };
                    reader.readAsDataURL(file);
                }
            };
            document.body.appendChild(input);
            fileUpload = input;
        }
        fileUpload.click();
    }

    /**
     * Handle pan tool
     */
    private handlePanTool(args: ClickEventArgs): void {
        const viewerInstance = this.pdfviewerControl;
        if (!viewerInstance) return;

        const selectedItem = document.getElementById(args.item?.id || '') as HTMLElement | null;
        const selectTool = document.getElementById('selection_tool') as HTMLElement | null;

        if (selectedItem) {
            selectedItem.classList.add('e-pv-tbar-btn', 'e-pv-select');
        }
        if (selectTool) {
            selectTool.classList.remove('e-pv-select');
        }
        viewerInstance.interactionMode = 'Pan';
    }

    /**
     * Handle selection tool
     */
    private handleSelectionTool(args: ClickEventArgs): void {
        const viewerInstance = this.pdfviewerControl;
        if (!viewerInstance) return;

        const selectedItem = document.getElementById(args.item?.id || '') as HTMLElement | null;
        const panTool = document.getElementById('pan_tool') as HTMLElement | null;

        if (selectedItem) {
            selectedItem.classList.add('e-pv-tbar-btn', 'e-pv-select');
        }
        if (panTool) {
            panTool.classList.remove('e-pv-select');
        }
        viewerInstance.interactionMode = 'TextSelection';
    }

    /**
     * Handle text search toolbar toggle
     */
    private handleTextSearch(): void {
        const toolbar = document.getElementById('textSearchToolbar') as HTMLElement | null;

        if (toolbar && toolbar.style.display === 'block') {
            this.pdfviewerControl?.textSearch.cancelTextSearch();
            const input = document.getElementById('pv_search_input') as HTMLInputElement | null;
            if (input) input.value = '';
            toolbar.style.display = 'none';
        } else if (toolbar) {
            toolbar.style.display = 'block';
            const searchInput = document.getElementById('pv_search_input') as HTMLInputElement | null;
            searchInput?.focus();
        }
    }

    /**
     * Handle page change event
     */
    onPageChange(): void {
        const viewer = this.pdfviewerControl;
        if (!viewer) return;

        this.currentPageNumber = viewer.currentPageNumber.toString();
        const input = document.getElementById('currentPage') as HTMLInputElement | null;
        if (input) {
            input.value = this.currentPageNumber;
        }

        this.updatePageNavigation();
    }

    /**
     * Update page navigation button states
     */
    private updatePageNavigation(): void {
        if (!this.pdfviewerControl || !this.customToolbar) {
            return;
        }

        const currentPage = this.pdfviewerControl.currentPageNumber;
        const totalPages = this.pdfviewerControl.pageCount;

        if (currentPage === 1) {
            this.customToolbar.enableItems(
                document.getElementById('first_page')?.parentElement as HTMLElement,
                false
            );
            this.customToolbar.enableItems(
                document.getElementById('previous_page')?.parentElement as HTMLElement,
                false
            );
            this.customToolbar.enableItems(
                document.getElementById('next_page')?.parentElement as HTMLElement,
                true
            );
            this.customToolbar.enableItems(
                document.getElementById('last_page')?.parentElement as HTMLElement,
                true
            );
        } else if (currentPage === totalPages) {
            this.customToolbar.enableItems(
                document.getElementById('first_page')?.parentElement as HTMLElement,
                true
            );
            this.customToolbar.enableItems(
                document.getElementById('previous_page')?.parentElement as HTMLElement,
                true
            );
            this.customToolbar.enableItems(
                document.getElementById('next_page')?.parentElement as HTMLElement,
                false
            );
            this.customToolbar.enableItems(
                document.getElementById('last_page')?.parentElement as HTMLElement,
                false
            );
        } else {
            this.customToolbar.enableItems(
                document.getElementById('first_page')?.parentElement as HTMLElement,
                true
            );
            this.customToolbar.enableItems(
                document.getElementById('previous_page')?.parentElement as HTMLElement,
                true
            );
            this.customToolbar.enableItems(
                document.getElementById('next_page')?.parentElement as HTMLElement,
                true
            );
            this.customToolbar.enableItems(
                document.getElementById('last_page')?.parentElement as HTMLElement,
                true
            );
        }
    }

    /**
     * Handle zoom change event
     */
    onZoomChange(args: ZoomChangeEventArgs): void {
        if (args.zoomValue === 10) {
            this.customToolbar?.enableItems(
                document.getElementById('zoom_in')?.parentElement as HTMLElement,
                true
            );
            this.customToolbar?.enableItems(
                document.getElementById('zoom_out')?.parentElement as HTMLElement,
                false
            );
        } else if (args.zoomValue === 400) {
            this.customToolbar?.enableItems(
                document.getElementById('zoom_in')?.parentElement as HTMLElement,
                false
            );
            this.customToolbar?.enableItems(
                document.getElementById('zoom_out')?.parentElement as HTMLElement,
                true
            );
        } else {
            this.customToolbar?.enableItems(
                document.getElementById('zoom_in')?.parentElement as HTMLElement,
                true
            );
            this.customToolbar?.enableItems(
                document.getElementById('zoom_out')?.parentElement as HTMLElement,
                true
            );
        }
    }

    /**
     * Handle document load
     */
    onDocumentLoad(args: LoadEventArgs): void {
        const viewer = this.pdfviewerControl;
        if (!viewer) return;

        this.retrieveBookmarks();

        const selectTool = document.getElementById('selection_tool') as HTMLElement | null;
        if (selectTool) {
            selectTool.classList.add('e-pv-tbar-btn', 'e-pv-select');
        }
        const panTool = document.getElementById('pan_tool') as HTMLElement | null;
        if (panTool) {
            panTool.classList.remove('e-pv-select');
        }
        this.totalPageCount = viewer.pageCount;

        const total = document.getElementById('totalPage');
        if (total) {
            total.textContent = `of ${viewer.pageCount}`;
        }

        const input = document.getElementById('currentPage') as HTMLInputElement | null;
        if (input) {
            input.value = '1';
        }

        // Attach page input handler once
        if (input && !this.searchInputHandlerAttached) {
            this.searchInputHandlerAttached = true;
            input.addEventListener('keypress', (e: KeyboardEvent) => {
                if (e.key === 'Enter' && input && this.pdfviewerControl) {
                    const pageNumber = parseInt(input.value, 10);
                    if (
                        !isNaN(pageNumber) &&
                        pageNumber > 0 &&
                        pageNumber <= this.pdfviewerControl.pageCount
                    ) {
                        this.pdfviewerControl.navigation.goToPage(pageNumber);
                    } else {
                        input.value = this.pdfviewerControl.currentPageNumber.toString();
                    }
                }
            });
        }

        this.updatePageNavigation();
    }

    /**
     * Handle search input keypress
     */
    onSearchInputKeypress(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.performTextSearch();
        }
    }

    /**
     * Perform text search
     */
    performTextSearch(): void {
        const searchInput = document.getElementById('pv_search_input') as HTMLInputElement | null;
        const viewerInstance = this.pdfviewerControl;
        if (viewerInstance && searchInput && searchInput.value.trim()) {
            viewerInstance.textSearch.searchText(searchInput.value, this.matchCase);
        }
    }

    /**
     * Handle search icon click
     */
    onSearchIconClick(): void {
        const input = document.getElementById('pv_search_input') as HTMLInputElement | null;
        const viewerInstance = this.pdfviewerControl;
        if (viewerInstance && input && input.value.trim()) {
            viewerInstance.textSearch.searchText(input.value, this.matchCase);
        }
    }

    /**
     * Handle previous search occurrence
     */
    onPreviousSearch(): void {
        const input = document.getElementById('pv_search_input') as HTMLInputElement | null;
        const viewerInstance = this.pdfviewerControl;
        if (viewerInstance && input && input.value.trim()) {
            viewerInstance.textSearch.searchPrevious();
        }
    }

    /**
     * Handle next search occurrence
     */
    onNextSearch(): void {
        const input = document.getElementById('pv_search_input') as HTMLInputElement | null;
        const viewerInstance = this.pdfviewerControl;
        if (viewerInstance && input && input.value.trim()) {
            viewerInstance.textSearch.searchNext();
        }
    }

    /**
     * Handle search input change
     */
    onSearchInputChange(event: any): void {
        const input = event.target as HTMLInputElement;
        if (!input.value.trim()) {
            this.pdfviewerControl?.textSearch.cancelTextSearch();
        }
    }

    /**
     * Handle match case checkbox change
     */
    onMatchCaseChange(event: any): void {
        this.matchCase = event.target.checked;
    }

    /**
     * Get CSS class for bookmark item based on depth
     */
    getBookmarkItemStyle(item: BookmarkItem | any): any {
        const depth = item?.displayDepth ?? item?.depth;
        if (depth === undefined) {
            return {};
        }
        return {
            'paddingLeft': `${depth * 16}px`,
        };
    }

    /**
     * Check if no bookmarks are available
     */
    get hasNoBookmarks(): boolean {
        return this.bookmarks.length === 0;
    }

    /**
     * Get total bookmarks count
     */
    get totalBookmarks(): number {
        return this.bookmarks.length;
    }
    private readFile(args: any): void {
        // tslint:disable-next-line
        let upoadedFiles: any = args.target.files;
        if (args.target.files[0] !== null) {
            let uploadedFile: File = upoadedFiles[0];
            let filename = upoadedFiles[0].name;
            if (uploadedFile) {
                let reader: FileReader = new FileReader();
                reader.readAsDataURL(uploadedFile);
                // tslint:disable-next-line
                let proxy: any = this;
                // tslint:disable-next-line
                reader.onload = (e: any): void => {
                    let uploadedFileUrl: string = e.currentTarget.result;
                    proxy.pdfviewerControl.documentPath = uploadedFileUrl;
                    proxy.pdfviewerControl.fileName = filename;
                    proxy.pdfviewerControl.downloadFileName = filename;
                };
            }
        }
    }
}
