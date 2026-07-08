import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToolbarService, DocumentEditorContainerComponent, DocumentEditorContainerModule,DocumentEditorSettingsModel, RibbonService } from '@syncfusion/ej2-angular-documenteditor';
import { TitleBar } from './title-bar';
import { languageSfdtData, WEB_API_ACTION } from './data';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { SBDescriptionComponent } from '../common/dp.component';
import { SBActionDescriptionComponent } from '../common/adp.component';
import { ChangeEventArgs, DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxComponent,CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { SwitchComponent, SwitchModule } from '@syncfusion/ej2-angular-buttons';

/**
 * Document Editor Component
 */
@Component({
    selector: 'control-content',
    templateUrl: 'spell-check.html',
    encapsulation: ViewEncapsulation.None,
    providers: [ToolbarService, RibbonService],
    standalone: true,
    imports: [DocumentEditorContainerModule, SwitchModule, SBActionDescriptionComponent, SBDescriptionComponent,CheckBoxModule, DropDownListModule]
})
export class SpellCheckComponent {
    public hostUrl: string = 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/';
    @ViewChild('documenteditor_default')
    public container: DocumentEditorContainerComponent;
    @ViewChild('switch')
    public switch: SwitchComponent;
    @ViewChild('enableSpelling')
    public enableSpellingCheckBox : CheckBoxComponent;
    @ViewChild('showUnderline')
    public showUnderlineCheckBox : CheckBoxComponent;
    @ViewChild('showSuggestions')
    public showSuggestionsCheckBox : CheckBoxComponent;
    titleBar: TitleBar;
    languageData: { text: string; value: number }[] = [
        { text: 'English', value: 1033 },
        { text: 'Spanish', value: 1034 },
    ];
    public fields = { text: 'text', value: 'value' };
    currentLanguage: number = 1033;
    onCreate(): void {
        this.switch.checked = true;
        let titleBarElement: HTMLElement = document.getElementById('default_title_bar');
        this.titleBar = new TitleBar(titleBarElement, this.container.documentEditor, true);
        this.container.documentEditor.open(JSON.stringify(languageSfdtData.englishSfdt));
        this.container.documentEditor.documentName = 'Spell Checking';

        // Configure spell checker defaults
        const spellChecker = this.container.documentEditor.spellChecker;
        spellChecker.languageID = 1033;
        spellChecker.removeUnderline = false;
        spellChecker.allowSpellCheckAndSuggestion = true;
        this.titleBar.updateDocumentTitle();
        this.titleBar.showButtons(false);
    }

    onDocumentChange(): void {
        if (!isNullOrUndefined(this.titleBar)) {
            this.titleBar.updateDocumentTitle();
        }
        this.container.documentEditor.focusIn();
    }
    onSelectionChange(): void {
        if (this.container.documentEditor.spellChecker.enableSpellCheck !== this.enableSpellingCheckBox.checked) {
            this.enableSpellingCheckBox.checked = this.container.documentEditor.spellChecker.enableSpellCheck;
            this.showSuggestionsCheckBox.disabled =
            this.showUnderlineCheckBox.disabled =
                !this.enableSpellingCheckBox.checked;
        }
        if (this.container.documentEditor.spellChecker.removeUnderline === this.showUnderlineCheckBox.checked) {
            this.showUnderlineCheckBox.checked = !this.container.documentEditor.spellChecker.removeUnderline;
        }
    }
    onChange(event: ChangeEventArgs): void {
        if (this.container && this.container.documentEditor) {
            this.container.documentEditor.spellChecker.languageID = event.value as number;
            let langData: string;
            if (this.container.documentEditor.spellChecker.languageID === 1033) {
                langData = JSON.stringify(languageSfdtData.englishSfdt);
            } else {
                langData = JSON.stringify(languageSfdtData.spanishSfdt);
            }
            this.container.documentEditor.open(langData);
        }
    }
    public changeEnableSpelling(args) : void{
        this.container.documentEditor.spellChecker.enableSpellCheck = args.checked;
        const isDisabled = !args.checked;
        (this.showUnderlineCheckBox as any).disabled = isDisabled;
        (this.showSuggestionsCheckBox as any).disabled = isDisabled;
    }
    public changeShowUnderline(args) : void{
        this.container.documentEditor.spellChecker.removeUnderline = !args.checked;
    }
    public changeShowSuggestions(args) : void{
        this.container.documentEditor.spellChecker.allowSpellCheckAndSuggestion = args.checked;
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