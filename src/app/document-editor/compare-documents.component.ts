import { NgIf } from '@angular/common';
import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToolbarService, SelectionService, DocumentEditorContainerComponent, DocumentEditorContainerModule } from '@syncfusion/ej2-angular-documenteditor';
import { ButtonModule} from '@syncfusion/ej2-angular-buttons';
import { originalDocument, revisedDocument } from './data';

import { SBDescriptionComponent } from '../common/dp.component';
import { SBActionDescriptionComponent } from '../common/adp.component';

@Component({
    selector: 'app-root',
    templateUrl: './compare-documents.html',
    encapsulation: ViewEncapsulation.None,
    providers: [ToolbarService, SelectionService],
    standalone: true,
    imports: [NgIf, DocumentEditorContainerModule, ButtonModule, SBDescriptionComponent, SBActionDescriptionComponent]
})

export class CompareDocumentsComponent {
  @ViewChild('editor1', { static: false }) editorRef1?: DocumentEditorContainerComponent;
  @ViewChild('editor2', { static: false }) editorRef2?: DocumentEditorContainerComponent;

  serviceUrl: string = 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/';
  originalFile: File | null = null;
  revisedFile: File | null = null;
  showResult: boolean = true;
  compareClicked: boolean = false;
  showRevisions: boolean = false;

  ngAfterViewInit() {
    setTimeout(() => {
      const ed1 = this.editorRef1?.documentEditor;
      const ed2 = this.editorRef2?.documentEditor;
      if (ed1 && ed2) {
        ed1.open(JSON.stringify(originalDocument));
        ed2.showRevisions = false;
        ed2.open(JSON.stringify(revisedDocument));
        ed1.viewChange = () => {
          const pos = ed1.selection.getScrollPosition();
          ed2.selection.setScrollPosition(pos);
        };
        ed2.viewChange = () => {
          const pos = ed2.selection.getScrollPosition();
          ed1.selection.setScrollPosition(pos);
        };
      }
    });
  }

  isSupportedFormatType(formatType: string): boolean {
    switch (formatType) {
      case '.docx':
      case '.sfdt':
        return true;
      default:
        return false;
    }
  }

  async openFileInEditor(file: File, editorRef?: DocumentEditorContainerComponent): Promise<void> {
    const formatType = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if(editorRef){
      if (formatType === '.sfdt') {
        const docData = await file.text();
        editorRef.documentEditor.showRevisions = false;
        editorRef.documentEditor.open(docData);
      } else if (this.isSupportedFormatType(formatType)) {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const response = await fetch(this.serviceUrl + 'Import', {
            method: 'POST',
            body: formData,
          });
          const sfdtString = await response.text();
          let sfdtObject: any = null;
          try {
            sfdtObject = JSON.parse(sfdtString);
          } catch (e) {
            alert("Unable to display the compared document. Please try again.");
          }
          if (sfdtObject && editorRef?.documentEditor) {
            editorRef.documentEditor.showRevisions = false;
            editorRef.documentEditor.open(JSON.stringify(sfdtObject));
          } else {
            alert("Unable to display the compared document. Please try again.");
          }
        } catch (e) {
          alert('This Compare Documents demo supports only DOCX and SFDT file formats. Please select a valid DOCX or SFDT document and try again.');
        }
      } else {
        alert('Unsupported file type. Please use either .docx or .sfdt file.');
        this.compareClicked = false;
      }
    }
  }

  async loadComparedDocumentAndOpen(editorRef2: DocumentEditorContainerComponent, originalFile: File, revisedFile: File): Promise<void> {
    const formData = new FormData();
    formData.append('originalFile', originalFile);
    formData.append('revisedFile', revisedFile);
    formData.append("author", "Author");
    formData.append("dateTime", new Date().toISOString());
    try {
      const response = await fetch(this.serviceUrl + 'CompareDocuments', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        alert("Failed to compare the selected documents. Please try again."); 
        return;
      }
      const sfdtString = await response.text();
      let sfdtObject: any = null;
      try {
        sfdtObject = JSON.parse(sfdtString);
      } catch {
        alert("The comparison could not be completed due to no valid JSON. Please try again.");
        return;
      }
      if (sfdtObject && editorRef2?.documentEditor) {
        editorRef2.documentEditor.showRevisions = false;
        editorRef2.documentEditor.open(JSON.stringify(sfdtObject));
      } else {
        alert("Unable to display the comparison result. Please try again.");
      }
    } catch (e) {
      alert('Error on comparing documents: ' + e);
    }
  }

  removeOriginalFile(): void {
      this.originalFile = null;
      this.compareClicked = false;
  }

  removeRevisedFile(): void {
      this.revisedFile = null;
      this.compareClicked = false;
  }

  getOriginalFileName(): string {
    if (!this.originalFile) {
      return 'Supported formats: SFDT, DOCX';
    }

    const size = Math.round(this.originalFile.size / 1024);
    return `${this.originalFile.name} (${size} KB)`;
 }

 getRevisedFileName(): string {
    if (!this.revisedFile) {
      return 'Supported formats: SFDT, DOCX';
    }

    const size = Math.round(this.revisedFile.size / 1024);
    return `${this.revisedFile.name} (${size} KB)`;
 }

  onOriginalFileChange(event: any) {
    this.originalFile = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    this.compareClicked = false;
  }
  onRevisedFileChange(event: any) {
    this.revisedFile = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    this.compareClicked = false;
  }
  onShowResultChange(event: any) {
    this.showResult = event.target.checked;
  }

  showHideWaitingIndicator(show: boolean): void {
    let waitingPopUp: HTMLElement | null = document.getElementById('waiting-popup');
    let inActiveDiv: HTMLElement | null = document.getElementById('popup-overlay');
    if (waitingPopUp && inActiveDiv){
    inActiveDiv.style.display = show ? 'block' : 'none';
    waitingPopUp.style.display = show ? 'block' : 'none';
    }
  }

  async onCompare(): Promise<void> {    
    this.compareClicked = false;
    this.showRevisions = false;
    setTimeout(async () => {
      if (this.originalFile && this.revisedFile){
        var orginalFileFormatType = this.originalFile.name.slice(this.originalFile.name.lastIndexOf('.')).toLowerCase();
        var revisedFileFormatType = this.revisedFile.name.slice(this.revisedFile.name.lastIndexOf('.')).toLowerCase();
        if(this.isSupportedFormatType(orginalFileFormatType) && this.isSupportedFormatType(revisedFileFormatType)){
          this.showHideWaitingIndicator(true);   
          this.compareClicked = true;
          if (this.showResult) {
            if (this.editorRef1)
                await this.openFileInEditor(this.originalFile, this.editorRef1);                       
            if (this.editorRef2)
                await this.loadComparedDocumentAndOpen(this.editorRef2, this.originalFile, this.revisedFile);           
          } else {
            if (this.editorRef1)
              await this.openFileInEditor(this.originalFile, this.editorRef1);
            if (this.editorRef2)
              await this.openFileInEditor(this.revisedFile, this.editorRef2);
          }
          this.showHideWaitingIndicator(false);
        }
        else{          
          alert('Unsupported file type is selected. Please use either .docx or .sfdt file.');
        }
      }
    }, 0);
  }

  onDownload(): void {
    if (this.editorRef2?.documentEditor)
      this.editorRef2.documentEditor.save('Result', 'Docx');
  }

  OnToggleRevisionPane(): void {
    this.showRevisions = !this.showRevisions;
     const editor2 = this.editorRef2?.documentEditor;
      if (editor2) {
        editor2.showRevisions = this.showRevisions;
      }
  }

}