import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import {
  PdfViewer,
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
} from '@syncfusion/ej2-pdfviewer';
import { Browser } from '@syncfusion/ej2-base';
import { Fab } from '@syncfusion/ej2-buttons';
import {
  AIAssistView,
  ToolbarSettingsModel,
  AssistViewModel,
  PromptRequestEventArgs
} from '@syncfusion/ej2-interactive-chat';

@Component({
  selector: 'app-summarizer',
  templateUrl: 'summarizer.html',
})
export class SummarizerComponent implements AfterViewInit, OnDestroy {
  private parentContainerId = 'e-pv-AI-parent-container';
  ngOnDestroy(): void {
    // Remove parent container if it exists
    const parentContainer = document.getElementById(this.parentContainerId);
    if (parentContainer && parentContainer.parentNode) {
      parentContainer.parentNode.removeChild(parentContainer);
    }
  }
  public gifSrc: string = 'assets/images/summarize.gif';

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

    // Use default.component.ts pattern
    const pdfviewer: PdfViewer = new PdfViewer();
    pdfviewer.serviceUrl =  'https://document.syncfusion.com/web-services/pdf-viewer/api/pdfviewer';
    pdfviewer.documentPath = 'https://cdn.syncfusion.com/content/pdf/pdf-succinctly.pdf';
    pdfviewer.documentLoad = documentLoad;
    pdfviewer.zoomMode = 'FitToPage';
    pdfviewer.documentUnload = documentUnLoad;

    // Match the host in summarizer.html
    pdfviewer.appendTo('#e-pv-summarizer-pdfviewer');

    const button: Fab = new Fab({ iconCss: 'e-icons e-aiassist-chat' });
    const fabButton = document.getElementById('e-pv-fab-btn');
    const leftContainer = document.getElementById('e-pv-left-container');
    const rightContainer = document.getElementById('e-pv-right-container');
    button.appendTo('#e-pv-fab-btn');
    if (button.element) {
      (button.element as any).onclick = showAI;
    }

    let initialResponse: boolean = false;

    function documentLoad(_: any) {
      if (fabButton) fabButton.style.display = 'block';
    }

    function documentUnLoad(_: any) {
      if (rightContainer) rightContainer.style.display = 'none';
      if (!Browser.isDevice) {
        if (leftContainer) leftContainer.style.width = '100%';
        pdfviewer.updateViewerContainer();
      }
      if (fabButton) fabButton.style.display = 'block';
      aiAssistViewInst.prompts = [];
      aiAssistViewInst.promptSuggestions = [];
      initialResponse = false;
    }

    function showAI() {
      if (fabButton) fabButton.style.display = 'none';
      if (!Browser.isDevice) {
        if (leftContainer) leftContainer.style.width = '70%';
        pdfviewer.updateViewerContainer();
      }
      if (rightContainer) rightContainer.style.display = 'block';
      if (!initialResponse) {
        aiAssistViewInst.executePrompt('Summarize the document');
      }
    }

    const bannerViewTemplate: string =
      `<div class="ai-assist-banner"><div class="e-icons e-aiassist-chat"></div><h2>AI Assistance</h2><div class="ai-assist-banner-subtitle">Your everyday AI companion</div></div>`;

    const assistViewToolbarSettings: ToolbarSettingsModel = {
      itemClicked: function (args: any) {
        if (args.item.iconCss == 'e-icons e-close') {
          if (fabButton) fabButton.style.display = 'block';
          if (!Browser.isDevice) {
            if (leftContainer) leftContainer.style.width = '100%';
          }
          if (rightContainer) rightContainer.style.display = 'none';
          if (!Browser.isDevice) pdfviewer.updateViewerContainer();
        }
        if (args.item.iconCss == 'e-icons e-refresh') {
          const lastPropmt: any = aiAssistViewInst.prompts[aiAssistViewInst.prompts.length - 1].prompt;
          const editedPrompts: any = aiAssistViewInst.prompts;
          editedPrompts.pop();
          aiAssistViewInst.prompts = editedPrompts;
          aiAssistViewInst.onPropertyChanged(aiAssistViewInst);
          aiAssistViewInst.executePrompt(lastPropmt);
        }
      },
      items: [{ iconCss: 'e-icons e-refresh', align: 'Right' }, { iconCss: 'e-icons e-close', align: 'Right' }]
    };
    const assistViews: AssistViewModel[] = [{ iconCss: 'e-icons e-aiassist-chat' }];

