
import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { PdfViewer, Toolbar, Magnification, Navigation, Annotation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, FormFields, FormDesigner } from '@syncfusion/ej2-pdfviewer';
import { Browser } from '@syncfusion/ej2-base';
import { ClickEventArgs, Button } from '@syncfusion/ej2-buttons';
import { AppBar, Toolbar as Tool } from '@syncfusion/ej2-navigations';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { FormFieldDataFormat } from '@syncfusion/ej2/pdfviewer';
import { TextArea } from '@syncfusion/ej2-inputs';
import { createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-popups';

@Component({
  selector: 'app-smartfill',
  templateUrl: 'smartfill.html',
})
export class SmartFillComponent implements AfterViewInit, OnDestroy {
  private headerId = 'e-pv-smartfill-defaultappbar';
  private appbarContainerId = 'e-pv-smartfill-appbar-container';
  ngOnDestroy(): void {
    // Remove header if it exists
    const header = document.getElementById(this.headerId);
    if (header && header.parentNode) {
      header.parentNode.removeChild(header);
    }
    // Remove appbar container if it exists
    const appbarContainer = document.getElementById(this.appbarContainerId);
    if (appbarContainer && appbarContainer.parentNode) {
      appbarContainer.parentNode.removeChild(appbarContainer);
    }
  }
  // Use Angular assets path so the GIF is copied to the build output
  public gifSrc: string = 'assets/images/smart-fill.gif';

  ngAfterViewInit(): void {
    PdfViewer.Inject(
      Toolbar,
      Magnification,
      Navigation,
      Annotation,
      LinkAnnotation,
      ThumbnailView,
      BookmarkView,
      TextSelection,
      TextSearch,
      FormFields,
      FormDesigner
    );

    const pdfviewer: PdfViewer = new PdfViewer();
    pdfviewer.serviceUrl = 'https://document.syncfusion.com/web-services/pdf-viewer/api/pdfviewer';
    pdfviewer.enableAnnotationToolbar = false;
    pdfviewer.enableToolbar = false;
    pdfviewer.zoomMode = 'FitToPage';
    pdfviewer.downloadFileName = 'SmartFill.pdf';
    pdfviewer.created = sampleCreated;
    pdfviewer.pageClick = checkClickedDiv;
    pdfviewer.documentLoad = documentLoaded;
    pdfviewer.appendTo('#e-pv-smartfill-pdfviewer');
    if (pdfviewer.element) {
        pdfviewer.load('form_document_1.pdf','');
    }

    const rightContainer = document.getElementById('e-pv-smartfill-right-container');
    const leftContainer = document.getElementById('e-pv-smartfill-left-container');
    const rightContainerBlack = document.getElementById('e-pv-smartfill-right-container-blackout');
    const parentContainer = document.querySelector('.e-pv-viewer-container');
    if (rightContainerBlack) {
      createSpinner({ target: rightContainerBlack });
      hideSpinner(rightContainerBlack);
    }
    let smartFillContainerOpen = false;
    let isFindMobileDevice = false;
    const fileUploadBtn = document.getElementById('e-pv-smartfill-fileUpload');

    function documentLoaded(args: any) {
      toolbarObj.hideItem(5, false);
    }

    function downloadClicked() {
      pdfviewer.download();
      isMobileDevice();
    }

    function printClicked() {
      pdfviewer.print.print();
    }

    function sampleCreated(args: any) {
      const appbarContainer = document.getElementById('e-pv-smartfill-appbar-container');
      if (appbarContainer) {
        appbarContainer.style.display = 'block';
      }
    }

    const defaultAppBarObj: AppBar = new AppBar({ colorMode: 'Dark' });
    defaultAppBarObj.appendTo('#e-pv-smartfill-defaultappbar');

    let toolbarObj: Tool = new Tool({
      items: [
        { prefixIcon: 'e-icons e-folder', tooltipText: 'Open', text: 'Open File', id: 'openButton', cssClass: 'e-pv-open-container', click: openDocument },
        { type: 'Separator', tooltipText: 'separator', align: 'Left' },
        { prefixIcon: 'e-icons e-download', tooltipText: 'Save', text: 'Save', id: 'saveButton', cssClass: 'e-pv-save-container', click: downloadClicked },
        { prefixIcon: 'e-icons e-print', tooltipText: 'Print', text: 'Print', id: 'printButton', cssClass: 'e-pv-print-container', click: printClicked },
        { type: 'Separator', tooltipText: 'separator' },
        { prefixIcon: 'e-icons e-redaction', tooltipText: 'Smart Fill', text: 'Smart Fill', align: 'Right', id: 'smartFillButton', cssClass: 'e-pv-smartfill-btn-container', click: openSmartFill },
      ],
    });
    toolbarObj.appendTo('#e-pv-smartfill-toolbar');
    if (toolbarObj.element) {
      toolbarObj.hideItem(5, true);
    }

    const listObj: DropDownList = new DropDownList({ index: 0, change: valueChange });
    listObj.appendTo('#e-pv-smartfill-dropdown-options');

    const inputobj1: TextArea = new TextArea({
      floatLabelType: 'Auto',
      value:
        'Hi, this is Alice. You can contact me at alice456@gmail.com. I am female, born on July 15, 1998. I want to unsubscribe from a newspaper and learn courses, specifically a Cloud Computing course. I am from Texas.',
    });
    inputobj1.appendTo('#e-pv-smartfill-default-textarea');

    const smartFillBtn: Button = new Button({ content: 'Fill Form', isPrimary: true });
    smartFillBtn.appendTo('#e-pv-smartfill-submit');
    const smartfillSubmit = document.getElementById('e-pv-smartfill-submit');
    if (smartfillSubmit) {
      smartfillSubmit.addEventListener('click', getSmartFillResult);
    }

    function getSmartFillResult() {
      if (rightContainerBlack) {
        rightContainerBlack.style.display = 'block';
        showSpinner(rightContainerBlack);
      }
      const data: any = pdfviewer.getRootElement();
      const hashId: any = data.ej2_instances[0].viewerBase.hashId;
      const dictionary: any = { hashId };
      const url: any = 'http://localhost:62869/api/pdfviewer/SmartFillClicked';
      const xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.open('Post', url, true);
      xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = xhr.responseText;
          try {
            pdfviewer.importFormFields(response, FormFieldDataFormat.Xfdf);
            pdfviewer.dataBind();
            if (rightContainerBlack) {
              rightContainerBlack.style.display = 'none';
              hideSpinner(rightContainerBlack);
            }
          } catch (e) {
            console.error('Failed to parse response as JSON:', e);
          }
        } else {
          console.error('Request failed with status:', xhr.status, xhr.statusText);
        }
      };
      xhr.onerror = function () {
        console.error('Network error');
      };
      pdfviewer
        .exportFormFieldsAsObject(FormFieldDataFormat.Xfdf)
        .then((xfdfdata: any) => {
          const post: any = JSON.stringify({
            jsonObject: dictionary,
            textareaContent: inputobj1.value,
            exportFormFieldValue: xfdfdata,
          });
          xhr.send(post);
        })
        .catch((error: any) => {
          console.error('Error getting XFDF data:', error);
        });
    }

    function valueChange(args: any) {
      if (args.itemData.text == 'User Registration Form') {
        pdfviewer.load('form_document_1.pdf', '');
        pdfviewer.dataBind();
        inputobj1.value =
          'Hi, this is Alice. You can contact me at alice456@gmail.com. I am female, born on July 15, 1998. I want to unsubscribe from a newspaper and learn courses, specifically a Cloud Computing course. I am from Texas.';
        inputobj1.dataBind();
      }
      if (args.itemData.text == 'Job Application Form') {
        pdfviewer.load('form_document_2.pdf', '');
        pdfviewer.dataBind();
        inputobj1.value =
          "Hello, my name is John Paul, and I'm interested in applying for the Coach position. I'm currently self-employed, and you can contact me at johnpaul2209@gmail.com. For reference, please use my designated email: john123@gmail.com.";
        inputobj1.dataBind();
      }
      if (args.itemData.text == 'Contact Form') {
        pdfviewer.load('form_document_3.pdf', '');
        pdfviewer.dataBind();
        inputobj1.value =
          "Hello, My name is Peter Parker. You can contact me at peterparker03@gmail.com or on my personal number, 9876543210. I'm writing to request the blocking of my credit card, which has unfortunately been lost.";
        inputobj1.dataBind();
      }
    }

    if (parentContainer) {
      parentContainer.addEventListener('touchstart', checkClickedDiv);
    }

    function checkClickedDiv(args: any) {
      if (Browser.isDevice && !isFindMobileDevice) {
        if (rightContainer) {
          rightContainer.style.display = 'none';
          smartFillContainerOpen = false;
        }
      }
    }
    function isMobileDevice(): boolean {
      const isMobile = Browser.isDevice;
      const sampleContent = document.getElementById('e-pv-smart-fill-container');
      if (isMobile) {
        const sampleContentRect = sampleContent?.getBoundingClientRect();
        const sampleContentMinWidth = 450;
        if (sampleContentRect && sampleContentRect.width > sampleContentMinWidth) {
          return false;
        } else {
          return true;
        }
      }
      isFindMobileDevice = isMobile;
      return isMobile;
    }

    function openSmartFill() {
      if (!smartFillContainerOpen) {
        if (!Browser.isDevice) {
          if (leftContainer) {
            leftContainer.style.width = '70%';
          }
          pdfviewer.updateViewerContainer();
          pdfviewer.dataBind();
          toolbarObj.refreshOverflow();
        }
        if (rightContainer) {
          rightContainer.style.display = 'block';
        }
        smartFillContainerOpen = true;
      } else {
        if (!Browser.isDevice) {
          if (leftContainer) {
            leftContainer.style.width = '100%';
          }
          setTimeout(() => {
            pdfviewer.updateViewerContainer();
          }, 50);
          toolbarObj.refreshOverflow();
        }
        if (rightContainer) {
          rightContainer.style.display = 'none';
        }
        smartFillContainerOpen = false;
      }
    }

    function openDocument(e: ClickEventArgs): void {
      fileUploadBtn?.click();
    }
    fileUploadBtn?.addEventListener('change', readFile, false);

    function readFile(args: any): void {
      const upoadedFiles: any = args.target.files;
      if (args.target.files[0] !== null) {
        const uploadedFile: File = upoadedFiles[0];
        if (uploadedFile) {
          const reader: FileReader = new FileReader();
          const filename: string = upoadedFiles[0].name;
          reader.readAsDataURL(uploadedFile);
          reader.onload = (e: any): void => {
            const uploadedFileUrl: string = e.currentTarget.result;
            (pdfviewer as any).documentPath = uploadedFileUrl;
            (pdfviewer as any).fileName = filename;
          };
        }
      }
    }
  }
}
