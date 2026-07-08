import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import {
  PdfViewer,
  RectangleSettings,
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
  FormDesigner,
  PageOrganizer
} from '@syncfusion/ej2-pdfviewer';
import { Browser } from '@syncfusion/ej2-base';
import { ClickEventArgs, Button } from '@syncfusion/ej2-buttons';
import { AppBar, Toolbar as Tool, TreeView } from '@syncfusion/ej2-navigations';
import { ContextMenuItem } from '@syncfusion/ej2-angular-pdfviewer';
import { createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-popups';

@Component({
  selector: 'app-smartredact',
  templateUrl: 'smartredact.html',
})
export class SmartRedactComponent implements AfterViewInit, OnDestroy {
  public gifSrc: string = 'assets/images/smart-redact.gif';
  private headerId = 'e-pv-smartredact-defaultappbar';
  private appbarContainerId = 'e-pv-smartredact-appbar-container';

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
      FormDesigner,
      PageOrganizer
    );

    const pdfviewer: PdfViewer = new PdfViewer();
    pdfviewer.serviceUrl =  'https://document.syncfusion.com/web-services/pdf-viewer/api/pdfviewer';
    pdfviewer.enableAnnotationToolbar = false;
    pdfviewer.enableToolbar = false;
    pdfviewer.contextMenuSettings = {
      contextMenuAction: 'RightClick',
      contextMenuItems: [ContextMenuItem.Delete],
    };
    pdfviewer.downloadFileName = 'SmartRedaction.pdf';
    pdfviewer.zoomMode = 'FitToPage';
    pdfviewer.annotationAdd = annotationAdded;
    pdfviewer.annotationRemove = annotationRemove;
    pdfviewer.documentLoad = documentLoaded;
    pdfviewer.created = sampleCreated;
    pdfviewer.appendTo('#e-pv-smartredact-pdfviewer');
    if (pdfviewer.element) {
      pdfviewer.load('Confidential_Medical_Record.pdf','');
    }

    let downloadBtn = document.getElementById('e-pv-smartredact-downloadBtn');
    const scanTreeObj = document.getElementById('e-pv-smartredact-treeViewScanObj');
    const selectedTreeObj = document.getElementById('e-pv-smartredact-treeViewSelectedObj');
    let scnaBtnObj = document.getElementById('e-pv-smartredact-redactScanBtn');
    let redactApplyBtnObj = document.getElementById('e-pv-smartredact-redactApplyBtn');
    let redactCancelBtnObj = document.getElementById('e-pv-smartredact-redactCancelBtn');
    const rightContainer = document.getElementById('e-pv-smartredact-right-container');
    const rightContainerBlack = document.getElementById('e-pv-smartredact-right-container-blackout');
    const fileUploadBtn = document.getElementById('e-pv-smartredact-fileUpload');
    const zoomInBtn = document.getElementById('zoominButton');
    const zoomOutBtn = document.getElementById('zoomoutButton');
    const leftContainer = document.getElementById('e-pv-smartredact-left-container');
    const parentContainer = document.querySelector('.e-pv-viewer-container');
    let smartRedactContainerOpen = false;
    let isFindMobileDevice = false;
    let selectedTreeObjData: { [key: string]: Object }[] = [];
    let selectedTreeViewObj: TreeView = new TreeView();
    let redactionCount: number = 0;

    if (downloadBtn) downloadBtn.addEventListener('click', downloadClicked);

    function downloadClicked() { pdfviewer.download(); }

    function annotationAdded(_: any) { redactionCount++; updateRedactButton(); }

    function annotationRemove(args: any) {
      const subject = args.annotationBounds.parentObj.properties.subject;
      selectedTreeViewObj.uncheckAll([subject]);
      redactionCount--;
      updateRedactButton();
    }

    function sampleCreated(_: any) {
      const appbarContainer = document.getElementById('e-pv-smartredact-appbar-container');
      if (appbarContainer) appbarContainer.style.display = 'block';
    }

    function documentLoaded(_: any) {
      toolbarObj.hideItem(7, false);
      isMobileDevice();
      if (smartRedactContainerOpen) openSmartReact();
      selectedTreeObjData = [];
      annotationCollection = [];
      redactionCount = 0;
      updateRedactButton();
    }

    function updateRedactButton() {
      const toolbarRedactBtn = document.getElementById('redactButton');
      if (!toolbarRedactBtn) return;
      if (redactionCount > 0) {
        toolbarObj.enableItems(toolbarRedactBtn, true);
        redactAIBtn.disabled = false; redactAIBtn.dataBind();
      } else {
        toolbarObj.enableItems(toolbarRedactBtn, false);
        redactAIBtn.disabled = true; redactAIBtn.dataBind();
      }
    }

    const defaultAppBarObj: AppBar = new AppBar({ colorMode: 'Dark' });
    defaultAppBarObj.appendTo('#e-pv-smartredact-defaultappbar');
    let downloadBtnObj: Button = new Button({ cssClass: 'e-inherit', iconCss: 'e-icons e-download e-btn-icon e-icon-left', content: 'Download' });
    downloadBtnObj.appendTo('#e-pv-smartredact-downloadBtn');

    let toolbarObj: Tool = new Tool({
      items: [
        { prefixIcon: 'e-icons e-folder', tooltipText: 'Open', text: 'Open File', id: 'openButton', cssClass: 'e-pv-open-container', click: openDocument },
        { type: 'Separator', tooltipText: 'separator', align: 'Left' },
        { prefixIcon: 'e-icons e-circle-remove', tooltipText: 'Zoom Out', text: 'Zoom Out', id: 'zoomoutButton', cssClass: 'e-pv-zoomout-container', click: zoomOutClicked },
        { prefixIcon: 'e-icons e-circle-add', tooltipText: 'Zoom In', text: 'Zoom In', id: 'zoominButton', cssClass: 'e-pv-zoomin-container', click: zoomInClicked },
        { type: 'Separator', tooltipText: 'separator' },
        { prefixIcon: 'e-icons e-pv-smartredact-mark-redact', tooltipText: 'Mark for Redaction', text: 'Mark for Redaction', id: 'markforRedaction', cssClass: 'e-pv-mark-container', click: applyRectangle },
        { prefixIcon: 'e-icons e-redaction', tooltipText: 'Redaction', text: 'Redaction', id: 'redactButton', cssClass: 'e-pv-redact-container', click: redactionApply },
        { prefixIcon: 'e-icons e-redaction', tooltipText: 'Smart Redaction', text: 'Smart Redaction', id: 'smartredactButton', cssClass: 'e-pv-smartredact-container', align: 'Right', click: openSmartReact },
      ],
    });
    toolbarObj.appendTo('#e-pv-smartredact-toolbar');
    if (toolbarObj.element) toolbarObj.hideItem(7, true);

    let treeObjData: { [key: string]: Object }[] = [
      { id: 1, name: 'Select All', hasChild: true, expanded: true, isChecked: true },
      { id: 2, pid: 1, name: 'Person Names' },
      { id: 3, pid: 1, name: 'Organization Names' },
      { id: 4, pid: 1, name: 'Email addresses' },
      { id: 5, pid: 1, name: 'Phone Numbers' },
      { id: 6, pid: 1, name: 'Addresses' },
      { id: 7, pid: 1, name: 'Dates' },
      { id: 8, pid: 1, name: 'Account Numbers' },
      { id: 9, pid: 1, name: 'Credit Card Numbers' }
    ];
    let treeObj: TreeView = new TreeView({
      fields: { dataSource: treeObjData, id: 'id', parentID: 'pid', text: 'name', hasChildren: 'hasChild' },
      showCheckBox: true,
    });
    treeObj.appendTo('#e-pv-smartredact-scantree');
    let scanBtn: Button = new Button({ content: 'Scan', isPrimary: true });
    scanBtn.appendTo('#e-pv-smartredact-redactScanBtn');
    let redactAIBtn: Button = new Button({ content: 'Redact', isPrimary: true });
    redactAIBtn.appendTo('#e-pv-smartredact-redactApplyBtn');
    let redactCancelBtn: Button = new Button({ content: 'Cancel' });
    redactCancelBtn.appendTo('#e-pv-smartredact-redactCancelBtn');

    if (rightContainer) { createSpinner({ target: rightContainer }); hideSpinner(rightContainer); }
    scnaBtnObj?.addEventListener('click', scanBtnClicked);
    redactApplyBtnObj?.addEventListener('click', redactionApply);
    redactCancelBtnObj?.addEventListener('click', redactCancel);

    parentContainer?.addEventListener('touchstart', checkClickedDiv);

    function checkClickedDiv(_: any) {
      if (Browser.isDevice && !isFindMobileDevice) {
        if (rightContainer) {
          rightContainer.style.display = 'none';
          smartRedactContainerOpen = false;
        }
      }
    }

    function isMobileDevice(): boolean {
      const isMobile = Browser.isDevice;
      const sampleContent = document.getElementById('e-pv-smart-redact-container');
      if (isMobile) {
        const rect = sampleContent?.getBoundingClientRect();
        const minW = 450;
        if (rect && rect.width > minW) return false;
        else return true;
      }
      isFindMobileDevice = isMobile;
      return isMobile;
    }

    function getNamesByIds(ids: string[], data: { [key: string]: any }[]): string[] {
      return data.filter(item => ids.indexOf(item.id.toString()) !== -1).map(item => item.name);
    }

    function applyRectangle() {
      pdfviewer.rectangleSettings = { author: 'Redaction' };
      pdfviewer.annotation.setAnnotationMode('Rectangle');
    }

    interface Dimension {
      height: number;
      width: number;
      x: number;
      y: number;
      author: string;
      pageNumber: number;
      subject: string;
    }
    let annotationCollection: Dimension[] = [];

    function redactCancel() {
      if (rightContainer) {
        if (rightContainerBlack) rightContainerBlack.style.display = 'block';
        showSpinner(rightContainer);
      }
      for (let i = 0; i < annotationCollection.length; i++) {
        if (annotationCollection[i].subject.includes('Details')) {
          const filtered = (pdfviewer as any).annotationCollection.filter((item: any) => item.subject === annotationCollection[i].subject);
          if (filtered[0]) (pdfviewer as any).annotationModule.deleteAnnotationById(filtered[0].annotationId);
        }
      }
      updateRedactButton();
      selectedTreeObjData = [];
      annotationCollection = [];
      if (rightContainer) {
        if (rightContainerBlack) rightContainerBlack.style.display = 'none';
        hideSpinner(rightContainer);
      }
      if (scanTreeObj) scanTreeObj.style.display = 'block';
      if (selectedTreeObj) selectedTreeObj.style.display = 'none';
    }

    function redactionApply() {
      if (redactAIBtn.disabled == false) {
        pdfviewer.saveAsBlob().then(function (value) {
          if (rightContainer) {
            if (rightContainerBlack) rightContainerBlack.style.display = 'block';
            showSpinner(rightContainer);
          }
          const reader = new FileReader();
          reader.readAsDataURL(value);
          reader.onload = (e) => {
            const base64String = e.target?.result as string;
            sendRedactionequest(base64String);
            selectedTreeObjData = [];
            annotationCollection = [];
            redactionCount = 0;
          };
        });
      }
    }

    function sendRedactionequest(data: string) {
      const post = JSON.stringify({ hashId: data });
      const url = 'http://localhost:62869/api/pdfviewer/AIRedaction';
      const xhr = new XMLHttpRequest();
      xhr.open('Post', url, true);
      xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            if (rightContainer) {
              if (rightContainerBlack) rightContainerBlack.style.display = 'none';
              hideSpinner(rightContainer);
            }
            if (smartRedactContainerOpen) openSmartReact();
            pdfviewer.load(xhr.responseText, 'null');
            if (scanTreeObj) scanTreeObj.style.display = 'none';
            if (selectedTreeObj) selectedTreeObj.style.display = 'none';
          } catch (e) {
            console.error('Failed to parse response as JSON:', e);
          }
        } else {
          console.error('Request failed with status:', xhr.status, xhr.statusText);
        }
      };
      xhr.onerror = function () { console.error('Network error'); };
      xhr.send(post);
    }

    function scanBtnClicked() {
      if (rightContainer) {
        if (rightContainerBlack) rightContainerBlack.style.display = 'block';
        showSpinner(rightContainer);
      }
      const data: any = pdfviewer.getRootElement();
      const hashId: any = data.ej2_instances[0].viewerBase.hashId;
      const selectedItems: string[] = (treeObj as any).getAllCheckedNodes();
      const names: string[] = getNamesByIds(selectedItems, treeObjData);
      const post: any = JSON.stringify({ jsonObject: { hashId }, selectedItems: names });
      const url = 'http://localhost:62869/api/pdfviewer/FindTextinDocument';
      const xhr = new XMLHttpRequest();
      xhr.open('Post', url, true);
      xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const jsonResponse = JSON.parse(xhr.responseText);
            let count = 1;
            let pidNumber: string | undefined;
            selectedTreeObjData.push({ id: `SelectAll`, name: `Select All`, expanded: true, hasChild: true, isChecked: true });
            for (let i = 0; i < (pdfviewer as any).viewerBase.pageCount; i++) {
              if (jsonResponse[i].length != 0) {
                selectedTreeObjData.push({ id: `Page${i + 1}`, name: `Page ${i + 1}`, pid: 'SelectAll', expanded: true, hasChild: true, isChecked: true });
                pidNumber = `Page${i + 1}`;
                for (let j = 0; j < jsonResponse[i].length; j++) {
                  const content: string = jsonResponse[i][j].SensitiveInformation;
                  selectedTreeObjData.push({ id: `Details${count}`, name: `${content}`, pid: pidNumber });
                  const annotObj: Dimension = {
                    width: jsonResponse[i][j].Bounds.Width,
                    height: jsonResponse[i][j].Bounds.Height,
                    x: jsonResponse[i][j].Bounds.X,
                    y: jsonResponse[i][j].Bounds.Y,
                    author: 'Redaction',
                    pageNumber: i + 1,
                    subject: `Details${count}`,
                  };
                  (pdfviewer as any).annotation.addAnnotation('Rectangle', {
                    width: annotObj.width,
                    height: annotObj.height,
                    offset: { x: annotObj.x, y: annotObj.y },
                    author: 'Redaction',
                    pageNumber: annotObj.pageNumber,
                    subject: annotObj.subject,
                  } as RectangleSettings);
                  annotationCollection.push(annotObj);
                  count++;
                }
              }
            }
            selectedTreeViewObj.fields = { dataSource: selectedTreeObjData, id: 'id', parentID: 'pid', text: 'name', hasChildren: 'hasChild' };
            selectedTreeViewObj.showCheckBox = true;
            selectedTreeViewObj.nodeChecked = nodeCheckedChange;
            selectedTreeViewObj.nodeSelected = nodeSelected;
            selectedTreeViewObj.dataBind();
            if (rightContainer) {
              if (rightContainerBlack) rightContainerBlack.style.display = 'none';
              hideSpinner(rightContainer);
            }
            if (scanTreeObj) scanTreeObj.style.display = 'none';
            if (selectedTreeObj) selectedTreeObj.style.display = 'block';
          } catch (e) {
            console.error('Failed to parse response as JSON:', e);
          }
        } else {
          console.error('Request failed with status:', xhr.status, xhr.statusText);
        }
      };
      xhr.onerror = function () { console.error('Network error'); };
      xhr.send(post);
    }
    selectedTreeViewObj.appendTo('#e-pv-smartredact-selectedTree');

    function openDocument(_: ClickEventArgs): void { fileUploadBtn?.click(); }

    function separateNumbersAndStrings(input: string): number[] {
      const numbers: number[] = [];
      const regex = /\d+/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(input)) !== null) numbers.push(parseInt(match[0], 10));
      return numbers;
    }

    function nodeSelected(args: any) {
      if (args.nodeData.parentID) {
        if (args.nodeData.parentID.includes('Page')) {
          const pageNumber = separateNumbersAndStrings(args.nodeData.parentID);
          pdfviewer.navigation.goToPage(pageNumber[0]);
        } else {
          const pageNumber = separateNumbersAndStrings(args.nodeData.id);
          pdfviewer.navigation.goToPage(pageNumber[0]);
        }
      }
    }

    function nodeCheckedChange(args: any) {
      if (args.action == 'check') {
        for (let i = 0; i < args.data.length; i++) {
          if (args.data[i].id.includes('Details')) {
            const filtered = annotationCollection.filter(item => item.subject === args.data[i].id);
            if (filtered[0]) {
              (pdfviewer as any).annotation.addAnnotation('Rectangle', {
                width: filtered[0].width,
                height: filtered[0].height,
                offset: { x: filtered[0].x, y: filtered[0].y },
                author: 'Redaction',
                pageNumber: filtered[0].pageNumber,
                subject: filtered[0].subject,
              } as RectangleSettings);
            }
          }
        }
        updateRedactButton();
      }
      if (args.action == 'uncheck') {
        for (let i = 0; i < args.data.length; i++) {
          if (args.data[i].id.includes('Details')) {
            const filtered = (pdfviewer as any).annotationCollection.filter((item: any) => item.subject === args.data[i].id);
            if (filtered[0]) {
              (pdfviewer as any).annotationModule.deleteAnnotationById(filtered[0].annotationId);
            }
          }
        }
        updateRedactButton();
      }
    }

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

    function openSmartReact() {
      if (!smartRedactContainerOpen) {
        if (!Browser.isDevice) {
          if (leftContainer) leftContainer.style.width = '70%';
          (pdfviewer as any).updateViewerContainer();
          toolbarObj.refreshOverflow();
        }
        if (rightContainer) rightContainer.style.display = 'block';
        if (scanTreeObj) scanTreeObj.style.display = 'block';
        if (selectedTreeObj) selectedTreeObj.style.display = 'none';
        smartRedactContainerOpen = true;
      } else {
        if (!Browser.isDevice) {
          if (leftContainer) leftContainer.style.width = '100%';
          setTimeout(() => { (pdfviewer as any).updateViewerContainer(); }, 50);
          toolbarObj.refreshOverflow();
        }
        if (rightContainer) rightContainer.style.display = 'none';
        smartRedactContainerOpen = false;
      }
    }

    function zoomInClicked(_: ClickEventArgs): void {
      (pdfviewer as any).magnification.zoomIn();
      updateZoomBtn();
    }

    function zoomOutClicked(_: ClickEventArgs): void {
      (pdfviewer as any).magnification.zoomOut();
      updateZoomBtn();
    }

    function updateZoomBtn() {
      if (zoomInBtn && zoomOutBtn) {
        const factor = (pdfviewer as any).magnificationModule.zoomFactor;
        if (factor == 4) {
          toolbarObj.enableItems(zoomInBtn, false);
          toolbarObj.enableItems(zoomOutBtn, true);
        } else if (factor == 0.25) {
          toolbarObj.enableItems(zoomInBtn, true);
          toolbarObj.enableItems(zoomOutBtn, false);
        } else {
          toolbarObj.enableItems(zoomInBtn, true);
          toolbarObj.enableItems(zoomOutBtn, true);
        }
      }
    }

    fileUploadBtn?.addEventListener('change', readFile, false);
  }

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
}