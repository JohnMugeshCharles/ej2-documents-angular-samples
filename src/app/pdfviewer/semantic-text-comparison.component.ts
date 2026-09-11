import { Component, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { PdfComparer, TextComparisonOptions } from '@syncfusion/ej2-pdfviewer';
import { SBDescriptionComponent } from '../common/dp.component';
import { SBActionDescriptionComponent } from '../common/adp.component';
import { CommonModule } from '@angular/common';

/**
 * Semantic Text Comparison Component
 */
@Component({
    selector: 'control-content',
    templateUrl: 'semantic-text-comparison.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        SBActionDescriptionComponent,
        SBDescriptionComponent,
        CommonModule,
        UploaderComponent,
    ],
})

export class SemanticTextComparisonComponent {
    @ViewChild('originalUploader', { static: false }) originalUploader: UploaderComponent;
    @ViewChild('modifiedUploader', { static: false }) modifiedUploader: UploaderComponent;
    @ViewChild('comparerContainer', { static: false }) comparerContainer: ElementRef;

    // Constants
    private DEFAULT_ORIGINAL_DOC = 'https://cdn.syncfusion.com/content/pdf/original-document.pdf';
    private DEFAULT_MODIFIED_DOC = 'https://cdn.syncfusion.com/content/pdf/modified-document.pdf';
    private RESOURCE_URL = 'https://cdn.syncfusion.com/ej2/34.2.4/dist/ej2-pdfviewer-lib';

    // State
    state = {
        originalFile: null as File | null,
        modifiedFile: null as File | null,
        originalFilePath: this.DEFAULT_ORIGINAL_DOC,
        modifiedFilePath: this.DEFAULT_MODIFIED_DOC,
        showUploaders: false
    };

    // Component properties
    pdfComparer: PdfComparer | null = null;
    canCompare = false;
    originalFileName = 'Supported document: PDF';
    modifiedFileName = 'Supported document: PDF';
    showOriginalRemoveBtn = false;
    showModifiedRemoveBtn = false;
    showUploadersOnMobile = false;

    ngAfterViewInit() {
        this.initializeComparer();
    }

    private updateCompareButton() {
        this.canCompare = !!(this.state.originalFile && this.state.modifiedFile);
    }

    onFileChange(args: any, isOriginal: boolean) {
        const fileData = args.filesData && args.filesData[0];
        const file = fileData ? fileData.rawFile : null;

        if (!file) {
            return;
        }

        // Validate that the file is a PDF
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            alert('Please select a valid PDF file.');
            if (isOriginal) {
                this.originalUploader.clearAll();
            } else {
                this.modifiedUploader.clearAll();
            }
            return;
        }

        // Create a file URL for the uploaded file
        const fileUrl = URL.createObjectURL(file);

        if (isOriginal) {
            this.state.originalFile = file;
            this.state.originalFilePath = fileUrl;
        } else {
            this.state.modifiedFile = file;
            this.state.modifiedFilePath = fileUrl;
        }

        this.refreshFileRow(isOriginal);
        this.updateCompareButton();
    }

    private refreshFileRow(isOriginal: boolean) {
        const file = isOriginal ? this.state.originalFile : this.state.modifiedFile;

        if (file) {
            const fileName = file.name + ' (' + Math.round(file.size / 1024) + ' KB)';
            if (isOriginal) {
                this.originalFileName = fileName;
                this.showOriginalRemoveBtn = true;
            } else {
                this.modifiedFileName = fileName;
                this.showModifiedRemoveBtn = true;
            }
        } else {
            if (isOriginal) {
                this.originalFileName = 'Supported document: PDF';
                this.showOriginalRemoveBtn = false;
            } else {
                this.modifiedFileName = 'Supported document: PDF';
                this.showModifiedRemoveBtn = false;
            }
        }
    }

    removeFile(isOriginal: boolean) {
        if (isOriginal) {
            this.state.originalFile = null;
            this.state.originalFilePath = this.DEFAULT_ORIGINAL_DOC;
            if (this.originalUploader) {
                this.originalUploader.clearAll();
            }
        } else {
            this.state.modifiedFile = null;
            this.state.modifiedFilePath = this.DEFAULT_MODIFIED_DOC;
            if (this.modifiedUploader) {
                this.modifiedUploader.clearAll();
            }
        }
        this.refreshFileRow(isOriginal);
        this.updateCompareButton();
    }

    handleCompare() {
        if (!this.state.originalFile || !this.state.modifiedFile) {
            alert('Please select both Original and Modified PDF files before comparing.');
            return;
        }

        try {
            this.state.showUploaders = false;
            this.showUploadersOnMobile = false;
            const textComparison = document.querySelector('.text-comparison');
            if (textComparison) {
                textComparison.classList.remove('mobile-uploaders-open');
            }

            if (this.pdfComparer && typeof this.pdfComparer.compare === 'function') {
                this.pdfComparer.compare(this.state.originalFilePath, this.state.modifiedFilePath);
            }
        } catch (error) {
            console.error('Error comparing documents:', error);
            alert('Error comparing the PDF documents. Please try again.');
        }
    }

    private initializeComparer() {
        const container = this.comparerContainer?.nativeElement;
        if (!container) {
            console.error('Container element not found');
            return;
        }

        try {
            const comparisonOptions: TextComparisonOptions = {
                beforeColor: '#FF0000',
                afterColor: '#00FF00',
                beforeColorOpacity: 0.4,
                afterColorOpacity: 0.4,
                enableHighlights: true
            } as TextComparisonOptions;

            this.pdfComparer = new PdfComparer(
                this.state.originalFilePath,
                this.state.modifiedFilePath,
                this.RESOURCE_URL,
                comparisonOptions,
                true,
                true
            );
            this.pdfComparer.appendTo(container);
        } catch (error) {
            console.error('Error initializing PdfComparer:', error);
        }
    }

    onOriginalFileButtonClick() {
        this.openUploader(this.originalUploader);
    }

    onModifiedFileButtonClick() {
        this.openUploader(this.modifiedUploader);
    }

    private openUploader(uploader: UploaderComponent) {
        if (!uploader || !uploader.element) {
            return;
        }

        const browseButton = uploader.element
            .closest('.e-file-select-wrap')
            ?.querySelector('button') as HTMLButtonElement | null;

        if (browseButton) {
            browseButton.click();
        } else {
            uploader.element.click();
        }
    }

    onMobileUploadClick() {
        this.showUploadersOnMobile = true;
        this.state.showUploaders = true;
        const textComparison = document.querySelector('.text-comparison');
        if (textComparison) {
            textComparison.classList.add('mobile-uploaders-open');
        }
    }

    onMobileCloseClick() {
        this.showUploadersOnMobile = false;
        this.state.showUploaders = false;
        const textComparison = document.querySelector('.text-comparison');
        if (textComparison) {
            textComparison.classList.remove('mobile-uploaders-open');
        }
    }
}