    const aiAssistViewInst: AIAssistView = new AIAssistView({
      promptPlaceholder: 'Type your prompt for assistance...',
      promptSuggestionsHeader: 'Suggested Prompts',
      responseIconCss: 'e-icons e-aiassist-chat',
      views: assistViews,
      toolbarSettings: assistViewToolbarSettings,
      width: '100%',
      height: '100vh',
      bannerTemplate: bannerViewTemplate,
      promptRequest: promptRequestToAI
    });
    aiAssistViewInst.appendTo('#e-pv-defaultAIAssistView');

    function promptRequestToAI(args: PromptRequestEventArgs) {
      if (!initialResponse) {
        initialResponse = true;
        callAIAssist();
      } else {
        const post: any = (args as any).prompt;
        const url: any = 'http://localhost:62869/api/pdfviewer/GetAnswer';
        const xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open('Post', url, true);
        xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = xhr.responseText;
            try {
              let summarizeResponse = GetResponse(response);
              const responseSuggestions = GetSuggestion(response);
              const _promptSuggestions: string[] = responseSuggestions;

              const references = extractReferences(summarizeResponse);
              let modifiedResponse = summarizeResponse;
              const referenceToLink: { [key: string]: string } = {};
              references.forEach((ref) => {
                const pageNumber = ref.replace(/[\[\]]/g, '');
                const linkTag = `<a href='#' id="page-${pageNumber}" onclick="handlePageLinkClick(${parseInt(pageNumber, 10)})">${pageNumber}</a>`;
                referenceToLink[ref] = linkTag;
              });
              Object.keys(referenceToLink).forEach(ref => {
                const regex = new RegExp(ref, 'g');
                modifiedResponse = modifiedResponse.replace(regex, referenceToLink[ref]);
              });

              aiAssistViewInst.addPromptResponse(modifiedResponse);
              aiAssistViewInst.promptSuggestions = _promptSuggestions;
              aiAssistViewInst.onPropertyChanged(aiAssistViewInst);
            } catch (e) {
              console.error('Failed to parse response as JSON:', e);
            }
          } else {
            console.error('Request failed with status:', xhr.status, xhr.statusText);
          }
        };
        xhr.onerror = function () { console.error('Network error'); };
        xhr.send(JSON.stringify({ question: post }));
      }
    }

    function GetResponse(text: any): string {
      const jsonResponse = JSON.parse(text);
      let suggestions = jsonResponse.split('\nsuggestions');
      suggestions = suggestions.filter((s: string) => s.trim() !== '');
      const summarizeResponse = suggestions[suggestions.length - 2].trim();
      return summarizeResponse;
    }

    function GetSuggestion(text: any): string[] {
      const jsonResponse = JSON.parse(text);
      let suggestions = jsonResponse.split('\nsuggestions');
      suggestions = suggestions.filter((s: string) => s.trim() !== '');
      suggestions.shift();
      let responseSuggestions = suggestions[0].split('\n');
      responseSuggestions = responseSuggestions.filter((s: string) => s.trim() !== '');
      responseSuggestions = responseSuggestions.map((line: string) => line.replace(/^\d+\.\s*/, ''));
      return responseSuggestions;
    }

    function extractReferences(text: string): string[] {
      const referenceRegex = /\[(.*?)\]/g;
      const matches: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = referenceRegex.exec(text)) !== null) {
        const numbers = match[1].split(',').map(num => num.trim());
        matches.push(...numbers);
      }
      return matches;
    }

    (window as any).handlePageLinkClick = function (pageNumber: number) {
      pdfviewer.navigation.goToPage(pageNumber);
    };

    function callAIAssist() {
      const data: any = pdfviewer.getRootElement();
      const hashId: any = data.ej2_instances[0].viewerBase.hashId;
      const post: any = JSON.stringify({ hashId });
      const url: any = 'http://localhost:62869/api/pdfviewer/SummarizePDF';
      const xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.open('Post', url, true);
      xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = xhr.responseText;
            const summarizeResponse = GetResponse(response);
            const responseSuggestions = GetSuggestion(response);
            const _promptSuggestions: string[] = responseSuggestions;
            aiAssistViewInst.promptSuggestions = _promptSuggestions;
            aiAssistViewInst.addPromptResponse(summarizeResponse);
            aiAssistViewInst.onPropertyChanged(aiAssistViewInst);
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
  }
  
}