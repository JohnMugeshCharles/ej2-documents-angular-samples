import { Component, OnInit } from '@angular/core';
import { PdfDataExtractor, TextSearchResult } from '@syncfusion/ej2-pdf-data-extract';
import { PdfDocument } from '@syncfusion/ej2-pdf';
import { Button } from '@syncfusion/ej2-buttons';

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OccurrenceInfo {
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  templateUrl: './find-text.html',
  selector: 'control-content',
  standalone: true,
})
export class FindTextComponent implements OnInit {

  private readonly DEFAULT_PDF_URL = 'https://cdn.syncfusion.com/content/pdf-resources/pdf-succinctly.pdf';
  private selectedFile: File | null = null;
  private currentPdfUrl: string = this.DEFAULT_PDF_URL;

  /**
   * Angular lifecycle hook.
   * Currently unused, but kept for future initialization needs.
   */
  ngOnInit(): void { }

  /**
   * Angular lifecycle hook for post-view initialization.
   * Initializes the button component.
   */
  ngAfterViewInit(): void {
    const findTextButton: Button = new Button();
    findTextButton.appendTo('#findBtn');
  }

  /**
   * Triggers the hidden file input click.
   */
  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }

  /**
   * Handles file selection event.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      const filenameDisplay = document.getElementById('filenameDisplay') as HTMLSpanElement;
      filenameDisplay.textContent = file.name;
      this.clearMessages();
    }
  }

  /**
   * Finds text in the PDF document.
   */
  async findText(): Promise<void> {
    const searchTextInput = document.getElementById('searchText') as HTMLInputElement;
    const resultTextarea = document.getElementById('resultTextarea') as HTMLTextAreaElement;
    const searchText = searchTextInput.value.trim();

    if (!searchText) {
      this.showError('Please enter text to search.');
      return;
    }

    this.clearMessages();
    resultTextarea.value = '';

    try {
      // Determine which PDF to use
      let pdfBytes: Uint8Array;
      if (this.selectedFile) {
        pdfBytes = await this.readFileAsBytes(this.selectedFile);
      } else {
        pdfBytes = await this.readFromPdfResources(this.currentPdfUrl);
      }

      // Create PDF document instance
      const pdf = new PdfDocument(pdfBytes);

      // Use PdfDataExtractor to find text with options
      const extractor = new PdfDataExtractor(pdf);
      const matchCaseCheckbox = document.getElementById('matchCaseCheckbox') as HTMLInputElement;
      const wholeWordCheckbox = document.getElementById('wholeWordCheckbox') as HTMLInputElement;

      const options = {
        caseSensitive: matchCaseCheckbox.checked,
        wholeWord: wholeWordCheckbox.checked
      };
      const results: TextSearchResult = extractor.findTextSync(searchText, options);

      const occurrences: OccurrenceInfo[] = [];
      let totalMatches = 0;

      // Collect all occurrences with coordinates
      results.searchResults.forEach((boundsCollection: Rectangle[], pageNumber: number): void => {
        boundsCollection.forEach((rectangle: Rectangle): void => {
          occurrences.push({
            pageNumber: pageNumber,
            x: rectangle.x,
            y: rectangle.y,
            width: rectangle.width,
            height: rectangle.height
          });
          totalMatches++;
        });
      });

      pdf.destroy();

      // Display results
      if (totalMatches > 0) {
        let resultText = `The text "${searchText}" appears ${totalMatches} times in this document\n`;

        occurrences.forEach((occurrence: OccurrenceInfo, index: number): void => {
          resultText += `Occurrence ${index + 1} is on page ${occurrence.pageNumber} with the following coordinates: `;
          resultText += `X:${occurrence.x}; Y:${occurrence.y}; Width:${occurrence.width}; Height:${occurrence.height}\n`;
        });

        resultTextarea.value = resultText;
        this.showSuccess(`Search complete. Found ${totalMatches} match(es).`);
      } else {
        resultTextarea.value = `No matches found for "${searchText}" in the PDF.`;
        this.showError('Search complete. No matches found.');
      }
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'An error occurred during search.');
    }
  }

  /**
   * Reads a file as bytes.
   */
  private async readFileAsBytes(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject): void => {
      const reader = new FileReader();
      reader.onload = (): void => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(new Uint8Array(reader.result));
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = (): void => {
        reject(new Error('File reading error'));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Fetches PDF from a URL.
   */
  private async readFromPdfResources(url: string): Promise<Uint8Array> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch PDF: ${res.status} ${res.statusText}`);
    }
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  }

  /**
   * Shows error message.
   */
  private showError(message: string): void {
    const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
    const successMessage = document.getElementById('successMessage') as HTMLDivElement;
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
  }

  /**
   * Shows success message.
   */
  private showSuccess(message: string): void {
    const successMessage = document.getElementById('successMessage') as HTMLDivElement;
    const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
  }

  /**
   * Clears all messages.
   */
  private clearMessages(): void {
    const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
    const successMessage = document.getElementById('successMessage') as HTMLDivElement;
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    errorMessage.textContent = '';
    successMessage.textContent = '';
  }
}
